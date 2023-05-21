import * as path from "path";
import * as fs from "fs";
import { BriefcaseDb, IModelHost, IModelJsFs, RequestNewBriefcaseArg } from "@itwin/core-backend";
import { IModelBriefcaseApiService } from "../OpenTowerApis/IModelBriefcaseApiService"
import { IModelVersion } from "@itwin/core-common";
import axios, { AxiosResponse } from "axios";
import { Guid, OpenMode } from "@itwin/core-bentley";
import { ConnectorBriefcaseDb } from "../ConnectorBriefcaseDb";



export class OpenTowerBreifcaseService {

    private getIModelPath(iModelId: string) { return path.join(IModelHost.cacheDir + '/imodels', iModelId); }

    private getBriefcaseBasePath(iModelId: string) {
        return path.join(this.getIModelPath(iModelId), "briefcases");
    }

    private getFileName(reqArg: RequestNewBriefcaseArg) {
        return path.join(this.getBriefcaseBasePath(reqArg.iModelId), `${reqArg.briefcaseId}.bim`);
    }

    public downloadBriefcase = (reqArg: RequestNewBriefcaseArg, downloadArgs: any): Promise<any> => {
        return new Promise((resolve: any, reject: any) => {

            // get the local fileName for iModel Briefcase
            const briefcaseBasePath = this.getBriefcaseBasePath(reqArg.iModelId);
            // console.log(`local briefcaseBasePath: ${briefcaseBasePath}`)
            const fileName = path.join(briefcaseBasePath, `${reqArg.briefcaseId}.bim`);

            // console.log(`local filename: ${fileName}`)
            if (IModelJsFs.existsSync(fileName)) {
                console.log("IModel briefcase file already exists");
            }

            axios.get(downloadArgs.briefcaseDownloadUrl, { responseType: 'stream' })
                .then((contentRes: AxiosResponse) => {
                    fs.mkdirSync(briefcaseBasePath, { recursive: true });
                    const streamWriter = fs.createWriteStream(fileName);
                    contentRes.data.pipe(streamWriter);
                    let error: any = null;
                    streamWriter.on('error', err => {
                        error = err;
                        streamWriter.close();
                        reject(err.message);
                    });
                    streamWriter.on('close', () => {
                        if (!error) {
                            resolve(fileName);
                        }
                    });
                })
                .catch((error: any) => {
                    console.log('axios.get briefcaseDownloadUrl error');
                    console.log(typeof error);
                    reject(error.message);
                })

        });

    }

    public loadNativeDb = (localFileName: string, briefcaseId: any, access_token: string): Promise<ConnectorBriefcaseDb> => {
        return new Promise((resolve: any, reject: any) => {
            try {

                console.log(`briefcaseId => ${briefcaseId}`);
                console.log(`typeof briefcaseId => ${ typeof briefcaseId}`);
                // console.log(`localFileName => ${localFileName}`);
                const nativeDb = new IModelHost.platform.DgnDb();
                const db = nativeDb.openIModel(localFileName, OpenMode.ReadWrite);
                const openMode = OpenMode.ReadWrite;
                console.log(`nativeDb.getBriefcaseId() => ${nativeDb.getBriefcaseId()}`);
                nativeDb.resetBriefcaseId(briefcaseId*1);
                console.log("-----done");
                const briefcaseDb: ConnectorBriefcaseDb = new ConnectorBriefcaseDb({ nativeDb, key: Guid.createValue(), openMode, briefcaseId: briefcaseId, accessToken: access_token });
                // console.log('briefcaseDb');
                // console.log(briefcaseDb);
                resolve(briefcaseDb);

            } catch(e) {
                reject((e as any).message);
            }
        })
    }

    loadBriefcaseDb = (reqArg: RequestNewBriefcaseArg): Promise<ConnectorBriefcaseDb> => {

        const accessToken = reqArg.accessToken ?? '';

        return new Promise((resolve: any, reject: any) => {
            // acquire New BriefcaseId for process
            new IModelBriefcaseApiService().acquireNewBriefcaseId( "", accessToken, true, reqArg.iModelId)
                .then((acquiredBriefcaseRes: any) => {

                    // console.log("acquireBriefcase ressponse");
                    // console.log(res);
                    reqArg.briefcaseId = acquiredBriefcaseRes.briefcaseId;
                    this.downloadBriefcase(reqArg, acquiredBriefcaseRes)
                        .then((localFileName: string) => {

                            console.log("downliad success");
                            console.log(`download path: ${localFileName}`);

                            this.loadNativeDb(localFileName, acquiredBriefcaseRes.briefcaseId, reqArg.accessToken ?? '')
                                .then((briefcaseDb: ConnectorBriefcaseDb) => {
                                    console.log('briefcaseDb');
                                    console.log(briefcaseDb);


                                    resolve(briefcaseDb);
                                })
                                .catch((error: any) => {
                                    reject(error);
                                })

                        })
                        .catch((error: any) => {
                            console.log("inside reject case");
                            new IModelBriefcaseApiService().releaseNewBriefcaseId(reqArg.iModelId, acquiredBriefcaseRes.briefcaseId, accessToken)
                                .then((releaseResponse: any) => {
                                    console.log(releaseResponse);
                                    reject(error);
                                })
                                .catch((error: any) => {
                                    reject(error);
                                })
                        })
                })
                .catch((error: any) => {
                    reject(error);

                })
        })

    }

}