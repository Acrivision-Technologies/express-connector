import * as FormData from "form-data";


export class OpenTowerUploadSeedApiService {

    private clientEndPoint: string = "https://imodelhubapi.bentley.com"; 
    private apiVersion: string = "sv1.1";
    private createIModelRequestPath = "Repositories/Context--{ContextId}/ContextScope/iModel";

    uploadIModelSeedFile = (uploadUrl: string, filePath: string): Promise<any> => {
        return new Promise((resolve: any, reject: any) => {
            console.log(uploadUrl);
            console.log(filePath);
            
            try {
                resolve("Done")

            } catch(e) {
                reject((e as any).message);
            }

        })
    }

}