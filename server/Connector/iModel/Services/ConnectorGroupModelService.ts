import { DefinitionModel, DefinitionPartition, GroupInformationModel, GroupInformationPartition, PhysicalModel, PhysicalPartition, SubjectOwnsPartitionElements } from "@itwin/core-backend";
import { Id64String } from "@itwin/core-bentley";
import { InformationPartitionElementProps, RelationshipProps } from "@itwin/core-common";
import { ModelElementNames, ModelNames } from "../Models";
import { TowerConnectorGroupInformationModel } from "../SchemaClasses/TowerConnectorGroupInformationModel";


export const queryTowerInformationGroup = (synchronizer: any, jobSubject: any): Id64String | undefined =>  {
    return synchronizer.imodel.elements.queryElementIdByCode(GroupInformationPartition.createCode(synchronizer.imodel, jobSubject.id, ModelElementNames.TowerInformationGroupInformationElement));
}

export const queryPhysicalModel = (synchronizer: any, jobSubject: any): Id64String | undefined => {
    return synchronizer.imodel.elements.queryElementIdByCode(PhysicalPartition.createCode(synchronizer.imodel, jobSubject.id, ModelNames.TowerPhysicalModel));
}

export const queryDefinitionModel = (synchronizer: any, jobSubject: any): Id64String | undefined => {
    const code = DefinitionPartition.createCode(synchronizer.imodel, jobSubject.id, ModelElementNames.RootSubjectInformationPartitionElement);
    return synchronizer.imodel.elements.queryElementIdByCode(code);
}


export class ConnectorGroupModelService {

    private synchronizer: any;
    private jobSubject: any
    private repositoryModelId: any
    private repositoryLinkId: any
    constructor(synchronizer: any, jobSubject: any, repositoryModelId: any, repositoryLinkId: any) {
        this.synchronizer = synchronizer
        this.jobSubject = jobSubject
        this.repositoryModelId = repositoryModelId
        this.repositoryLinkId = repositoryLinkId
    }


    public createTowerConnectorGroupInformationModel(): Id64String {
        const existingId = queryTowerInformationGroup(this.synchronizer, this.jobSubject);
        // console.log(`existingId => ${existingId}`)
        if (undefined !== existingId) {
            return existingId;
        }

        // console.log(`this.jobSubject.id => ${this.jobSubject.id}`)
        // Create an InformationPartitionElement for the TestConnectorGroupModel to model
        const partitionProps: InformationPartitionElementProps = {
            classFullName: GroupInformationPartition.classFullName,
            model: this.repositoryModelId,
            parent: new SubjectOwnsPartitionElements(this.jobSubject.id),
            code: GroupInformationPartition.createCode(this.synchronizer.imodel, this.jobSubject.id, ModelElementNames.TowerInformationGroupInformationElement),
        };

        // console.log('partitionProps');
        // console.log(partitionProps);
        const partitionId = this.synchronizer.imodel.elements.insertElement(partitionProps);

        return this.synchronizer.imodel.models.insertModel({ classFullName: TowerConnectorGroupInformationModel.classFullName, modeledElement: { id: partitionId } });
    }

    public createPhysicalModel(): Id64String {
        const existingId =  queryPhysicalModel(this.synchronizer, this.jobSubject);
        if (undefined !== existingId) {
            return existingId;
        }

        const modelid = PhysicalModel.insert(this.synchronizer.imodel, this.jobSubject.id, ModelNames.TowerPhysicalModel);

        // relate this model to the source data
        const relationshipProps: RelationshipProps = {
            sourceId: modelid,
            targetId: this.repositoryLinkId,
            classFullName: "BisCore.ElementHasLinks",
        };
        this.synchronizer.imodel.relationships.insertInstance(relationshipProps);
        return modelid;
    }

    public createDefinitionModel(): Id64String {
        const existingId = queryDefinitionModel(this.synchronizer, this.jobSubject);
        if (undefined !== existingId) {
            return existingId;
        }

        // Create an InformationPartitionElement for the ConnectorDefinitionModel to model
        const partitionProps: InformationPartitionElementProps = {
            classFullName: DefinitionPartition.classFullName,
            model: this.repositoryModelId,
            parent: new SubjectOwnsPartitionElements(this.jobSubject.id),
            code: DefinitionPartition.createCode(this.synchronizer.imodel, this.jobSubject.id, ModelElementNames.RootSubjectInformationPartitionElement),
        };
        const partitionId = this.synchronizer.imodel.elements.insertElement(partitionProps);

        return this.synchronizer.imodel.models.insertModel({ classFullName: DefinitionModel.classFullName, modeledElement: { id: partitionId } });
    }
}