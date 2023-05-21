/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
// tslint:disable:no-console
import { RpcInterfaceDefinition, BentleyCloudRpcManager } from "@itwin/core-common";
import { IModelJsExpressServer } from "@itwin/express-server";
import { envconfigs } from "./utils/envConfig";

/**
 * Initializes Web Server backend
 */
export default async function initialize(rpcs: RpcInterfaceDefinition[]) {
  // tell BentleyCloudRpcManager which RPC interfaces to handle
  const rpcConfig = BentleyCloudRpcManager.initializeImpl({ info: { title: "shema-connector-express-server", version: "v1.0" } }, rpcs);

  const port = Number(envconfigs.parsed?.PORT ?? 3001);
  const server = new IModelJsExpressServer(rpcConfig.protocol);
  await server.initialize(port);
  console.log("RPC backend for simple-viewer-app listening on port " + port);
}
