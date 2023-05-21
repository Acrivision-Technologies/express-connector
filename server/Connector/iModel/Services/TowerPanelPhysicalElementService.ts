import { ItemState, SourceItem, SynchronizationResults } from "@itwin/connector-framework";
import { ElementGroupsMembers, GroupInformationModel, GroupInformationPartition, PhysicalElement, PhysicalModel, PhysicalPartition, SubjectOwnsPartitionElements } from "@itwin/core-backend";
import { assert } from "@itwin/core-bentley";
import * as hash from "object-hash";
import { TowerPanelElement } from "../SchemaClasses/TowerPanelElement";



export class TowerPanelPhysicalElementService {

    private synchronizer: any;
    private jobSubject: any;
    private repositoryLinkId: any;
    private definitaionModelId: any;
    private physicalModelId: any;
    private panelProperty: any;
    private nodes: any;
    private sections: any;

    constructor(synchronizer: any, jobSubject: any, panelProperty: any, nodes: any, sections: any, repositoryLinkId: any, definitaionModelId: any, physicalModelId: any) {

        this.synchronizer = synchronizer;
        this.jobSubject = jobSubject;
        this.repositoryLinkId = repositoryLinkId;
        this.definitaionModelId = definitaionModelId;
        this.physicalModelId = physicalModelId;
        this.panelProperty = panelProperty;
        this.nodes = nodes;
        this.sections = sections;
    }


    public processPanelPhysicalElementCreation = (panel: any) => {

        console.log("----- this.repositoryLinkId: ", this.repositoryLinkId)
        const xse = this.synchronizer.getExternalSourceElementByLinkId(this.repositoryLinkId);
        const str = JSON.stringify(this.panelProperty);
        const sourceEleID: string = "Panel-" + this.panelProperty["PanelID"];

        
        console.log(`sourceEleID => ${sourceEleID}`)

        const sourceItem: SourceItem = {
            source: xse?.id,
            scope: this.physicalModelId,
            kind: "Panel",
            id: sourceEleID,
            checksum: () => hash.MD5(str),
        };

        console.log('sourceItem');
        console.log(sourceItem);
        const results = this.synchronizer.detectChanges(sourceItem);
        console.log("+++++ results: ", results)
        if (results.state === ItemState.Unchanged) {
            this.synchronizer.onElementSeen(results.id!);
            return;
        }

        let element: PhysicalElement;
        element = TowerPanelElement.create(this.synchronizer.imodel, this.physicalModelId, this.definitaionModelId, this.panelProperty, sourceEleID, panel['Legs'], this.nodes, this.sections, panel['FaceBracingDetails'], panel['PlanBracingDetails']);

        if(element!) {
            if (undefined !== results.id) {
                element.id = results.id;
            }
            const sync: SynchronizationResults = {
                elementProps: element.toJSON(),
                itemState: results.state,
            };
            console.log('+++++++++++++++++++++++');
            console.log('results.state');
            console.log(results.state);
            this.synchronizer.updateIModel(sync, sourceItem);
    
            const groupCode = TowerPanelElement.createCode(this.synchronizer.imodel, this.jobSubject.id, sourceEleID);
            console.log('groupCode');
            console.log(groupCode);
            const groupElement = this.synchronizer.imodel.elements.queryElementIdByCode(groupCode);
            console.log('groupElement');
            console.log(groupElement);
    
            assert(groupElement !== undefined);
            let doCreate = results.state === ItemState.New;
    
            if (results.state === ItemState.Changed) {
                try {
                    ElementGroupsMembers.getInstance(this.synchronizer.imodel, { sourceId: groupElement, targetId: element.id });
                    doCreate = false;
                } catch (err) {
                    doCreate = true;
                }
            }
            console.log(`****** panel doCreate => ${doCreate}`)
    
            if (doCreate) {
                console.log('sync.elementProps.id');
                console.log(sync.elementProps.id);
                console.log('sync.elementProps');
                console.log(sync.elementProps);
                const rel = ElementGroupsMembers.create(this.synchronizer.imodel, groupElement, sync.elementProps.id!);
                rel.insert();
            }
        }

    }

}