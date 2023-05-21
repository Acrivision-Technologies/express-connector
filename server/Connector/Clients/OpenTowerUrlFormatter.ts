import { ApiOptions } from "@itwin/imodels-client-authoring";
import { IModelsApiUrlFormatter } from "@itwin/imodels-client-management/lib/operations";


export class OpenTowerUrlFormatter extends IModelsApiUrlFormatter {
    protected override readonly baseUrl: string;
    protected readonly apiVersion: string;

    constructor(apiOptions: ApiOptions | undefined) {
        super(apiOptions?.baseUrl ?? '');
        this.baseUrl = apiOptions?.baseUrl ?? '';
        this.apiVersion = apiOptions?.version ?? ''
    }

    
    getOpenTowerCreateIModelUrl(params: any) {
        return `${this.baseUrl}/${this.apiVersion}/Repositories/Context--${params.projectId}/ContextScope/iModel`;
    }

    getOpenTowerIModelLockUrl(params: any) {
        return `${this.baseUrl}/${this.apiVersion}/Repositories/iModel--${params.iModelId}/iModelScope/iModelLock`;
    }
    
    getOpenTowerReleaseIModelLockUrl(params: any) {
        return `${this.baseUrl}/${this.apiVersion}/Repositories/iModel--${params.iModelId}/iModelScope/iModelLock/iModelLock`;
    }
    
    getIModelSeederFileInfoUrl(params: any) {
        return `${this.baseUrl}/${this.apiVersion}/Repositories/iModel--${params.iModelId}/iModelScope/SeedFile`;
    }
    
    getUpdateIModelSeederFileInfoUrl(params: any) {
        return `${this.baseUrl}/${this.apiVersion}/Repositories/iModel--${params.iModelId}/iModelScope/SeedFile/${params.seedFileInstanceId}`;
    }
    
    getAcquireIModelBriefcaseUrl(iModelId: any) {
        return `${this.baseUrl}/${this.apiVersion}/Repositories/iModel--${iModelId}/iModelScope/Briefcase`;
    }
    getLockListUrl(params: any) {
        return `${this.baseUrl}/${this.apiVersion}/Repositories/iModel--${params.iModelId}/iModelScope/Lock`;
    }

    override getChangesetListUrl(params: any) {
        return `${this.baseUrl}/${this.apiVersion}/Repositories/iModel--${params.iModelId}/iModelScope/ChangeSet${this.formQueryString({ ...params.urlParams })}`;
    }

    override getSingleNamedVersionUrl(params: any) {
        return `${this.baseUrl}/${this.apiVersion}/Repositories/iModel--${params.iModelId}/iModelScope/Version`;
    }



    // override getSingleBriefcaseUrl(params: { iModelId: string; } & { briefcaseId: number; }): string {
        
    // }
}