/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { RpcInterfaceDefinition} from "@itwin/core-common";
// import { PresentationRpcInterface } from "@bentley/presentation-common";
import { ConnectorIModelCreationInterface } from "./interfaces/ConnectorIModelCreationInterface";

/**
 * Returns a list of RPCs supported by this application
 */
export default function getSupportedRpcs(): RpcInterfaceDefinition[] {
  return [
    ConnectorIModelCreationInterface,
  ];
}
