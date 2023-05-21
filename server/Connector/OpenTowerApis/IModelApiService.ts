import { OpenTowerIModelCreateDto } from "./Interfaces/IModelApiInterface";
import * as date from 'date-and-time';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

export class OpenTowerIModelApiService {

    private clientEndPoint: string = "https://imodelhubapi.bentley.com"; 
    // private clientEndPoint: string = "https://dev-api-eus-apim-01.azure-api.net/imodelhub"; 
    private apiVersion: string = "sv1.1";
    private createIModelRequestPath = "Repositories/Context--{ContextId}/ContextScope/iModel";

    private defaultIModelCreateRequestBody: OpenTowerIModelCreateDto = {
        "instance": {
            "schemaName": "ContextScope",
            "className": "iModel",
            "properties": {
                "Name": "Test",
                "Description": "Test IModel created from swagger",
                // "UserCreated": "5dc89132-5f63-426f-9a8f-32488a59aee9",
                // "CreatedDate": "2023-05-11T04:48:06.833Z",
                // "DataLocationId": "99999999-9999-9999-9999-999999999999",
                "Initialized": true,
                "Type": 0,
                "Extent": [
                    0,
                    0,
                    0,
                    0
                ],
                "Secured": true,
                "Shared": false
            }
        }
    }


    createIModel = (accessToken: any, iModelName: string, url: string): Promise<any> => {
        console.log("********** OpenTowerIModelApiService:createIModel method ")
        return new Promise((resolve: any, reject: any) => {
            try {
                let requestBody: OpenTowerIModelCreateDto = JSON.parse(JSON.stringify(this.defaultIModelCreateRequestBody));
                requestBody.instance.properties.Name = iModelName;

                const requestConfig: AxiosRequestConfig = {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": accessToken
                    }
                }

                axios.post(url, JSON.parse(JSON.stringify(requestBody)), requestConfig)
                    .then((res: AxiosResponse) => {

                        // console.log('axios res');
                        // console.log(res);
                        let iModelGuid = "";
                        if(res.data.changedInstance) {
                            iModelGuid = res.data.changedInstance.instanceAfterChange.instanceId;
                        }
                        resolve(iModelGuid);
                    })
                    .catch((error: AxiosError) => {
                        // console.log('axios error');
                        // console.log(error);
                        let errorMsg = "";
                        if(error.code) {
                            errorMsg += `${error.code}: `;
                        }
                        if(error.message) {
                            errorMsg += error.message
                        }

                        console.log("errorMsg *******");
                        console.log(errorMsg);
                        reject(errorMsg);

                    })


            } catch (e) {
                console.log(e);
                reject((e as any).message);

            }



        })



    }


    acquireIModelLock = (accessToken: any, url: string): Promise<any> => {
        console.log("********** OpenTowerIModelApiService:acquireIModelLock method ")
        return new Promise((resolve: any, reject: any) => {
            try {
                const requestConfig: AxiosRequestConfig = {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": accessToken
                    }
                }
                axios.post(url, {}, requestConfig)
                    .then((res: AxiosResponse) => {
                        // console.log('axios res');
                        // console.log(res);
                        // let iModelGuid = "";
                        // if(res.data.changedInstance) {
                        //     iModelGuid = res.data.changedInstance.instanceAfterChange.instanceId;
                        // }
                        // resolve(iModelGuid);
                        console.log("acquireIModelLock");
                        console.log(res.data);
                        resolve("IModel Lock Acquired");
                    })
                    .catch((error: AxiosError) => {
                        // console.log('axios error');
                        // console.log(error);
                        let errorMsg = "";
                        if(error.code) {
                            errorMsg += `${error.code}: `;
                        }
                        if(error.message) {
                            errorMsg += error.message
                        }
                        console.log("errorMsg *******");
                        console.log(errorMsg);
                        reject(errorMsg);

                    })
            } catch (e) {
                console.log(e);
                reject((e as any).message);

            }
        })



    }

    releaseIModelLock = (accessToken: any, url: string): Promise<any> => {
        // instanceId is always iModelLock
        console.log("********** OpenTowerIModelApiService:releaseIModelLock method ")
        return new Promise((resolve: any, reject: any) => {
            try {
                const requestConfig: AxiosRequestConfig = {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": accessToken
                    }
                }
                axios.delete(url, requestConfig)
                    .then((res: AxiosResponse) => {
                        console.log('releaseIModelLock');
                        console.log(res.data);
                        resolve("IModel Lock Deleted");
                    })
                    .catch((error: AxiosError) => {
                        // console.log('axios error');
                        // console.log(error);
                        let errorMsg = "";
                        if(error.code) {
                            errorMsg += `${error.code}: `;
                        }
                        if(error.message) {
                            errorMsg += error.message
                        }
                        console.log("errorMsg *******");
                        console.log(errorMsg);
                        reject(errorMsg);

                    })
            } catch (e) {
                console.log(e);
                reject((e as any).message);

            }
        })



    }

    getIModelSeedFileInstance = (accessToken: string, url: string): Promise<any> => {
        return new Promise((resolve: any, reject: any) => {
            try {

                const requestConfig: AxiosRequestConfig = {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": accessToken
                    }
                }

                axios.post(url, {}, requestConfig)
                    .then((res: AxiosResponse) => {
                        console.log('res.data');
                        console.log(res.data);
                        // let iModelGuid = "";
                        // if(res.data.instances) {
                        //     iModelGuid = res.data.instances.properties.FileId;
                        // }
                        resolve(res.data);
                    })
                    .catch((error: AxiosError) => {
                        // console.log('axios error');
                        // console.log(error);
                        let errorMsg = "";
                        if(error.code) {
                            errorMsg += `${error.code}: `;
                        }
                        if(error.message) {
                            errorMsg += error.message
                        }

                        console.log("errorMsg *******");
                        console.log(errorMsg);
                        reject(errorMsg);

                    })


            } catch (e) {
                console.log(e);
                reject((e as any).message);

            }
        })
    }

    getIModelSeedFileInfo = (accessToken: string, url: string): Promise<any> => {
        return new Promise((resolve: any, reject: any) => {
            try {

                const requestConfig: AxiosRequestConfig = {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": accessToken
                    }
                }

                axios.get(url, requestConfig)
                    .then((res: AxiosResponse) => {
                        console.log('res.data');
                        console.log(res.data);
                        // let iModelGuid = "";
                        // if(res.data.instances) {
                        //     iModelGuid = res.data.instances.properties.FileId;
                        // }
                        resolve(res.data);
                    })
                    .catch((error: AxiosError) => {
                        // console.log('axios error');
                        // console.log(error);
                        let errorMsg = "";
                        if(error.code) {
                            errorMsg += `${error.code}: `;
                        }
                        if(error.message) {
                            errorMsg += error.message
                        }

                        console.log("errorMsg *******");
                        console.log(errorMsg);
                        reject(errorMsg);

                    })


            } catch (e) {
                console.log(e);
                reject((e as any).message);

            }
        })
    }

    updateIModelSeedFileInstance = (accessToken: string, url: string, requestBody: any): Promise<any> => {
        return new Promise((resolve: any, reject: any) => {
            try {

                const requestConfig: AxiosRequestConfig = {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": accessToken
                    }
                }

                axios.post(url,  JSON.parse(JSON.stringify(requestBody)), requestConfig)
                    .then((res: AxiosResponse) => {
                        console.log('res.data');
                        console.log(res.data);
                        // let iModelGuid = "";
                        // if(res.data.instances) {
                        //     iModelGuid = res.data.instances.properties.FileId;
                        // }
                        resolve(res.data);
                    })
                    .catch((error: AxiosError) => {
                        // console.log('axios error');
                        // console.log(error);
                        let errorMsg = "";
                        if(error.code) {
                            errorMsg += `${error.code}: `;
                        }
                        if(error.message) {
                            errorMsg += error.message
                        }

                        console.log("errorMsg *******");
                        console.log(errorMsg);
                        reject(errorMsg);

                    })


            } catch (e) {
                console.log(e);
                reject((e as any).message);

            }
        })
    }

}