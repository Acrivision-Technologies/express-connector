import * as path from "path";
import { isIModelsApiError, IModelsErrorCode } from "@itwin/imodels-client-management";
import { ChangesetOperations as ManagementChangesetOperations } from "@itwin/imodels-client-management/lib/operations";
import { GetChangesetListParams, GetSingleChangesetParams } from "@itwin/imodels-client-management/lib/operations/changeset/ChangesetOperationParams";
import { AuthorizationCallback, Changeset, EntityListIterator, MinimalChangeset, PreferReturn } from "@itwin/imodels-client-management/lib/base/types";
import { EntityListIteratorImpl, IModelsErrorImpl } from "@itwin/imodels-client-management/lib/base/internal";
import { OpenTowerClient } from "../OpenTowerClient";
import { OpenTowerOperationOptions } from "../OpenTowerClient";
import { DownloadSingleChangesetParams, DownloadedChangeset } from "@itwin/imodels-client-authoring";
import {  LimitedParallelQueue } from "@itwin/imodels-client-authoring/lib/operations/changeset/LimitedParallelQueue";
import * as FileDownload from "@itwin/imodels-client-authoring/lib/operations/FileDownload";

export class ChangesetOperations<TOptions extends OpenTowerOperationOptions> extends ManagementChangesetOperations<TOptions> {
    private _iModelsClientInstance: OpenTowerClient;
    constructor(options: any, _iModelsClient: OpenTowerClient) {
        super(options, _iModelsClient);
        this._iModelsClientInstance = _iModelsClient;
    }

    getCreateChangesetRequestBody(changesetProperties: any, changesetFileSize: any) {

        console.log('changesetProperties');
        console.log(changesetProperties);
        console.log('changesetFileSize');
        console.log(changesetFileSize);
        // return {
        //     id: changesetProperties.id,
        //     description: changesetProperties.description,
        //     parentId: changesetProperties.parentId,
        //     briefcaseId: changesetProperties.briefcaseId,
        //     containingChanges: changesetProperties.containingChanges,
        //     fileSize: changesetFileSize,
        //     synchronizationInfo: changesetProperties.synchronizationInfo
        // };

        const fileName = changesetProperties.filePath.split("/").pop();
        console.log(`fileName -> ${fileName}`)

        return {
            "instance": {
              "schemaName": "iModelScope",
              "className": "ChangeSet",
              "properties": {
                "Id": changesetProperties.id,
                "FileName": fileName,
                "Description": changesetProperties.description,
                "FileSize": changesetFileSize,
                "SeedFileId": changesetProperties.id,
                "BriefcaseId": changesetProperties.briefcaseId*1,
                "ContainingChanges": changesetProperties.containingChanges
              }
            }
        }
    }

    async create(params: any) {
        try {
            console.log("inside create changeset method");
            console.log(params);
            const changesetFileSize = await this._options.localFileSystem.getFileSize(params.changesetProperties.filePath);
            console.log('changesetFileSize');
            console.log(changesetFileSize);
            const createChangesetBody: any = this.getCreateChangesetRequestBody(params.changesetProperties, changesetFileSize);
            console.log('createChangesetBody');
            console.log(createChangesetBody);
            console.log('this._options.urlFormatter.getChangesetListUrl({ iModelId: params.iModelId })');
            console.log(this._options.urlFormatter.getChangesetListUrl({ iModelId: params.iModelId }));
            const createChangesetResponse: any = await this.sendPostRequest({
                authorization: params.authorization,
                url: this._options.urlFormatter.getChangesetListUrl({ iModelId: params.iModelId }),
                body: createChangesetBody
            });
    
            console.log('createChangesetResponse');
            console.log(createChangesetResponse);
            const uploadUrl = createChangesetResponse.changedInstance.instanceAfterChange.relationshipInstances[0].relatedInstance.properties['UploadUrl'];
            createChangesetBody.instance.properties = createChangesetResponse.changedInstance.instanceAfterChange.properties;
            console.log('uploadUrl');
            console.log(uploadUrl);
            // const uploadLink = createChangesetResponse.changeset._links.upload;
            // (0, CommonFunctions_1.assertLink)(uploadLink);
            await this._options.cloudStorage.upload({
                url: uploadUrl,
                data: params.changesetProperties.filePath
            });
            // const completeLink = createChangesetResponse.changeset._links.complete;
            // (0, CommonFunctions_1.assertLink)(completeLink);
            // const confirmUploadBody = this.getConfirmUploadRequestBody(params.changesetProperties);
            const confirmUploadBody: any = {...createChangesetBody};
            // IsUploaded: true
            confirmUploadBody.instance["instanceId"] = params.changesetProperties.id;
            confirmUploadBody.instance.properties["IsUploaded"] = true;
            console.log('confirmUploadBody');
            console.log(confirmUploadBody);
            console.log('update url');
            console.log(this._options.urlFormatter.getChangesetListUrl({ iModelId: params.iModelId }) + "/" + params.changesetProperties.id);
            const confirmUploadResponse: any = await this.sendPostRequest({
                authorization: params.authorization,
                url: this._options.urlFormatter.getChangesetListUrl({ iModelId: params.iModelId }) + "/" + params.changesetProperties.id,
                body: confirmUploadBody
            });
            console.log('confirmUploadResponse');
            console.log(confirmUploadResponse);
            const result = this.appendRelatedEntityCallbacksMethod(confirmUploadResponse.changedInstance.instanceAfterChange);
            console.log("final r====");
            console.log(result)
            return result;
        } catch(e) {
            console.log("--- Error");
            console.log(e);
            throw new Error((e as any).message)
        }
    }

    override getSingle = (params: any): Promise<Changeset> => {
        return new Promise(async (resolve: any, reject: any) => {
            console.log("inside ChangesetOperations getSingle ");
            console.log(params);
            console.log('resolve');
            console.log(resolve);

            try {

                const changeset = await this.querySingleInternal(params);
                console.log('changeset');
                console.log(changeset);
                reject("Dummy Error");
                // resolve(changeset);

            } catch (e) {
                console.log("ChangesetOperations getSingle");
                console.log(e);
                reject((e as any).message);
            }
        })
    }

    override async querySingleInternal(params: any): Promise<any> {
        const { authorization, iModelId, ...changesetIdOrIndex } = params;
        console.log(`iModelId : ${iModelId}`);
        console.log(`changesetIdOrIndex: ${changesetIdOrIndex}`);

        const response: any = await this.sendGetRequest({
            authorization,
            url: this._options.urlFormatter.getChangesetListUrl({ iModelId })
        });
        const result = this.appendRelatedEntityCallbacksMethod(response.instances[0]);
        return result;
    }



    // downloadSingle = (params: DownloadSingleChangesetParams): Promise<DownloadedChangeset> => {
    //     return new Promise(async (resolve: any, reject: any) => {
    //         try {
    //             console.log('ChangesetOperations downloadSingle params');
    //             console.log(params);
    //             await this._options.localFileSystem.createDirectory(params.targetDirectoryPath);
    //             console.log("file created");
    //             const changeset = await this.querySingleInternal(params);
    //             return this.downloadSingleChangeset({ ...params, changeset });

    //         } catch(e) {
    //             console.log("changesetOperations downliadSingle error:");
    //             console.log(e)
    //             reject((e as any).message);
    //         }
    //     })

    // }

    // private async downloadSingleChangeset(params: any) {
    //     const changesetWithPath = {
    //         ...params.changeset,
    //         filePath: path.join(params.targetDirectoryPath, this.createFileName(params.changeset.id))
    //     };
    //     const downloadCallback = params.progressCallback ? (bytes: any) => { var _a; return (_a = params.progressCallback) === null || _a === void 0 ? void 0 : _a.call(params, bytes, changesetWithPath.fileSize); } : undefined;
    //     await this.downloadChangesetFileWithRetry({
    //         authorization: params.authorization,
    //         iModelId: params.iModelId,
    //         changeset: changesetWithPath,
    //         abortSignal: params.abortSignal,
    //         downloadCallback
    //     });
    //     return changesetWithPath;
    // }

    private createFileName(changesetId: any) {
        return `${changesetId}.cs`;
    }

    private async downloadChangesetFileWithRetry(params: any) {
        console.log("inside the downloadChangesetFileWithRetry mehtod");
        console.log('params');
        console.log(params);
        var _a;
        const targetFilePath = params.changeset.filePath;
        console.log(`targetFilePath => ${targetFilePath}`);
        if (await this.isChangesetAlreadyDownloaded(targetFilePath, params.changeset.fileSize))
            return;
        console.log("----")
        const downloadParams: any = {
            storage: this._options.cloudStorage,
            localPath: targetFilePath,
            abortSignal: params.abortSignal
        };
        let bytesDownloaded = 0;
        if (params.downloadCallback) {
            downloadParams.latestDownloadedChunkSizeCallback = (downloaded: any) => {
                var _a;
                bytesDownloaded += downloaded;
                (_a = params.downloadCallback) === null || _a === void 0 ? void 0 : _a.call(params, downloaded);
            };
        }
        console.log("++++++++++++++++++++++++");
        console.log('downloadParams');
        console.log(downloadParams);
        try {
            console.log("++++++++++++++++++++++++ try");
            const downloadLink = params.changeset.downloadUrl;
            console.log(`downloadLink => ${downloadLink}`);
            await (0, FileDownload.downloadFile)({
                ...downloadParams,
                url: downloadLink
            });
        }
        catch (error) {
            console.log("++++++++++++++++++++++++ catch");
            console.log(error);
            this.throwIfAbortError(error, params.changeset);
            (_a = params.firstDownloadFailedCallback) === null || _a === void 0 ? void 0 : _a.call(params, bytesDownloaded);
            const changeset = await this.querySingleInternal({
                authorization: params.authorization,
                iModelId: params.iModelId,
                changesetId: params.changeset.id
            });
            try {
                const newDownloadLink = params.changeset.downloadUrl;
                console.log(`newDownloadLink => ${newDownloadLink}`)
                await (0, FileDownload.downloadFile)({
                    ...downloadParams,
                    url: newDownloadLink
                });
            }
            catch (errorAfterRetry) {
                this.throwIfAbortError(error, params.changeset);
                throw new IModelsErrorImpl({
                    code: IModelsErrorCode.ChangesetDownloadFailed,
                    message: `Failed to download changeset. Changeset id: ${params.changeset.id}, changeset index: ${params.changeset.index}, error: ${JSON.stringify(errorAfterRetry)}.`
                });
            }
        }
    }

    private async isChangesetAlreadyDownloaded(targetFilePath: any, expectedFileSize: any) {
        const fileExists = await this._options.localFileSystem.fileExists(targetFilePath);
        if (!fileExists)
            return false;
        const existingFileSize = await this._options.localFileSystem.getFileSize(targetFilePath);
        if (existingFileSize === expectedFileSize)
            return true;
        await this._options.localFileSystem.deleteFile(targetFilePath);
        return false;
    }


    /**
     * Downloads Changeset list. Internally the method uses {@link ChangesetOperations.getRepresentationListMethod} to query the
     * Changeset collection so this operation supports most of the the same url parameters to specify what Changesets to
     * download. One of the most common properties used are `afterIndex` and `lastIndex` to download Changeset range. This
     * operation downloads Changesets in parallel. If an error occurs when downloading a Changeset this operation queries
     * the failed Changeset by id and retries the download once. If the Changeset file with the expected name already
     * exists in the target directory and the file size matches the one expected the Changeset is not downloaded again.
     * @param {DownloadChangesetListParams} params parameters for this operation. See {@link DownloadChangesetListParams}.
     * @returns downloaded Changeset metadata along with the downloaded file path. See {@link DownloadedChangeset}.
     */
    async downloadList(params: any): Promise<any> {
        var _a;
        console.log("downloadList params");
        console.log(params);

        await this._options.localFileSystem.createDirectory(params.targetDirectoryPath);
        console.log("Folder created");
        
        const [downloadCallback, downloadFailedCallback] = (_a = await this.provideDownloadCallbacks(params)) !== null && _a !== void 0 ? _a : [];
        console.log('downloadCallback');
        console.log(downloadCallback);
        console.log('downloadFailedCallback');
        console.log(downloadFailedCallback);

        // const dummyResult: any = await this.getRepresentationListMethod(params);
        // console.log('dummyResult');
        // console.log(dummyResult);
        // console.log("======")
        // console.log('await this.getRepresentationListMethod(params).byPage()');
        // console.log(await this.getRepresentationListMethod(params).byPage());
        let result: any = [];
        console.log("calling");
        const data: any[] = await this.getRepresentationListMethod(params);
        if(data.length > 0) {
            console.log("depth compute");
            const changesetsWithFilePath = data.map((changeset) => ({
                ...changeset,
                filePath: path.join(params.targetDirectoryPath, this.createFileName(changeset.id))
            }));
            result = result.concat(changesetsWithFilePath);
            // We sort the changesets by fileSize in descending order to download small
            // changesets first because their SAS tokens have a shorter lifespan.
            changesetsWithFilePath.sort((changeset1, changeset2) => changeset1.fileSize - changeset2.fileSize);
            const queue = new LimitedParallelQueue({ maxParallelPromises: 10 });
            console.log('++++ changesetsWithFilePath');
            console.log(JSON.stringify(changesetsWithFilePath));
            console.log('++++ queue');
            console.log(queue);

            for (const changeset of changesetsWithFilePath)
                queue.push(async () => this.downloadChangesetFileWithRetry({
                    authorization: params.authorization,
                    iModelId: params.iModelId,
                    changeset,
                    abortSignal: params.abortSignal,
                    downloadCallback,
                    firstDownloadFailedCallback: downloadFailedCallback
                }));
            await queue.waitAll();
        }
        console.log("all done");
        console.log(result);
        return result;
    }

    async provideDownloadCallbacks(params: any) {
        console.log("ChangesetOperations provideDownloadCallbacks params");
        console.log(params);
        
        // if (!params.progressCallback)
        //     return;
        let totalSize = 0;
        let totalDownloaded = 0;
        const result: any = await this.getMinimalListRequest(params);
        console.log('result');
        console.log(JSON.stringify(result));
        // for await (const changesetPage of this.getMinimalListRequest(params).byPage()) {
        for (const changeset of result) {
            totalSize += changeset.fileSize;
            const filePath = path.join(params.targetDirectoryPath, this.createFileName(changeset.id));
            if (await this.isChangesetAlreadyDownloaded(filePath, changeset.fileSize))
                totalDownloaded += changeset.fileSize;
        }
        // }
        console.log(`totalDownloaded => ${totalDownloaded}`);
        console.log(`totalSize => ${totalSize}`);
        const progressCallback = (downloaded: any) => {
            var _a;
            totalDownloaded += downloaded;
            (_a = params.progressCallback) === null || _a === void 0 ? void 0 : _a.call(params, totalDownloaded, totalSize);
        };
        // We increase total size to prevent cases where downloaded size is larger than total size at the end of the download.
        const downloadFailedCallback = (downloadedBeforeFailure: any) => totalSize += downloadedBeforeFailure;
        console.log('downloadFailedCallback');
        console.log(downloadFailedCallback);
        console.log("--- before end")
        return [progressCallback, downloadFailedCallback];
    }

    getMinimalListRequest = async (params: any): Promise<any[]> => {
        const entityCollectionAccessor = (response: any) => {
            console.log("inside entityCollectionAccessor response");
            console.log(JSON.stringify(response));

            const changesets = response.instances;
            const mappedChangesets = changesets.map((changeset: any) => this.appendRelatedMinimalEntityData(changeset));
            console.log("mappedChangesets");
            console.log(mappedChangesets);
            return mappedChangesets;
        };
        // return new EntityListIteratorImpl(async () => this.getEntityCollectionPage({
        //     authorization: params.authorization,
        //     url: this._options.urlFormatter.getChangesetListUrl({ iModelId: params.iModelId, urlParams: params.urlParams }),
        //     preferReturn: PreferReturn.Minimal,
        //     entityCollectionAccessor
        // }));
        let url = this._options.urlFormatter.getChangesetListUrl({ iModelId: params.iModelId, urlParams: {  "$select": "*,FileAccessKey-forward-AccessKey.*"} });
        console.log(`url: ${url}`);

        const response: any = await this.sendGetRequest({
            authorization: params.authorization,
            url: url
        });

        const result = entityCollectionAccessor(response);

        console.log("getMinimalListRequest result");
        console.log(result);

        return result;
    }
    appendRelatedMinimalEntityData(changeset: any) {
        // const getCreator = async () => {
        //     var _a;
        //     return (0, SharedFunctions_1.getUser)(authorization, this._iModelsClient.users, this._options.urlFormatter, (_a = changeset._links.creator) === null || _a === void 0 ? void 0 : _a.href);
        // };
        console.log("&&&&&&&&&&&&");
        console.log(JSON.stringify(changeset))
        const changeSetProperty = changeset.properties;
        const result = {
            "id": changeSetProperty["Id"],
            "displayName": changeSetProperty["Index"],
            "description": changeSetProperty["Description"],
            "index": changeSetProperty["Index"]*1,
            "parentId": changeSetProperty["ParentId"],
            "briefcaseId": changeSetProperty["BriefcaseId"],
            "fileSize": changeSetProperty["FileSize"]*1,
            "state": changeSetProperty["IsUploaded"] == true ? "fileUploaded" : "",
            "containingChanges": changeSetProperty["ContainingChanges"],
            "creatorId": changeSetProperty["UserCreated"],
            "pushDateTime": changeSetProperty["PushDate"],
            "downloadUrl": changeset.relationshipInstances? changeset.relationshipInstances[0].relatedInstance.properties['DownloadUrl'] : ''
        };
        return result;
    }

    appendRelatedMinimalEntityCallbacksData(changeset: any) {
        console.log(":inside appendRelatedMinimalEntityCallbacksData");
        console.log('changeset');
        console.log(JSON.stringify(changeset));
        const changeSetProperty = changeset.properties;
        const result = {
            "id": changeSetProperty["Id"],
            "displayName": changeSetProperty["Index"],
            "description": changeSetProperty["Description"],
            "index": changeSetProperty["Index"]*1,
            "parentId": changeSetProperty["ParentId"],
            "briefcaseId": changeSetProperty["BriefcaseId"],
            "fileSize": changeSetProperty["FileSize"]*1,
            "state": changeSetProperty["IsUploaded"] == true ? "fileUploaded" : "",
            "containingChanges": changeSetProperty["ContainingChanges"],
            "creatorId": changeSetProperty["UserCreated"],
            "pushDateTime": changeSetProperty["PushDate"],
            "downloadUrl": changeset.relationshipInstances? changeset.relationshipInstances[0].relatedInstance.properties['DownloadUrl'] : ''
        };
        console.log('result');
        console.log(result);
        return result;
    }

    async getRepresentationListMethod(params: any) : Promise<any[]> {
        const entityCollectionAccessor = (response: any) => {
            console.log("inside the getRepresentationListMethod entityCollectionAccessor");
            console.log('response');
            console.log(response);
            const changesets = response.instances;
            console.log('JSON.stringify(changesets)');
            console.log(JSON.stringify(changesets));
            const mappedChangesets = changesets.map((changeset: any) => this.appendRelatedEntityCallbacksMethod(changeset));
            console.log('mappedChangesets to return');
            console.log(mappedChangesets);
            return mappedChangesets;
        };
        const url = this._options.urlFormatter.getChangesetListUrl({ iModelId: params.iModelId });
        console.log('url');
        console.log(url);
        // const response: EntityListIteratorImpl<Changeset> =  new EntityListIteratorImpl(async () => this.getEntityCollectionPage({
        //     authorization: params.authorization,
        //     url: this._options.urlFormatter.getChangesetListUrl({ iModelId: params.iModelId, urlParams: params.urlParams }),
        //     preferReturn: PreferReturn.Representation,
        //     entityCollectionAccessor
        // }));
        // console.log('response');
        // console.log(response);
        // return response;

        const response: any = await this.sendGetRequest({
            authorization: params.authorization,
            url: this._options.urlFormatter.getChangesetListUrl({ iModelId: params.iModelId, urlParams: {  "$select": "*,FileAccessKey-forward-AccessKey.*"} }),
        });

        const result = entityCollectionAccessor(response);

        console.log("getRepresentationListMethod result");
        console.log(result);

        return result;
    }

    appendRelatedEntityCallbacksMethod(changeset: any) {
        // const getNamedVersion = async () => { var _a; return this.getNamedVersionMethod(authorization, (_a = changeset._links.namedVersion) === null || _a === void 0 ? void 0 : _a.href); };
        // const getCurrentOrPrecedingCheckpoint = async () => { var _a; return this.getCurrentOrPrecedingCheckpointMethod(authorization, (_a = changeset._links.currentOrPrecedingCheckpoint) === null || _a === void 0 ? void 0 : _a.href); };
        const changesetWithMinimalCallbacks = this.appendRelatedMinimalEntityCallbacksData(changeset);
        const result = {
            ...changesetWithMinimalCallbacks,
            // getNamedVersion,
            // getCurrentOrPrecedingCheckpoint
        };
        return result;
    }

    async getNamedVersionMethod(authorization: any, namedVersionLink: any) {
        if (!namedVersionLink)
            return undefined;
        const { iModelId, namedVersionId } = this._options.urlFormatter.parseNamedVersionUrl(namedVersionLink);
        return this._iModelsClientInstance.namedVersions.getSingle({
            authorization,
            iModelId,
            namedVersionId
        });
    }

    async getCurrentOrPrecedingCheckpointMethod(authorization: any, currentOrPrecedingCheckpointLink: any) {
        if (!currentOrPrecedingCheckpointLink)
            return undefined;
        const entityIds = this._options.urlFormatter.parseCheckpointUrl(currentOrPrecedingCheckpointLink);
        return this._iModelsClientInstance.checkpoints.getSingle({
            authorization,
            ...entityIds
        });
    }
    throwIfAbortError(error: any, changeset: any) {
        if (!(isIModelsApiError)(error) || error.code !== IModelsErrorCode.DownloadAborted)
            return;
        error.message = `Changeset download was aborted. Changeset id: ${changeset.id}, message: ${error.message}}.`;
        throw error;
    }

}