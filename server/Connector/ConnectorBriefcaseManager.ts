import { BriefcaseManager, IModelHost, IModelJsFs } from "@itwin/core-backend";
import { ChangeSetStatus, ChangesetType, IModelError } from "@itwin/core-common";
import { IModelHubStatus, BeDuration, IModelStatus } from "@itwin/core-bentley";


export default class ConnectorBriefcaseManager extends BriefcaseManager {


    static async _pushChanges(db: any, arg: any) {
        console.log("inside Connector BriefcaseManager _pushChanges")

        var _a, _b;
        const changesetProps = db.nativeDb.startCreateChangeset();
        changesetProps.briefcaseId = db.briefcaseId;
        changesetProps.description = arg.description;
        changesetProps.size = (_a = IModelJsFs.lstatSync(changesetProps.pathname)) === null || _a === void 0 ? void 0 : _a.size;

        console.log('changesetProps');
        console.log(changesetProps);

        if (!changesetProps.size) // either undefined or 0 means error
            throw new IModelError(IModelStatus.NoContent, "error creating changeset");
        let retryCount = (_b = arg.pushRetryCount) !== null && _b !== void 0 ? _b : 3;
        while (true) {
            try {
                // const accessToken = await IModelHost.getAccessToken();
                let index: number = await IModelHost.hubAccess.pushChangeset({ accessToken: arg.accessToken, iModelId: db.iModelId, changesetProps });
                console.log('index');
                console.log(index)
                console.log(typeof index)
                index = index*1
                db.nativeDb.completeCreateChangeset({ index });
                console.log("done 1")
                db.changeset = db.nativeDb.getCurrentChangeset();
                console.log("done 2")
                if (!arg.retainLocks)
                    await db.releaseAllLocks();
                console.log("-------------")
                return;
            }
            catch (err: any) {
                console.log("************* error");
                console.log(err);
                const shouldRetry = () => {
                    if (retryCount-- <= 0)
                        return false;
                    switch (err.errorNumber) {
                        case IModelHubStatus.AnotherUserPushing:
                        case IModelHubStatus.DatabaseTemporarilyLocked:
                        case IModelHubStatus.OperationFailed:
                            return true;
                    }
                    return false;
                };
                if (!shouldRetry()) {
                    db.nativeDb.abandonCreateChangeset();
                    throw err;
                }
            }
            finally {
                IModelJsFs.removeSync(changesetProps.pathname);
            }
        }
    }


    private static async _applySingleChangeset(db: any, changesetFile: any) {
        try {
            // console.log("inside Connector BriefcaseManager _applySingleChangeset")
            if (changesetFile.changesType === ChangesetType.Schema)
                db.clearCaches(); // for schema changesets, statement caches may become invalid. Do this *before* applying, in case db needs to be closed (open statements hold db open.)
    
            console.log('changesetFile');
            console.log(changesetFile);
            console.log("Ooooooooooooooom")
            console.log('db.nativeDb.getCurrentChangeset()')
            console.log(db.nativeDb.getCurrentChangeset())
            
            console.log( 'db.nativeDb');
            console.log( db.nativeDb);
            db.nativeDb.applyChangeset(changesetFile);
            console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
            db.changeset = db.nativeDb.getCurrentChangeset();
            // we're done with this changeset, delete it
            IModelJsFs.removeSync(changesetFile.pathname);
        } catch(e) {
            console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Error")
            console.log(e);
            throw new Error((e as any).message);
        }
    }


    static override async pullAndApplyChangesets(db: any, arg: any) {
        try {
            console.log("inside Connector BriefcaseManager pullAndApplyChangesets")
            // console.log('db');
            // console.log(db);
            console.log('arg');
            console.log(arg);
            if (!db.isOpen || db.nativeDb.isReadonly()) // don't use db.isReadonly - we reopen the file writable just for this operation but db.isReadonly is still true
                throw new IModelError(ChangeSetStatus.ApplyError, "Briefcase must be open ReadWrite to process change sets");
            let currentIndex = db.changeset.index;
            console.log(`currentIndex => ${currentIndex}`);
            if (currentIndex === undefined)
                currentIndex = (await IModelHost.hubAccess.queryChangeset({ accessToken: arg.accessToken, iModelId: db.iModelId, changeset: { id: db.changeset.id } })).index;
            console.log(`step 2 currentIndex => ${currentIndex}`);
            const reverse = (arg.toIndex && arg.toIndex < currentIndex) ? true : false;
            console.log("{ first: reverse ? arg.toIndex + 1 : currentIndex + 1, end: reverse ? currentIndex : arg.toIndex }");
            console.log({ first: reverse ? arg.toIndex + 1 : currentIndex + 1, end: reverse ? currentIndex : arg.toIndex });
            // Download change sets
            const changesets = await IModelHost.hubAccess.downloadChangesets({
                accessToken: arg.accessToken,
                iModelId: db.iModelId,
                range: { first: reverse ? arg.toIndex + 1 : currentIndex + 1, end: reverse ? currentIndex : arg.toIndex },
                targetDir: BriefcaseManager.getChangeSetsPath(db.iModelId),
                progressCallback: arg.onProgress,
            });

            // const changesets: any = [];


    
            console.log('changesets');
            console.log(changesets);

            console.log('db');
            console.log(db.nativeDb.getCurrentChangeset());
            if (changesets.length === 0)
                return; // nothing to apply
            if (reverse)
                changesets.reverse();
            for (const changeset of changesets)
                await this._applySingleChangeset(db, changeset);
            // notify listeners
            // db.notifyChangesetApplied();
        } catch(e) {
            console.log("pullAndApplyChangesets error");
            console.log(e);
            throw new Error((e as any).message);
        }
    }

    static override async pullMergePush(db: any, arg: any) {
        // console.log("inside ConnectorBriefcaseManager pullMergePush");
        // console.log('db');
        // console.log(db);
        // console.log('arg');
        // console.log(arg);
        var _a, _b;
        let retryCount = (_a = arg.mergeRetryCount) !== null && _a !== void 0 ? _a : 5;
        while (true) {
            try {
                await ConnectorBriefcaseManager.pullAndApplyChangesets(db, arg);
                return await ConnectorBriefcaseManager._pushChanges(db, arg);
            }
            catch (err: any) {
                if (retryCount-- <= 0 || err.errorNumber !== IModelHubStatus.PullIsRequired)
                    throw (err);
                await ((_b = arg.mergeRetryDelay) !== null && _b !== void 0 ? _b : BeDuration.fromSeconds(3)).wait();
            }
        }
    }
    
}