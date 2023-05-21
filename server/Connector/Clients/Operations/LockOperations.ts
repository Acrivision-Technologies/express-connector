import { IModelOperations as ManagementIModelOperations } from "@itwin/imodels-client-management/lib/operations";
import { OperationsBase, EntityListIteratorImpl } from "@itwin/imodels-client-management/lib/base/internal";
import { Lock } from "@itwin/imodels-client-authoring/lib/base/types";
import { toArray } from "@itwin/imodels-client-authoring";
import { OpenTowerOperationOptions } from "../OpenTowerClient";

import { iModelLocksApiService } from "../../OpenTowerApis/iModelLocksApiService";

export class LockOperations<TOptions extends OpenTowerOperationOptions> extends OperationsBase<TOptions> {

    // EntityListIterator<Lock>
    async getList(params: any): Promise<any> {

        console.log('params');
        console.log(params);
        
        console.log("---------------- ************************* ");
        console.log("in side the lock get call")
        console.log('params');
        console.log(params);
        // const response =  new EntityListIteratorImpl(async () => this.getEntityCollectionPage({
        //     authorization: params.authorization,
        //     url: this._options.urlFormatter.getLockListUrl({ iModelId: params.iModelId, urlParams: params.urlParams }),
        //     entityCollectionAccessor: entityCollectionAccessorMethod
        // }));

        console.log("lock url");
        console.log(this._options.urlFormatter.getLockListUrl({ iModelId: params.iModelId, urlParams: params.urlParams }));

        const response: any= await this.sendGetRequest({
            authorization: params.authorization,
            url: this._options.urlFormatter.getLockListUrl({ iModelId: params.iModelId, urlParams: params.urlParams }),
        })

        console.log('response');
        console.log(JSON.stringify(response));



        // const locks = await (toArray)(response);
        console.log('{{{{{{{{{locks');
        // console.log(locks);

        let resultData: any = {
            from: 0,
            to: response.instances.length,
          
            [Symbol.asyncIterator]() { // (1)
              return {
                current: this.from,
                last: this.to,
          
                async next() { // (2)
          
                  // note: we can use "await" inside the async next:
                  if (this.current <= this.last) {
                    let data = {
                        briefcaseId: response.instances[this.current].properties.BriefcaseId,
                        lockedObjects: [{
                            lockLevel:  "exclusive",
                            objectIds: [response.instances[this.current].properties.ObjectId]
                        }]
                    }

                    return { done: false, value: data };
                  } else {
                    return { done: true };
                  }
                }
              };
            }
        };


        resultData = {
            length: response.instances.length,
        }
        response.instances.map(async (instance: any, index: number) => {
            let data = {
                briefcaseId: instance.properties.BriefcaseId,
                lockedObjects: [{
                    lockLevel:  "exclusive",
                    objectIds: [instance.properties.ObjectId]
                }]
            }
            resultData[index] = await Promise.resolve(data);
        })

        console.log('resultData')
        console.log(resultData)
        console.log(await (toArray)(resultData))

        return resultData;
    }
    /**
     * Updates Lock for a specific Briefcase. This operation is used to acquire new locks and change the lock level for
     * already existing ones. Wraps the {@link https://developer.bentley.com/apis/imodels/operations/update-imodel-locks/
     * Update iModel Locks} operation from iModels API.
     * @param {UpdateLockParams} params parameters for this operation. See {@link UpdateLockParams}.
     * @returns {Promise<Lock>} updated Lock. See {@link Lock}.
     */
    async update(params: any): Promise<any> {
        try {
            console.log("---------------- ************************* ");
            const tokenResponse: any = await params.authorization();
            const accessToken: string = tokenResponse.scheme + " " + tokenResponse.token;
            // console.log("in side the lock update call")
            console.log('params');
            console.log(params);
            // const updateLockBody = this.getUpdateLockBody(params);
            // console.log('updateLockBody');
            // console.log(updateLockBody);
            // console.log(JSON.stringify(params.lockedObjects[0]));
    
            // console.log('await params.authorization()');
            // console.log(await params.authorization());
    
            // console.log("url");
            // console.log(this._options.urlFormatter.getLockListUrl({ iModelId: params.iModelId }))
    
            // const updateLockResponse: any = await this.sendPostRequest({
            //     authorization: params.authorization,
            //     url: this._options.urlFormatter.getLockListUrl({ iModelId: params.iModelId }),
            //     body: updateLockBody
            // });
            // console.log('updateLockResponse')
            // console.log(updateLockResponse)
    
            return await new iModelLocksApiService().acquireLock(params.iModelId, accessToken, params.briefcaseId, params.lockedObjects[0].objectIds[0])
                .then((lockId: any) => {

                    console.log(`lockId:`);
                    console.log(lockId);
                    return lockId;
                })
                .catch((error: any) => {
                    throw new Error(error);
                })
        } catch(e) {
            throw new Error((e as any).message);
        }
    }
    getUpdateLockBody(params: any) {
        // return {
        //     briefcaseId: params.briefcaseId,
        //     changesetId: params.changesetId,
        //     lockedObjects: params.lockedObjects
        // };

        return {
            "instance": {
              "schemaName": "iModelScope",
              "className": "Lock",
              "properties": {
                "ObjectId": params.lockedObjects[0].objectIds[0],
                "LockType": 1,
                "LockLevel": 2,
                "BriefcaseId": params.briefcaseId*1
              }
            }
          }
    }
}