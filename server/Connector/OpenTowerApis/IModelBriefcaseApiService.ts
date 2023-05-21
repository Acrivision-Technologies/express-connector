
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

export class IModelBriefcaseApiService {

    private clientEndPoint: string = "https://imodelhubapi.bentley.com"; 
    // private clientEndPoint: string = "https://dev-api-eus-apim-01.azure-api.net/imodelhub"; 
    private apiVersion: string = "sv1.1";
    private createIModelBriefcaseRequestPath = "Repositories/iModel--{iModelId}/iModelScope/Briefcase";
    private deleteIModelBriefcaseRequestPath = "Repositories/iModel--{iModelId}/iModelScope/Briefcase/{briefcaseId}";


    acquireNewBriefcaseId = async (url: string, accessToken: string, reformUrl? : boolean, iModelId?: string): Promise<any> => {
        console.log("inside IModelBriefcaseApiService:acquireNewBriefcaseId method ")
        return await new Promise(async(resolve: any, reject: any) => {

            if(reformUrl) {
                url = `${this.clientEndPoint}/${this.apiVersion}/${this.createIModelBriefcaseRequestPath}`.replace("{iModelId}", iModelId ?? '')
            }

            console.log('accessToken');
            console.log(accessToken);

            try {
                console.log('url');
                console.log(url);

                const requestConfig: AxiosRequestConfig = {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": accessToken
                    }
                }


                await axios.post(url, {}, requestConfig)
                    .then((res: AxiosResponse) => {

                        // console.log("((((((((((res");

                        // console.log(res);

                        // console.log(JSON.stringify(res.data));
                        // Response Sample
                        // {
                        //     "changedInstance": {
                        //         "change": "Created",
                        //         "instanceAfterChange": {
                        //             "instanceId": "3",
                        //             "schemaName": "iModelScope",
                        //             "className": "Briefcase",
                        //             "properties": {
                        //                 "BriefcaseId": 3,
                        //                 "FileSize": "1253376",
                        //                 "UserOwned": "5dc89132-5f63-426f-9a8f-32488a59aee9",
                        //                 "AcquiredDate": "2023-05-11T09:28:50.1056132Z",
                        //                 "FileName": "0c702dc8-4712-4b41-a057-16295d497378.bim",
                        //                 "FileDescription": "Test IModel created from swagger",
                        //                 "FileId": "0c702dc8-4712-4b41-a057-16295d497378",
                        //                 "MergedChangeSetId": "",
                        //                 "MergedChangeSetIndex": "0",
                        //                 "ExpirationDate": "2023-06-10T09:28:50.0662833Z",
                        //                 "IsReadOnly": false
                        //             },
                        //             "relationshipInstances": [
                        //                 {
                        //                     "instanceId": "",
                        //                     "schemaName": "iModelScope",
                        //                     "className": "FileAccessKey",
                        //                     "direction": "forward",
                        //                     "properties": {},
                        //                     "relatedInstance": {
                        //                         "instanceId": "",
                        //                         "schemaName": "iModelScope",
                        //                         "className": "AccessKey",
                        //                         "properties": {
                        //                             "UploadUrl": null,
                        //                             "DownloadUrl": "https://imodelhubprodsa01.blob.core.windows.net/imodelhub-0c702dc8-4712-4b41-a057-16295d497378/0c702dc8-4712-4b41-a057-16295d497378m.bim?sv=2019-07-07&sr=b&sig=8ROtVf0%2FT3Sr67QigI8H9MFbmAv1dsx8hxTZk45OAy8%3D&st=2023-05-11T09%3A21%3A32.5462819Z&se=2023-05-11T09%3A44%3A50.1089128Z&sp=r"
                        //                         }
                        //                     }
                        //                 }
                        //             ]
                        //         }
                        //     }
                        // }
                        const briefcaseId: string = res.data.changedInstance.instanceAfterChange.instanceId;
                        const briefcaseDownloadUrl: string = res.data.changedInstance.instanceAfterChange.relationshipInstances[0].relatedInstance.properties.DownloadUrl;
                        let response: any = {
                            briefcaseId,
                            briefcaseDownloadUrl
                        }
                        console.log("briefcase response ")
                        resolve(response);

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
            } catch(e) {
                // console.log("errorMsg *******");
                // console.log(e);
                let errorMsg = (e as any).message;
                console.log(errorMsg);
                reject(errorMsg);
            }

        });
    }

    releaseNewBriefcaseId = (iModelId: string, briefcaseId: string, accessToken: string) => {
        console.log("inside IModelBriefcaseApiService:releaseNewBriefcaseId method ")
        return new Promise((resolve: any, reject: any) => {

            try {
                let url = this.clientEndPoint + '/' + this.apiVersion + '/' + this.deleteIModelBriefcaseRequestPath.replace('{iModelId}', iModelId).replace('{briefcaseId}', briefcaseId);
                console.log('url');
                console.log(url);

                const requestConfig: AxiosRequestConfig = {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": accessToken
                    }
                }

                axios.delete(url, requestConfig)
                    .then((res: AxiosResponse) => {

                        console.log("releaseNewBriefcaseId response");
                        console.log(res);
                        console.log(JSON.stringify(res.data));
                        resolve("Deleted Successfully");

                    })
                    .catch((error: AxiosError) => {
                        console.log('axios error');
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
            } catch(e) {
                console.log("errorMsg *******");
                let errorMsg = (e as any).message;
                console.log(errorMsg);
                reject(errorMsg);
            }

        })
    }

}