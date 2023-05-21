
import { OperationsBase } from "@itwin/imodels-client-management/lib/base/internal";
import { OpenTowerClient, OpenTowerOperationOptions } from "../OpenTowerClient";

export class NamedVersionOperations<TOptions extends OpenTowerOperationOptions> extends OperationsBase<TOptions> {
    private _iModelsClient;
    constructor(options: any, _iModelsClient: OpenTowerClient) {
        super(options);
        this._iModelsClient = _iModelsClient;
    }

    async getSingle(params: any) {
        const response: any = await this.sendGetRequest({
            authorization: params.authorization,
            url: this._options.urlFormatter.getSingleNamedVersionUrl({ iModelId: params.iModelId, namedVersionId: params.namedVersionId })
        });
        const result = this.appendRelatedEntityCallbacks(params.authorization, response.namedVersion);
        return result;
    }

    appendRelatedEntityCallbacks(authorization: any, namedVersion: any) {
        const getChangeset = async () => { var _a; return this.getChangeset(authorization, (_a = namedVersion._links.changeset) === null || _a === void 0 ? void 0 : _a.href); };
        const result = {
            ...namedVersion,
            getChangeset
        };
        return result;
    }

    async getChangeset(authorization: any, changesetLink: any) {
        const entityIds = this._options.urlFormatter.parseChangesetUrl(changesetLink);
        return this._iModelsClient.changesets.getSingle({
            authorization,
            ...entityIds
        });
    }
}