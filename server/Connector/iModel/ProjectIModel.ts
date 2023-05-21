import { CreateNewIModelProps, IModelHost } from "@itwin/core-backend";
import { GuidString } from "@itwin/core-bentley";
import { Config } from "../Config";



  export const createNewConnectorIModel = async(iTwinId: string | undefined, accessToken: any, iModelName: string): Promise<GuidString> => {

    console.log("inside createNewConnectorIModel");

    console.log(accessToken);

    const newIModelArgs: CreateNewIModelProps = {
        iModelName: iModelName,
        description: `Dummy description for ${iModelName}`,
        accessToken: accessToken,
        iTwinId: iTwinId ? iTwinId : ''
    }

    console.log('newIModelArgs');
    console.log(newIModelArgs);

    return IModelHost.hubAccess.createNewIModel(newIModelArgs);

}