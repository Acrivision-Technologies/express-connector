import * as path from "path";
import * as xmlJs from "xml-js";
import * as fs from "fs";

import { Config } from "./Config";
import { AllArgsProps } from "./ConnectorArgs";
import { ConnectorRunner } from "./ConnectorRunner";
import { shutdownBackend, startBackend } from "./ConnectorUtils";
import { BentleyStatus } from "@itwin/core-bentley";
import { importSourceData } from "./iModel/Services/SourceDataService";
import { KnownLocations } from "./KnownLocations";
import { error } from "console";


console.log("mainExecution ==================")
console.log('__dirname');
console.log(__dirname);

export const mainExecution = async (fileName: string, iModelName: string, access_token: string, iTwinId: string): Promise<any> => {
  return new Promise((resolve: any, reject: any) => {
    try {
      console.log("inside mainExecution service");
      console.log(`__dirname: ${__dirname}`);
      const towerConnectorExecutionFile = path.join(__dirname, "TowerConnector");

      // // main executoin
      let connectorArgs: AllArgsProps = JSON.parse(JSON.stringify({...Config.connectorArgs}));
      if(connectorArgs.hubArgs) {
        connectorArgs.hubArgs.projectGuid = iTwinId;
      }
    
      const runner = ConnectorRunner.fromJSON(connectorArgs, access_token);

      runner.run(towerConnectorExecutionFile, fileName, iModelName)
        .then((iModelGuid: string) => {
          resolve(iModelGuid);
        })
        .catch((error: any) => {
          reject(error);
        })

    
      // const response = await runner.run(towerConnectorExecutionFile, fileName, iModelName, access_token);
      // console.log('final response');
      // console.log(response);
      // if (response.runStatus !== BentleyStatus.SUCCESS) {
      //   throw new Error("ConnectorRunner failed");
      // } else {
      //   return response;
      // }
    } catch(e) {
      console.log("inside mainExecution catch case")
      reject((e as any).message);
    }

  })

  // await shutdownBackend();


}