import * as hash from "object-hash";
import { ItemState, SourceItem, SynchronizationResults } from "@itwin/connector-framework";
import { IModelStatus } from "@itwin/core-bentley";
import { IModelError } from "@itwin/core-common";
import { queryTowerInformationGroup } from "./ConnectorGroupModelService";
import { TowerInformation, TowerInformationProps } from "../SchemaClasses/TowerInformation";


export class TowerInformationGroupInformationElement {

    private synchronizer: any;
    private jobSubject: any;
    private repositoryLinkId: any;
    constructor(synchronizer: any, jobSubject: any, repositoryLinkId: any) {
        this.synchronizer = synchronizer;
        this.jobSubject = jobSubject;
        this.repositoryLinkId = repositoryLinkId;
    }

    updateTowerInformation(towerInformation: any) {
        const groupModelId = queryTowerInformationGroup(this.synchronizer, this.jobSubject);
        if(groupModelId) {
            const xse = this.synchronizer.getExternalSourceElementByLinkId(this.repositoryLinkId);
            const str = JSON.stringify(towerInformation);
            const sourceItem: SourceItem = {
                source: xse?.id,
                scope: groupModelId,
                kind: "Group",
                id: towerInformation["TowerID"],
                checksum: () => hash.MD5(str),
            };
    
            const results = this.synchronizer.detectChanges(sourceItem);
            if (results.state === ItemState.Unchanged) {
                this.synchronizer.onElementSeen(results.id!);
                // continue;
            }
            if (towerInformation["Label"] === undefined) {
                throw new IModelError(IModelStatus.BadArg, "Name undefined for StandardConnector group");
            }
    
            const code = TowerInformation.createCode(this.synchronizer.imodel, groupModelId, towerInformation["TowerName"]);
            const props: TowerInformationProps = {
                classFullName: TowerInformation.classFullName,
                model: groupModelId,
                code,
                TowerID: towerInformation["TowerID"],
                ComponentName: towerInformation["ComponentName"],
                Label: towerInformation["Label"],
                TowerName: towerInformation["TowerName"],
                Description: towerInformation["Description"],
                UnitSystem: towerInformation["UnitSystem"],
                Convention: towerInformation["Convention"],
                BearingAngle: towerInformation["BearingAngle"],
                TowerType: towerInformation["TowerType"],
                TowerHeight: towerInformation["TowerHeight"],
                TopFaceWidth: towerInformation["TopFaceWidth"],
                TopFaceDepth: towerInformation["TopFaceDepth"],
                BottomFaceWidth: towerInformation["BottomFaceWidth"],
                BottomFaceDepth: towerInformation["BottomFaceDepth"],
                NoofPanel: towerInformation["NoofPanel"],
            };
            const sync: SynchronizationResults = {
                elementProps: props,
                itemState: results.state,
            };
            if (results.id !== undefined) // in case this is an update
                sync.elementProps.id = results.id;
            this.synchronizer.updateIModel(sync, sourceItem);
        }

    }
}