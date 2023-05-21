

import { IModelRpcProps, RpcInterface, RpcManager } from "@itwin/core-common"

export abstract class ConnectorIModelCreationInterface extends RpcInterface {

  public static interfaceVersion = "1.1.0";
  public static interfaceName = "ConnectorIModelCreationInterface";

  public static getClient(): ConnectorIModelCreationInterface { return RpcManager.getClientForInterface(this); }
  public async createIModel(_requestParams: IModelRpcProps, __requestBody: number): Promise<any> { return this.forward.apply(this, arguments as any) as any; }
}