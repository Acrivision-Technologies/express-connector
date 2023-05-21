import * as fs from "fs";
import * as path from "path";

import type { SubjectProps } from "@itwin/core-common";
import { IModel } from "@itwin/core-common";
import type { AccessToken, Id64Arg, Id64String } from "@itwin/core-bentley";
import { BentleyError, IModelHubStatus } from "@itwin/core-bentley";
import { assert, BentleyStatus, Logger, LogLevel } from "@itwin/core-bentley";
import { BisCoreSchema, BriefcaseDb, CreateNewIModelProps, IModelHost, RequestNewBriefcaseArg } from "@itwin/core-backend";
import { LinkElement, Subject, SubjectOwnsSubjects, SynchronizationConfigLink } from "@itwin/core-backend";
import { NodeCliAuthorizationClient } from "@itwin/node-cli-authorization";
import { BaseConnector, LoggerCategories, Synchronizer } from "@itwin/connector-framework";
import { ConnectorIssueReporter } from "@itwin/connector-framework/lib/src/ConnectorIssueReporter";

import { AllArgsProps, HubArgs, JobArgs } from "./ConnectorArgs";
import { createNewConnectorIModel } from "./iModel/ProjectIModel";
import { getTokenInteractive } from "./iModel/Authorization";
import { loadBriefcaseDb } from "./iModel/BriefcaseDb";
import { KnownLocations } from "./KnownLocations";
import { CreateNamedVersionParams, IModelsClient, NamedVersionPropertiesForCreate } from "@itwin/imodels-client-authoring";
import { AccessTokenAdapter } from "@itwin/imodels-access-backend";
import { OpenTowerIModelApiService } from "./OpenTowerApis/IModelApiService";
import { OpenTowerBreifcaseService } from "../Connector/Service/OpenTowerBreifcaseService";
import { iModelLocksApiService } from "./OpenTowerApis/iModelLocksApiService";
// import ConnectorBriefcaseManager from "./ConnectorBriefcaseManager";
import { ConnectorBriefcaseDb } from "./ConnectorBriefcaseDb";
// import { KnownLocations } from "./KnownLocations";


enum BeforeRetry { Nothing = 0, PullMergePush = 1 }

export class ConnectorRunner {

    private _jobArgs: JobArgs;
    private _hubArgs?: HubArgs;

    private _db?: ConnectorBriefcaseDb;
    private _connector?: BaseConnector;
    private _issueReporter?: ConnectorIssueReporter;
    private _reqContext?: AccessToken;

    /**
   * @throws Error when jobArgs or/and hubArgs are malformated or contain invalid arguments
   */
    constructor(jobArgs: JobArgs, clientAccessToken: string, hubArgs?: HubArgs) {
        if (!jobArgs.isValid)
            throw new Error("Invalid jobArgs");
        this._jobArgs = jobArgs;

        if (hubArgs) {
            // console.log(hubArgs.isValid);
            if (!hubArgs.isValid)
                throw new Error("Invalid hubArgs");
            this._hubArgs = hubArgs;
        }

        this._reqContext = clientAccessToken

        // console.log("inside the consturctor");
        // console.log('this._jobArgs');
        // console.log(this._jobArgs);
        // console.log('this._hubArgs');
        // console.log(this._hubArgs);

        Logger.initializeToConsole();
        const { loggerConfigJSONFile } = jobArgs;
        if (loggerConfigJSONFile && path.extname(loggerConfigJSONFile) === ".json" && fs.existsSync(loggerConfigJSONFile))
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            Logger.configureLevels(require(loggerConfigJSONFile));
        else
            Logger.setLevelDefault(LogLevel.Info);
    }

    public get jobArgs(): JobArgs {
        return this._jobArgs;
    }

    public get hubArgs(): HubArgs {
        if (!this._hubArgs)
            throw new Error(`DummyConnectorRunner.hubArgs is not defined for current iModel with type = ${this.jobArgs.dbType}.`);
        return this._hubArgs;
    }

    public set issueReporter(reporter: ConnectorIssueReporter) {
        this._issueReporter = reporter;
    }

    public get jobSubjectName(): string {
        let name = this.jobArgs.jobSubjectName;

        const connectorArgs = this.jobArgs.connectorArgs;
        if (connectorArgs && connectorArgs.pcf && connectorArgs.pcf.subjectNode)
            name = connectorArgs.pcf.subjectNode;

        return name;
    }

    public get db(): ConnectorBriefcaseDb {
        if (!this._db)
            throw new Error("ConnectorBriefcaseDb has not been loaded.");
        return this._db;
    }

    public get connector(): BaseConnector {
        if (!this._connector)
            throw new Error("Connector has not been loaded.");
        return this._connector;
    }

    /**
    * Generates a ConnectorRunner instance from json body
    * @param json
    * @returns ConnectorRunner
    * @throws Error when content does not include "jobArgs" as key
    */
    public static fromJSON(json: AllArgsProps, clientAccessToken: string): ConnectorRunner {
        // console.log("fromJSON")
        // console.log(json);
        const supportedVersion = "0.0.1";
        if (!json.version || json.version !== supportedVersion)
            throw new Error(`Arg file has invalid version ${json.version}. Supported version is ${supportedVersion}.`);

        // __PUBLISH_EXTRACT_START__ ConnectorRunner-constructor.example-code
        if (!(json.jobArgs))
            throw new Error("jobArgs is not defined");
        const jobArgs = new JobArgs(json.jobArgs);

        let hubArgs: HubArgs | undefined;
        // console.log('json.hubArgs');
        // console.log(json.hubArgs);
        if (json.hubArgs)
            hubArgs = new HubArgs(json.hubArgs);

        // console.log("here")

        const runner = new ConnectorRunner(jobArgs, clientAccessToken, hubArgs);
        // __PUBLISH_EXTRACT_END__

        return runner;
    }

    /**
   * Safely executes a connector job
   * This method does not throw any errors
   * @returns BentleyStatus
   */
    public async run(connector: string, inputfileName: string, iModelName: string): Promise<any> {
        return new Promise(async (resolve: any, reject: any) => {

            try {

                // const iModelGuid: any = await this.runUnsafe(connector, inputfileName, iModelName, access_token);
                this.runUnsafe(connector, inputfileName, iModelName)
                    .then(async (iModelGuid: string) => {
                        console.log('********* iModelGuid');
                        console.log(typeof iModelGuid);
                        console.log(iModelGuid);
                        // response.runStatus = BentleyStatus.SUCCESS;
                        // response.iModelGuid = iModelGuid;
                        await this.onFinish();
                        resolve(iModelGuid);

                    })
                    .catch(async (error: any) => {
                        console.log("===============+++++++++++++++++++++++++")
                        const msg = error;
                        Logger.logError(LoggerCategories.Framework, msg);
                        Logger.logError(LoggerCategories.Framework, `Failed to execute connector module - ${connector}`);
                        this.connector.reportError(this.jobArgs.stagingDir, msg, "ConnectorRunner", "Run", LoggerCategories.Framework);
                        // response.runStatus = BentleyStatus.ERROR
                        await this.onFailure(error);
                        await this.onFinish();
                        reject(error);

                    })

            } catch (err) {
                console.log("===============")
                const msg = (err as any).message;
                Logger.logError(LoggerCategories.Framework, msg);
                Logger.logError(LoggerCategories.Framework, `Failed to execute connector module - ${connector}`);
                this.connector.reportError(this.jobArgs.stagingDir, msg, "ConnectorRunner", "Run", LoggerCategories.Framework);
                // response.runStatus = BentleyStatus.ERROR
                await this.onFailure(err);
                await this.onFinish();
                reject(msg);
            }
        })
    }

    private async onFailure(err: any) {
        try {
            if (this._db && this._db.isBriefcaseDb()) {
                this._db.abandonChanges();
                // await this.db.releaseAllLocks();
                console.log("++++++++++")
            }
        } catch (err1) {
            // don't allow a further exception to prevent onFailure from reporting and returning. We need to finish the abend sequence.
            // eslint-disable-next-line no-console
            console.error(err1);
        } finally {
            try {
                this.recordError(err);
            } catch (err2) {
                // eslint-disable-next-line no-console
                console.error(err2);
            }
        }
    }

    public recordError(err: any) {
        const errorFile = this.jobArgs.errorFile;
        const errorStr = JSON.stringify({
            id: this._connector?.getConnectorName() ?? "",
            message: "Failure",
            description: err.message,
            extendedData: err,
        });
        fs.writeFileSync(errorFile, errorStr);
        Logger.logInfo(LoggerCategories.Framework, `Error recorded at ${errorFile}`);
    }

    private async onFinish() {
        if (this._db) {
            this._db.abandonChanges();

            this.connector?.onClosingIModel?.();

            this._db.close();
        }

        if (this._connector && this.connector.issueReporter)
            await this.connector.issueReporter.publishReport();
    }

    private async runUnsafe(connector: string, inputfileName: string, iModelName: string): Promise<any> {

        return new Promise(async (resolve: any, reject: any) => {

            try {
                console.log(`iModelName => ${iModelName}`);

                let iModelGuid: string = "";
                Logger.logInfo(LoggerCategories.Framework, "Connector job has started");

                // load

                Logger.logInfo(LoggerCategories.Framework, "Loading connector...");
                this._connector = await require(connector).default.create();

                console.log('inputfileName');
                console.log(inputfileName);

                console.log('this._connector');
                console.log(this._connector);

                Logger.logInfo(LoggerCategories.Framework, "Authenticating...");
                console.log('this._reqContext');
                console.log(this._reqContext);

                iModelGuid = await createNewConnectorIModel(this._hubArgs?.projectGuid, this._reqContext, iModelName);

                console.log(`iModelGuid => ${iModelGuid}`);
                this.hubArgs.iModelGuid = iModelGuid;   
                
                const reqArg: RequestNewBriefcaseArg = { iTwinId: this.hubArgs.projectGuid, iModelId: this.hubArgs.iModelGuid, accessToken: this._reqContext };
                new OpenTowerBreifcaseService().loadBriefcaseDb(reqArg)
                    .then(async (briefcaseDb: ConnectorBriefcaseDb) => {
                        this._db = briefcaseDb;


                        Logger.logInfo(LoggerCategories.Framework, "Loading synchronizer...");
                        const synchronizer = new Synchronizer(this.db, false, this._reqContext);
                        this.connector.synchronizer = synchronizer;

                        // Register BisCoreSchema
                        BisCoreSchema.registerSchema();


                        Logger.logInfo(LoggerCategories.Framework, "Writing configuration and opening source data...");
                        const synchConfig = await this.doInRepositoryChannel(
                            async () => {
                                const config = this.insertSynchronizationConfigLink();
                                this.connector.connectorArgs = this.jobArgs.connectorArgs;                
                                await this.connector.openSourceData(path.join(KnownLocations.assetsDir, "sampleFiles", inputfileName));
                                // console.log("opening imodel")
                                const imodelStatus = await this.connector.onOpenIModel();
                                console.log('imodelStatus');
                                console.log(imodelStatus);
                                // console.log("imodel openend")
                                return "config done";
                            },
                            "Write configuration and open source data."
                        );

                        Logger.logInfo(LoggerCategories.Framework, "Importing domain schema...");
                        await this.doInRepositoryChannel(
                            async () => {
                                return this.connector.importDomainSchema(this._reqContext);
                            },
                            "Write domain schema."
                        );

                        // Logger.logInfo(LoggerCategories.Framework, "Importing dynamic schema...");
                        // await this.doInRepositoryChannel(
                        //     async () => {
                        //         return this.connector.importDynamicSchema(await this._reqContext);
                        //     },
                        //     "Write dynamic schema."
                        // );

                        resolve("All Done");


                    })
                    .catch((error: any) => {
                        console.log('OpenTowerBreifcaseService loadBriefcaseDb error');
                        console.log(typeof error);
                        reject(error);
                    })
                    
            //    const newbriefcaseId: any =  await loadBriefcaseDb(this.hubArgs, this._reqContext ?? '')
            
            //     console.log('____newbriefcaseId');
            //     console.log(newbriefcaseId)




                        




            } catch (e) {
                console.log("&&&&& runUnsafe catch case");
                console.log(e);
                reject(e)
            }

        })


    }

    private async acquireLocks(arg: { shared?: Id64Arg, exclusive?: Id64Arg }): Promise<void> {
        const isStandalone = this.jobArgs.dbType === "standalone";
        if (isStandalone || !this.db.isBriefcaseDb())
            return;


        return this.doWithRetries(async () => this.db.locks.acquireLocks(arg), BeforeRetry.PullMergePush);
    }

    private async doWithRetries(task: () => Promise<void>, beforeRetry: BeforeRetry): Promise<void> {
        // console.log("inside the doWithRetries method");
        // console.log(`task`);
        // console.log(task);
        let count = 0;
        do {
            try {
                await task();
                return;
            } catch (err) {
                console.log(`Error case occured`);
                console.log(err);
                if (!this.shouldRetryAfterError(err))
                    throw err;
                if (++count > this.hubArgs.maxLockRetries)
                    throw err;
                const sleepms = Math.random() * this.hubArgs.maxLockRetryWaitSeconds * 1000;
                await new Promise((resolve) => setTimeout(resolve, sleepms));

                if (beforeRetry === BeforeRetry.PullMergePush) {
                    assert(this.db.isBriefcaseDb());
                    // await this.db.pullChanges(); // do not catch!
                    // await this.db.pushChanges({ description: "" }); // "
                }
            }
        } while (true);
    }
    private shouldRetryAfterError(err: unknown): boolean {
        if (!(err instanceof BentleyError))
            return false;
        return err.errorNumber === IModelHubStatus.LockOwnedByAnotherBriefcase;
    }

    private async doInRepositoryChannel<R>(task: () => Promise<R>, message: string): Promise<any> {
        try {
            console.log(`IModel.rootSubjectId`);
            console.log(IModel.rootSubjectId);
            await this.acquireLocks({ exclusive: IModel.rootSubjectId });
    
            // console.log("---")
            const result = await task();
            console.log("task Result");
            await this.persistChanges(message);
            // console.log("final")
            return 'result';
            // return result;
        } catch(e) {
            console.log(`doInRepositoryChannel error`);
            console.log(e);
            throw new Error((e as any).message);

        }
    }

    private async doInConnectorChannel<R>(jobSubject: Id64String, task: () => Promise<R>, message: string): Promise<R> {
        await this.acquireLocks({ exclusive: jobSubject });  // automatically acquires shared lock on root subject (the parent/model)
        const result = await task();
        await this.persistChanges(message);
        return result;
    }

    private async persistChanges(changeDesc: string) {
        console.log("inside the persistChanges");
        const { revisionHeader } = this.jobArgs;
        const comment = `${revisionHeader} - ${changeDesc}`;
        const isStandalone = this.jobArgs.dbType === "standalone";
        if (!isStandalone && this.db.isBriefcaseDb()) {
            console.log("inside not standalone case");
            this._db = this.db;
            // console.log(this._db);
            await this.db.pullChanges({ accessToken: this._reqContext, iMoodelId: this._hubArgs?.iModelGuid });
            console.log("changes pulled");
            console.log('comment');
            console.log(comment);
            this.db.saveChanges(comment);
            console.log("db changes saved");

            await this.db.pushChanges({ description: comment, accessToken: this._reqContext, iMoodelId: this._hubArgs?.iModelGuid });

            console.log("db cahnges pushed")
            await this.db.releaseAllLocks(); // in case there were no changes
            console.log("db changes released")
        } else {
            this.db.saveChanges(comment);
        }
    }

    // Custom Methods
    private insertSynchronizationConfigLink() {
        console.log("inside the insertSynchronizationConfigLink");
        console.log(IModel.repositoryModelId);
        let synchConfigData = {
            classFullName: SynchronizationConfigLink.classFullName,
            model: IModel.repositoryModelId,
            code: LinkElement.createCode(this.db, IModel.repositoryModelId, "SynchConfig"),
        };
        console.log('XxXXXxxxxlllll----------')
        if (this.jobArgs.synchConfigFile) {
            synchConfigData = require(this.jobArgs.synchConfigFile);
        }
        const prevSynchConfigId = this.db.elements.queryElementIdByCode(
            LinkElement.createCode(this.db, IModel.repositoryModelId, "SynchConfig")
        );
        console.log(`prevSynchConfigId`);
        console.log(prevSynchConfigId);
        console.log('synchConfigData');
        console.log(synchConfigData);
        let idToReturn: any;
        if (prevSynchConfigId === undefined) {
            console.log("first case");
            const queyrResult = this.db.elements.createElement(synchConfigData);
            console.log('queyrResult')
            console.log(queyrResult)
            idToReturn = queyrResult.id;
        } else {
            console.log("second case");
            this.updateSynchronizationConfigLink(prevSynchConfigId);
            idToReturn = prevSynchConfigId;
        }

        console.log('-----------------insertSynchronizationConfigLink idToReturn');
        console.log(idToReturn);
        return idToReturn;
    }

    private updateSynchronizationConfigLink(synchConfigId: string) {
        // console.log(`inside the updateSynchronizationConfigLink method`);
        // console.log(`synchConfigId: ${synchConfigId}`)
        const synchConfigData = {
            id: synchConfigId,
            classFullName: SynchronizationConfigLink.classFullName,
            model: IModel.repositoryModelId,
            code: LinkElement.createCode(this.db, IModel.repositoryModelId, "SynchConfig"),
            lastSuccessfulRun: Date.now().toString(),
        };

        // console.log('synchConfigData');
        // console.log(synchConfigData);
        this.db.elements.updateElement(synchConfigData);
    }

    private async updateJobSubject(): Promise<Subject> {
        console.log("inside updateJobSubject");
        console.log(`jobSubjectName= => ${this.jobSubjectName}`);
        const code = Subject.createCode(this.db, IModel.rootSubjectId, this.jobSubjectName);

        console.log(`Subject code`);
        console.log(code);
        const existingSubjectId = this.db.elements.queryElementIdByCode(code);

        console.log(`existingSubjectId => `);
        console.log(existingSubjectId);

        let subject: Subject;

        if (existingSubjectId) {
            subject = this.db.elements.getElement<Subject>(existingSubjectId);
        } else {
            /* eslint-disable @typescript-eslint/naming-convention */
            const jsonProperties: any = {
                Subject: {
                    Job: {
                        Properties: {
                            ConnectorVersion: this.connector.getApplicationVersion(),
                            ConnectorType: "JSConnector",
                        },
                        Connector: this.connector.getConnectorName(),
                    },
                },
            };
            /* eslint-disable @typescript-eslint/naming-convention */

            console.log(`Subject jsonProperties`);
            console.log(jsonProperties);

            const root = this.db.elements.getRootSubject();

            console.log(`root subject`);
            console.log(root);

            const subjectProps: SubjectProps = {
                classFullName: Subject.classFullName,
                model: root.model,
                code,
                jsonProperties,
                parent: new SubjectOwnsSubjects(root.id),
            };
            const newSubjectId = this.db.elements.insertElement(subjectProps);
            console.log(`newSubjectId`);
            console.log(newSubjectId);
            subject = this.db.elements.getElement<Subject>(newSubjectId);
        }

        this.connector.jobSubject = subject;
        this.connector.synchronizer.jobSubjectId = subject.id;
        return subject;
    }

    private updateProjectExtent() {
        const res = this.db.computeProjectExtents({
            reportExtentsWithOutliers: true,
            reportOutliers: true,
        });
        this.db.updateProjectExtents(res.extents);
    }

    private updateDeletedElements() {
        console.log("inside updateDeletedElements")
        console.log("shouldDeleteElements : ", this.connector.shouldDeleteElements())
        // if (this.connector.shouldDeleteElements())
        // this.connector.synchronizer.detectDeletedElements();
    }

    private createNamedVersionFromLatestChangeSet = async () => {

        const latestChangeSet = await IModelHost.hubAccess.getLatestChangeset({ iModelId: this.hubArgs.iModelGuid, accessToken: this._reqContext });
        console.log('latestChangeSet');
        console.log(latestChangeSet);

        const imodelClient = new IModelsClient();
        const namedVersionProperties: NamedVersionPropertiesForCreate = {
            name: "Initial Named Version",
            description: "Try to see it",
            changesetId: latestChangeSet.id
        }


        const getAuthorizationCallback = () => {
            return async () => {
                return AccessTokenAdapter.toAuthorization(this._reqContext!);
            };
        }
        const namedVersionProps: CreateNamedVersionParams = {
            namedVersionProperties,
            iModelId: this.hubArgs.iModelGuid,
            authorization: getAuthorizationCallback()
        }
        const namedVersionResult = await imodelClient.namedVersions.create(namedVersionProps);

        console.log('namedVersionResult');
        console.log(namedVersionResult);
    }


}