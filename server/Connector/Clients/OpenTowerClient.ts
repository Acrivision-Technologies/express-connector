import { IModelsClientOptions as ManagementIModelsClientOptions, IModelsClient as ManagementIModelsClient } from "@itwin/imodels-client-management";
import { AxiosRestClient, IModelsErrorParser } from "@itwin/imodels-client-management/lib/base/internal";
import { OpenTowerUrlFormatter } from "./OpenTowerUrlFormatter";
import { ClientStorage } from "@itwin/object-storage-core";
import { IModelOperations } from "./Operations/IModelOperations";
import { IModelsClient, LocalFileSystem } from "@itwin/imodels-client-authoring";
import { NodeLocalFileSystem } from "@itwin/imodels-client-authoring/lib/base/internal";
import { OperationOptions as ManagementOperationOptions } from "@itwin/imodels-client-management/lib/operations";
import { AzureClientStorage, BlockBlobClientWrapperFactory } from "@itwin/object-storage-azure";
import { BriefcaseOperations } from "./Operations/BriefcaseOperations";
import { LockOperations } from "./Operations/LockOperations";
import { ChangesetOperations } from "./Operations/ChangesetOperations";
import { NamedVersionOperations } from "./Operations/NamedVersionOperations";


export interface OpenTowerOperationOptions extends ManagementOperationOptions {
    urlFormatter: OpenTowerUrlFormatter;
    localFileSystem: LocalFileSystem;
    cloudStorage: ClientStorage;
}


export interface IModelsClientOptions extends ManagementIModelsClientOptions {
    /**
     * Local filesystem to use in operations which transfer files. Examples of such operations are Changeset download in
     * {@link ChangesetOperations}, iModel creation from Baseline in {@link iModelOperations}. If `undefined` the default
     * is used which is `LocalFsImpl` that is implemented using Node's `fs` module.
     */
    localFileSystem?: LocalFileSystem;
        /**
     * Storage handler to use in operations which transfer files. Examples of such operations are Changeset download in
     * {@link ChangesetOperations}, iModel creation from Baseline in {@link iModelOperations}. If `undefined` the default
     * is used which is `AzureClientStorage` class from `@itwin/object-storage-azure`.
     */
    cloudStorage?: ClientStorage;
}


export class OpenTowerClient extends IModelsClient {
    protected _clientOperationsOptions: OpenTowerOperationOptions;
    constructor(options?: IModelsClientOptions) {
        const filledIModelsClientOptions = OpenTowerClient.clientFillAuthoringClientConfiguration(options);
        super(options)
        this._clientOperationsOptions = {
            ...filledIModelsClientOptions,
            urlFormatter: new OpenTowerUrlFormatter(options?.api),
        }
    }
    
    getClientInfo = () => {
        return this;
    }

    /** iModel operations. See {@link iModelOperations}. */
    override get iModels(): any {
        return new IModelOperations<OpenTowerOperationOptions>(this._clientOperationsOptions, this);
    }

    /** Briefcase operations. See {@link BriefcaseOperations}. */
    override get briefcases(): any {
        return new BriefcaseOperations<OpenTowerOperationOptions>(this._clientOperationsOptions, this);
    }

    /** Lock operations. See {@link LockOperations}. */
    override get locks(): any {
        return new LockOperations<OpenTowerOperationOptions>(this._clientOperationsOptions);
    }

    /** Changeset operations. See {@link ChangesetOperations}. */
    override get changesets(): any {
        return new ChangesetOperations<OpenTowerOperationOptions>(this._clientOperationsOptions, this);
    }
    
    /** Changeset operations. See {@link ChangesetOperations}. */
    override get namedVersions(): any {
        return new NamedVersionOperations<OpenTowerOperationOptions>(this._clientOperationsOptions, this);
    }

    static clientFillAuthoringClientConfiguration(options: any) {
        var _a, _b, _c;
        return {
            api: this.fillApiConfiguration(options === null || options === void 0 ? void 0 : options.api),
            restClient: (_a = options === null || options === void 0 ? void 0 : options.restClient) !== null && _a !== void 0 ? _a : new AxiosRestClient(IModelsErrorParser.parse),
            localFileSystem: (_b = options === null || options === void 0 ? void 0 : options.localFileSystem) !== null && _b !== void 0 ? _b : new NodeLocalFileSystem(),
            cloudStorage: (_c = options === null || options === void 0 ? void 0 : options.cloudStorage) !== null && _c !== void 0 ? _c : new AzureClientStorage(new BlockBlobClientWrapperFactory())
        };
    }
}