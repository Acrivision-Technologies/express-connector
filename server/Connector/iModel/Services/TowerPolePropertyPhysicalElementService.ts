import * as hash from "object-hash";
import { ItemState, SourceItem, SynchronizationResults } from "@itwin/connector-framework";
import { assert } from "@itwin/core-bentley";
import { ElementGroupsMembers, PhysicalElement } from "@itwin/core-backend";
import { TowerPoleElement } from "../SchemaClasses/TowerPoleElement";



export class TowerPolePropertyPhysicalElementService {

    private synchronizer: any;
    private jobSubject: any;
    private repositoryLinkId: any;
    private definitionModelId: any;
    private physicalModelId: any;
    private poleProperty: any;
    private nodes: any;
    private sections: any;

    constructor(synchronizer: any, jobSubject: any, repositoryLinkId: any, definitionModelId: any, physicalModelId: any, poleProperty: any, nodes: any, sections: any) {

        // this.physicalModelId = physicalModelId;
        // this.definitionModelId = definitionModelId;
        // this.groupModelId = groupModelId;
        this.synchronizer = synchronizer;
        this.jobSubject = jobSubject;
        this.repositoryLinkId = repositoryLinkId;
        this.definitionModelId = definitionModelId;
        this.physicalModelId = physicalModelId;
        this.poleProperty = poleProperty;
        this.nodes = nodes;
        this.sections = sections;
    }

    public processPole = (pole: any) => {

        const xse = this.synchronizer.getExternalSourceElementByLinkId(this.repositoryLinkId);
        const str = JSON.stringify(this.poleProperty);
        const sourceEleID: string =  "Pole_" + this.poleProperty["PoleID"];
        // console.log(`sourceEleID => ${sourceEleID}`)

        const sourceItem: SourceItem = {
            source: xse?.id,
            scope: this.physicalModelId,
            kind: "Pole_Property",
            id: sourceEleID,
            checksum: () => hash.MD5(str),
        };
        const results = this.synchronizer.detectChanges(sourceItem);
        if (results.state === ItemState.Unchanged) {
            this.synchronizer.onElementSeen(results.id!);
            return;
        }

        // console.log("creating mount element")

        let element: PhysicalElement;
        element = TowerPoleElement.create(this.synchronizer.imodel, this.physicalModelId, this.definitionModelId, this.nodes, this.sections, this.poleProperty, pole, sourceEleID);
        if(element) {
            // console.log(`element ******************************************************************************* `);
            // console.log(element);

            // console.log('results');
            // console.log(results);

            if (undefined !== results.id) {
                element.id = results.id;
            }
            const sync: SynchronizationResults = {
                elementProps: element.toJSON(),
                itemState: results.state,
            };
            // console.log('+++++++++++++++++++++++');
            // console.log('results.state');
            // console.log(results.state);
            this.synchronizer.updateIModel(sync, sourceItem);

            // console.log('-----------------------------------');
            // console.log(`this._data['TowerInformation']["TowerName"]`);
            // console.log(this._data['TowerInformation']["TowerName"])

            const groupCode = TowerPoleElement.createCode(this.synchronizer.imodel, this.jobSubject.id, sourceEleID);
            // console.log('groupCode');
            // console.log(groupCode);
            const groupElement = this.synchronizer.imodel.elements.queryElementIdByCode(groupCode);

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
            // console.log(`****** doCreate => ${doCreate}`)

            if (doCreate) {
                const rel = ElementGroupsMembers.create(this.synchronizer.imodel, groupElement, sync.elementProps.id!);
                rel.insert();
            }

        }

        // if(mount && mount['elements']) {
        //     const mountElements: any[] = mount['elements'];
        //     mountElements.forEach((ele: any, index: number) => {
    
    
        //     });
        // }

    }
}