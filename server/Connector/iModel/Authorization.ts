
import { NodeCliAuthorizationClient } from "@itwin/node-cli-authorization";
import { Logger } from "@itwin/core-bentley";
import { LoggerCategories } from "@itwin/connector-framework";

export const getTokenInteractive = async (clientConfig: any) => {
    console.log('clientConfig');
    console.log(clientConfig);
    const client = new NodeCliAuthorizationClient(clientConfig!);
    console.log("client before signin");
    console.log(client);
    Logger.logInfo(LoggerCategories.Framework, "token signin");
    await client.signIn();
    // console.log("client after signin");
    // console.log(client);
    return client.getAccessToken();

}