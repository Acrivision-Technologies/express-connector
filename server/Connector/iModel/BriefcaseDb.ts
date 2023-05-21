
import { Logger, assert, AccessToken } from "@itwin/core-bentley";
import { LoggerCategories } from "@itwin/connector-framework";
import ConnectorBriefcaseManager from "../ConnectorBriefcaseManager";
import { AcquireNewBriefcaseIdArg, RequestNewBriefcaseArg } from "@itwin/core-backend";
import { ConnectorBriefcaseDb } from "../ConnectorBriefcaseDb";

export const loadBriefcaseDb = async (hubArgs: any, accessToken: AccessToken): Promise<any> => {

    try {
        Logger.logInfo(LoggerCategories.Framework, `********************** Inside BriefCase Method`);

        let newbriefcaseId: any = "";
        const reqArg: RequestNewBriefcaseArg = { iTwinId: hubArgs.projectGuid, iModelId: hubArgs.iModelGuid, accessToken: accessToken };

        if (hubArgs.briefcaseId)
            reqArg.briefcaseId = hubArgs.briefcaseId;

        console.log('reqArg');
        console.log(reqArg);

        // LocalBriefcaseProps | TokenArg
        // try {
        const props: AcquireNewBriefcaseIdArg = {
            iModelId: reqArg.iModelId,
            accessToken: reqArg.accessToken

        }
        newbriefcaseId = await ConnectorBriefcaseManager.acquireNewBriefcaseId(props);

        console.log('newbriefcaseId');
        console.log(newbriefcaseId);

            
        // reqArg.briefcaseId = newbriefcaseId;

        // let bcProps: any = await ConnectorBriefcaseManager.downloadBriefcase(reqArg);
        // bcProps.accessToken = accessToken;
        // console.log('bcProps')
        // console.log(bcProps);

        // // if (this.jobArgs.updateDbProfile || this.jobArgs.updateDomainSchemas) {
        // //     await this.doWithRetries(async () => ConnectorBriefcaseDb.upgradeSchemas(bcProps), BeforeRetry.Nothing);
        // // }

        // // openProps = { fileName: bcProps.fileName, accessToken: accessToken };
        // openProps = bcProps;

        return newbriefcaseId;
    } catch (e) {
        console.log('=====');
        console.log(e);
        throw new Error((e as any).message)
    }



    // return await ConnectorBriefcaseDb.open(openProps);
}