import { IModelOperations as ManagementIModelOperations } from "@itwin/imodels-client-management/lib/operations";
import { IModelsErrorCode } from "@itwin/imodels-client-management";
import { OpenTowerOperationOptions, OpenTowerClient } from "../OpenTowerClient";
import { BaselineFileOperations } from "./BaselineFileOperations";
import { OpenTowerIModelApiService } from "../../OpenTowerApis/IModelApiService";
import { IModelJsFs } from "@itwin/core-backend";
import { waitForCondition, IModelsErrorImpl } from "@itwin/imodels-client-management/lib/base/internal";

export class IModelOperations<TOptions extends OpenTowerOperationOptions> extends ManagementIModelOperations<TOptions> {
    private _baselineFileOperations;
    constructor(options: TOptions, _iModelsClient: OpenTowerClient) {
        super(options, _iModelsClient);
        this._baselineFileOperations = new BaselineFileOperations(options);
    }

    createFromBaseline = async (params: any) => {
        try {
            console.log("Inside the createFromBaseline method");
            console.log('params');
            console.log(params);
            const baselineFileSize = await this._options.localFileSystem?.getFileSize(params.iModelProperties.filePath);
            console.log(`baselineFileSize: `);
            console.log(baselineFileSize);
            // const createIModelRequestStructure = this.getCreateIModelFromBaselineRequestBody(params.iModelProperties);
            const createdIModel = await this.openTowerSendIModelPostRequest(params);
            params.iModelProperties.iModelId = createdIModel;

            console.log('createdIModel');
            console.log(createdIModel);

            console.log('params');
            console.log(params);

            // Acquire IModel Lock, to start Seed process
            const acquireIModelLock = await this.acquireIModelLock(params);
            console.log("acquireIModelLock");
            console.log(JSON.stringify(acquireIModelLock));


            // Initiate SeedFile Instance
            const seedFileRseponse = await this.initiateSeedFileInstance(params);
            console.log('seedFileRseponse');
            console.log(JSON.stringify(seedFileRseponse));

            const seedFileInstanceId = seedFileRseponse.changedInstance.instanceAfterChange.instanceId;
            console.log('seedFileInstanceId');
            console.log(seedFileInstanceId);

            params.iModelProperties.seedFileInstanceId = seedFileInstanceId;

            const updateResult = await this.updateSeedFileMetaData(params);
            console.log('updateResult');
            console.log(JSON.stringify(updateResult));

            params.iModelProperties.seedUploadUrl = updateResult.changedInstance.instanceAfterChange.relationshipInstances[0].relatedInstance.properties.UploadUrl;
            params.iModelProperties.FileId = updateResult.changedInstance.instanceAfterChange.properties.FileId;
            console.log(`seedUploadUrl`);
            console.log(params.iModelProperties.seedUploadUrl);

            console.log('params.iModelProperties.FileId');
            console.log(params.iModelProperties.FileId);

            const uploadResult = await this.uploadSeedFile(params);
            console.log("----");
            console.log('uploadResult');
            console.log(uploadResult);

            const statusUploadStatus = await this.updateIModelSeedFileUploadedStatus(params);
            console.log("statusUploadStatus");
            console.log(JSON.stringify(statusUploadStatus));


            const processStatus =  await this.waitForBaselineFileInitialization(params);

            console.log('processStatus');
            console.log(processStatus);


            // (0, CommonFunctions_1.assertLink)(createdIModel._links.upload);
            // const uploadUrl = createdIModel._links.upload.href;
            // await this._options.cloudStorage.upload({
            //     url: uploadUrl,
            //     data: params.iModelProperties.filePath
            // });
            // (0, CommonFunctions_1.assertLink)(createdIModel._links.complete);
            // const confirmUploadUrl = createdIModel._links.complete.href;
            // await this.sendPostRequest({
            //     authorization: params.authorization,
            //     url: confirmUploadUrl,
            //     body: undefined
            // });
            // await this.waitForBaselineFileInitialization({
            //     authorization: params.authorization,
            //     iModelId: createdIModel.id
            // });
            // return this.getSingle({
            //     authorization: params.authorization,
            //     iModelId: createdIModel.id
            // });
            // throw new Error("Test Error");
            return { id: createdIModel };
        } catch (e) {
            throw new Error((e as any).message);
        }

    }
    // getCreateIModelFromBaselineRequestBody(iModelProperties: any) {
    //     console.log('iModelProperties');
    //     console.log(iModelProperties);
    //     // return {
    //     //     ...this.getCreateEmptyIModelRequestBody(iModelProperties),
    //     //     baselineFile: {
    //     //         size: baselineFileSize
    //     //     }
    //     // };
    // }

    openTowerSendIModelPostRequest = async (params: any): Promise<any> => {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const tokenResponse: any = await params.authorization();
                const url = this._options.urlFormatter?.getOpenTowerCreateIModelUrl(params.iModelProperties);
                console.log(`POST URL: ${url}`);
                const accessToken: string = tokenResponse.scheme + " " + tokenResponse.token;
                new OpenTowerIModelApiService().createIModel(accessToken, params.iModelProperties.name, url)
                    .then((iModelGuid: any) => {
                        resolve(iModelGuid);
                    })
                    .catch((error: any) => {
                        reject(error);
                    })
            } catch (e) {
                console.log(`Error inside openTowerSendIModelPostRequest method`);
                console.log(e)
                reject((e as any).message)
            }
        })

    }

    acquireIModelLock = async (params: any): Promise<any> => {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const tokenResponse: any = await params.authorization();
                const url = this._options.urlFormatter?.getOpenTowerIModelLockUrl(params.iModelProperties);
                console.log(`acquireIModelLock POST URL: ${url}`);
                const accessToken: string = tokenResponse.scheme + " " + tokenResponse.token;
                new OpenTowerIModelApiService().acquireIModelLock(accessToken, url)
                    .then((res: any) => {
                        resolve(res);
                    })
                    .catch((error: any) => {
                        reject(error);
                    })

            } catch (e) {
                console.log(`Error inside acquireIModelLock method`);
                console.log(e)
                reject((e as any).message)
            }
        })
    }

    releaseIModelLock = async (params: any): Promise<any> => {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const tokenResponse: any = await params.authorization();
                const url = this._options.urlFormatter?.getOpenTowerReleaseIModelLockUrl(params.iModelProperties);
                console.log(`releaseIModelLock DELETE URL: ${url}`);
                const accessToken: string = tokenResponse.scheme + " " + tokenResponse.token;
                new OpenTowerIModelApiService().releaseIModelLock(accessToken, url)
                    .then((res: any) => {
                        resolve(res);
                    })
                    .catch((error: any) => {
                        reject(error);
                    })

            } catch (e) {
                console.log(`Error inside releaseIModelLock method`);
                console.log(e)
                reject((e as any).message)
            }
        })
    }

    initiateSeedFileInstance = async (params: any): Promise<any> => {
        return new Promise(async (resolve: any, reject: any) => {
            try {

                const tokenResponse: any = await params.authorization();
                const url = this._options.urlFormatter?.getIModelSeederFileInfoUrl(params.iModelProperties);
                console.log(`initiateSeedFileInstance POST URL: ${url}`);
                const accessToken: string = tokenResponse.scheme + " " + tokenResponse.token;
                new OpenTowerIModelApiService().getIModelSeedFileInstance(accessToken, url)
                    .then((res: any) => {
                        resolve(res);
                    })
                    .catch((error: any) => {
                        reject(error);
                    })

            } catch (e) {
                console.log(`Error inside initiateSeedFileInstance method`);
                console.log(e)
                reject((e as any).message)
            }
        })

    }

    updateSeedFileMetaData = async (params: any): Promise<any> => {
        return new Promise(async (resolve: any, reject: any) => {
            try {

                const tokenResponse: any = await params.authorization();
                const url = this._options.urlFormatter?.getUpdateIModelSeederFileInfoUrl(params.iModelProperties);
                console.log(`updateSeedFileMetaData POST URL: ${url}`);
                const accessToken: string = tokenResponse.scheme + " " + tokenResponse.token;
                console.log(`params.iModelProperties.filePath => ${params.iModelProperties.filePath}`)
                const fileName = (params.iModelProperties.filePath.split("/")).pop();
                console.log(`fileName => ${fileName}`);

                const fileStats: any = IModelJsFs.lstatSync(params.iModelProperties.filePath);
                console.log('fileStats');
                console.log(fileStats);
                let requestBody: any = {
                    "instance": {
                        "instanceId": params.iModelProperties.seedFileInstanceId,
                        "schemaName": "iModelScope",
                        "className": "SeedFile",
                        "properties": {
                            "FileName": fileName,
                            "FileDescription": "Basic setup file",
                            "FileSize": fileStats.size,
                        }
                    }
                }
                new OpenTowerIModelApiService().updateIModelSeedFileInstance(accessToken, url, requestBody)
                    .then((res: any) => {
                        resolve(res);
                    })
                    .catch((error: any) => {
                        reject(error);
                    })

            } catch (e) {
                console.log(`Error inside initiateSeedFileInstance method`);
                console.log(e)
                reject((e as any).message)
            }
        })
    }
    uploadSeedFile = async (params: any): Promise<any> => {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const result = await this._options.cloudStorage.upload({
                    url: params.iModelProperties.seedUploadUrl,
                    data: params.iModelProperties.filePath
                })

                console.log("uploadSeedFile response");
                console.log(result);
                resolve(result);


            } catch (e) {
                console.log(`Error inside uploadSeedFile method`);
                console.log(e)
                reject((e as any).message)
            }
        })
    }

    updateIModelSeedFileUploadedStatus = async (params: any): Promise<any> => {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                const tokenResponse: any = await params.authorization();
                const url = this._options.urlFormatter?.getUpdateIModelSeederFileInfoUrl(params.iModelProperties);
                console.log(`updateIModelSeedFileUploadedStatus POST URL: ${url}`);
                const accessToken: string = tokenResponse.scheme + " " + tokenResponse.token;
                console.log(`params.iModelProperties.filePath => ${params.iModelProperties.filePath}`)
                const fileName = (params.iModelProperties.filePath.split("/")).pop();
                console.log(`fileName => ${fileName}`);

                const fileStats: any = IModelJsFs.lstatSync(params.iModelProperties.filePath);
                console.log('fileStats');
                console.log(fileStats);
                let requestBody: any = {
                    "instance": {
                        "instanceId": params.iModelProperties.seedFileInstanceId,
                        "schemaName": "iModelScope",
                        "className": "SeedFile",
                        "properties": {
                            "FileName": fileName,
                            "FileId": params.iModelProperties.FileId,
                            "IsUploaded": true,
                        }
                    }
                }
                new OpenTowerIModelApiService().updateIModelSeedFileInstance(accessToken, url, requestBody)
                    .then((res: any) => {
                        resolve(res);
                    })
                    .catch((error: any) => {
                        reject(error);
                    })


            } catch (e) {
                console.log(`Error inside updateIModelSeedFileUploadedStatus method`);
                console.log(e)
                reject((e as any).message)
            }
        })
    }

    private wait = (ms: number) => new Promise((resolve: any) => {
        setTimeout(() => resolve("next call"), ms);
    });

    waitForBaselineFileInitialization = async(params: any): Promise<any> => {


            try {
                const tokenResponse: any = await params.authorization();
                const url = this._options.urlFormatter?.getUpdateIModelSeederFileInfoUrl(params.iModelProperties);
                console.log(`waitForBaselineFileInitialization POST URL: ${url}`);
                const accessToken: string = tokenResponse.scheme + " " + tokenResponse.token;
                const result = await new OpenTowerIModelApiService().getIModelSeedFileInfo(accessToken, url)
                const state = result.instances[0].properties.InitializationState;
                console.log('state');
                console.log(state);
                if (state == 0) {
                    return true;
                } else {

                    await this.wait(1000);

                    return this.waitForBaselineFileInitialization(params)
                }
            } catch(e) {
                console.log(`Error inside waitForBaselineFileInitialization method`);
                console.log(e)
                throw new Error((e as any).message);
            }


        // // Return a fetch request
        // return fetch(url, options).then(res => {
        //   // check if successful. If so, return the response transformed to json
        //   if (res.ok) return res.json()
        //   // else, return a call to fetchRetry
        //   return fetchRetry(url, options)
        // })
    }



}