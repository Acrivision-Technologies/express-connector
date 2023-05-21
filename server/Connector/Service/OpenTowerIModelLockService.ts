import { ConnectorBriefcaseDb } from "../ConnectorBriefcaseDb";
import { iModelLocksApiService } from "../OpenTowerApis/iModelLocksApiService";


export class OpenTowerIModelLockService {

    releaseAllLocks = async (db: ConnectorBriefcaseDb): Promise<any> => {


        try {

            const iModelLocks = await new iModelLocksApiService().getIModelLoks(db.iModelId, db.accessToken);
            console.log('iModelLocks');
            console.log(iModelLocks);
            if (iModelLocks.instances) {
                await iModelLocks.instances.map(async (lockinstance: any) => {
                    console.log('lockinstance');
                    console.log(lockinstance);
                    const requestBody = {
                        "instance": {
                            "instanceId": lockinstance.instanceId,
                            "schemaName": "iModelScope",
                            "className": "Lock",
                            "properties": {
                                "ObjectId": lockinstance.properties["ObjectId"],
                                "LockType": lockinstance.properties["LockType"],
                                "LockLevel": 0,
                                "BriefcaseId": 2,
                                "ReleasedWithChangeSet": db.changeset.id,
                                "ReleasedWithChangeSetIndex": db.changeset.index
                            },
                        }
                    }
                    console.log('requestBody');
                    console.log(requestBody);

                    return await new iModelLocksApiService().updateLock(db.iModelId, db.accessToken, lockinstance.instanceId, requestBody);
                })
                console.log("-------------- +++++++++++")
                return "Success";
            } else {
                return "Success";
            }

        } catch (e) {
            console.log("=========")
            console.log(e);
            console.log((e as any).message);
            throw new Error((e as any).message);
        }

    }

}