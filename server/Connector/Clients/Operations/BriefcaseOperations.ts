import { BriefcaseOperations as ManagementBriefcaseOperations } from "@itwin/imodels-client-management/lib/operations";
import { OpenTowerClient } from "../OpenTowerClient";
import { OpenTowerOperationOptions } from "../OpenTowerClient";

import { IModelBriefcaseApiService } from "../../OpenTowerApis/IModelBriefcaseApiService";

export class BriefcaseOperations<TOptions extends OpenTowerOperationOptions> extends ManagementBriefcaseOperations<TOptions> {
    constructor(options: any, _iModelsClient: OpenTowerClient) {
        super(options,_iModelsClient);
    }

    acquire = async(params: any): Promise<any> => {

        console.log("inside OpenTower BriefcaseOperations acquire method");

        
        try {
            // console.log('params');
            // console.log(params);
            // console.log('this._options.urlFormatter')
            // console.log(this._options.urlFormatter)
            const tokenResponse: any = await params.authorization();
            const accessToken: string = tokenResponse.scheme + " " + tokenResponse.token;
            let url = this._options.urlFormatter.getAcquireIModelBriefcaseUrl(params.iModelId)

            return await new IModelBriefcaseApiService().acquireNewBriefcaseId(url, accessToken)
                .then((res: any) => {
                    return res;
                })
                .catch((error: any) => {
                    throw new Error(error);
                })

        } catch(e) {
            throw new Error((e as any).message);
        }
    }
}