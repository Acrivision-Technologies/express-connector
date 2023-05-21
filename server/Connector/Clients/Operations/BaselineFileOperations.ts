import { OperationsBase } from "@itwin/imodels-client-management/lib/base/internal";
import { OpenTowerOperationOptions } from "../OpenTowerClient";

export class BaselineFileOperations<TOptions extends OpenTowerOperationOptions>  extends OperationsBase<TOptions> {

     /**
     * Gets a single Baseline file by iModel id. This method returns a Baseline file in its full representation. Wraps the
     * {@link https://developer.bentley.com/apis/imodels/operations/get-imodel-baseline-file-details/
     * Get iModel Baseline File Details} operation from iModels API.
     * @param {GetSingleBaselineFileParams} params parameters for this operation. See {@link GetSingleBaselineFileParams}.
     * @returns {Promise<BaselineFile>} a Baseline file for the specified iModel. See {@link BaselineFile}.
     */
    async getSingle(params: any) {
        const response: any = await this.sendGetRequest({
            authorization: params.authorization,
            url: this._options.urlFormatter.getIModelSeederFileInfoUrl({ iModelId: params.iModelId })
        });
        return response;
    }
}