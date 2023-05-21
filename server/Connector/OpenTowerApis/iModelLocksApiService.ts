import { OpenTowerIModelCreateDto } from "./Interfaces/IModelApiInterface";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

export class iModelLocksApiService {

    private clientEndPoint: string = "https://imodelhubapi.bentley.com";
    private apiVersion: string = "sv1.1";
    private createIModelRequestPath = "Repositories/iModel--{iModelDb}/iModelScope/Lock";


    acquireLock = async (iModelId: string, accessToken: string, briefcaseId: any, rootSubjectId: string): Promise<any> => {
        return new Promise((resolve: any, reject: any) => {
            try {

                let url = this.clientEndPoint + '/' + this.apiVersion + '/' + this.createIModelRequestPath.replace('{iModelDb}', iModelId);

                console.log('url');
                console.log(url);
                const requestConfig: AxiosRequestConfig = {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": accessToken
                    }
                }

                // Shema Level Lock
                let requestBody: any = {
                    "instance": {
                        "schemaName": "iModelScope",
                        "className": "Lock",
                        "properties": {
                            "ObjectId": rootSubjectId,
                            "LockType": 1,
                            "LockLevel": 2,
                            "BriefcaseId": briefcaseId * 1,
                            "ReleasedWithChangeSetIndex": 0
                        }
                    }
                }


                axios.post(url, JSON.parse(JSON.stringify(requestBody)), requestConfig)
                    .then((res: AxiosResponse) => {

                        // Response type
                        // {
                        //     "changedInstance": {
                        //         "change": "Created",
                        //         "instanceAfterChange": {
                        //         "instanceId": "3-0x1-2",
                        //         "schemaName": "iModelScope",
                        //         "className": "Lock",
                        //         "properties": {
                        //             "ObjectId": "0x1",
                        //             "LockType": 3,
                        //             "LockLevel": 2,
                        //             "BriefcaseId": 2,
                        //             "ReleasedWithChangeSetIndex": "0",
                        //             "ReleasedWithChangeSet": null,
                        //             "QueryOnly": null
                        //         }
                        //         }
                        //     }
                        // }

                        // console.log('axios res');
                        // console.log(res);
                        let lockID = "";
                        if (res.data.changedInstance) {
                            lockID = res.data.changedInstance.instanceAfterChange.instanceId;
                        }
                        resolve(lockID);
                    })
                    .catch((error: AxiosError) => {
                        console.log('axios error');
                        console.log(error.response);
                        let errorMsg = "";
                        if (error.code) {
                            errorMsg += `${error.code}: `;
                        }
                        if (error.message) {
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

    getIModelLoks = async (iModelId: string, accessToken: string): Promise<any> => {
        return new Promise((resolve: any, reject: any) => {
            try {

                let url = this.clientEndPoint + '/' + this.apiVersion + '/' + this.createIModelRequestPath.replace('{iModelDb}', iModelId);

                console.log('url');
                console.log(url);
                const requestConfig: AxiosRequestConfig = {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": accessToken
                    }
                }
                axios.get(url, requestConfig)
                    .then((res: AxiosResponse) => {
                        resolve(res.data);
                    })
                    .catch((error: AxiosError) => {
                        console.log('axios error');
                        console.log(error.response);
                        let errorMsg = "";
                        if (error.code) {
                            errorMsg += `${error.code}: `;
                        }
                        if (error.message) {
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

    updateLock = async (iModelId: any, accessToken: any, lockId: any, requestBody: any): Promise<any> => {
        return new Promise((resolve: any, reject: any) => {
            try {
                let url = this.clientEndPoint + '/' + this.apiVersion + '/' + this.createIModelRequestPath.replace('{iModelDb}', iModelId) +"/" + lockId;

                console.log('updateLock url');
                console.log(url);
                const requestConfig: AxiosRequestConfig = {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": accessToken
                    }
                }
                axios.post(url, JSON.parse(JSON.stringify(requestBody)), requestConfig)
                    .then((res: AxiosResponse) => {
                        console.log('updateLock res.data');
                        console.log(res.data);
                        resolve(res.data);
                    })
                    .catch((error: AxiosError) => {
                        console.log('axios error');
                        // console.log(error.response);
                        if(error.response?.status == 404) {
                            resolve("Lock released");
                        } else {
                            let errorMsg = "";
                            if (error.code) {
                                errorMsg += `${error.code}: `;
                            }
                            if (error.message) {
                                errorMsg += error.message
                            }
    
                            console.log("errorMsg *******");
                            console.log(errorMsg);
                            reject(errorMsg);
                        }

                    })

            } catch (e) {
                console.log(`iModelLocksApiService updateLock catch`);
                console.log(e);
                throw new Error((e as any).message);
            }
        });
    }

}