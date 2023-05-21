import * as fs from "fs";
import * as path from "path";
import * as xmlJs from "xml-js";
import * as hash from "object-hash";
import { BaseConnector, ItemState, SourceItem, SynchronizationResults } from "@itwin/connector-framework";
import { AccessToken, Id64String, assert, IModelStatus, Logger } from "@itwin/core-bentley";
import { BisCoreSchema, CategorySelector, DefinitionModel, DefinitionPartition, DisplayStyle3d, DisplayStyleCreationOptions, ElementGroupsMembers, GeometryPart, Group, GroupInformationPartition, IModelJsFs, ModelSelector, OrthographicViewDefinition, PhysicalElement, PhysicalModel, PhysicalPartition, RenderMaterialElement, SpatialCategory, SubCategory, Subject, SubjectOwnsPartitionElements, ViewDefinition3d } from "@itwin/core-backend";
import type { SourceDocument } from "@itwin/connector-framework";
import { AxisAlignedBox3dProps, CodeScopeSpec, CodeSpec, ColorByName, ColorDef, ColorDefProps, GeometryPartProps, GeometryStreamBuilder, IModel, IModelError, InformationPartitionElementProps, RelationshipProps, RenderMode, SubCategoryAppearance, ViewFlags } from "@itwin/core-common";
import { Box, Cone, LinearSweep, Loop, Matrix3d, Point3d, Range3d, SolidPrimitive, StandardViewIndex, Transform, Vector3d } from "@itwin/core-geometry";
import { ConnectorSchema } from "./ConnectorSchema";
import { KnownLocations } from "./KnownLocations";
import { ConnectorGroupModelService, queryDefinitionModel, queryPhysicalModel } from "./iModel/Services/ConnectorGroupModelService";
import { importSourceData } from "./iModel/Services/SourceDataService";
import { CategoryDefinitionModel } from "./iModel/Services/CategoryDefinitionModel";
import { MaterialDefinitionModel } from "./iModel/Services/MaterialDefinitionModel";
import { TowerInformationGroupInformationElement } from "./iModel/Services/TowerInformationGroupInformationElement";
import { TowerPhysicalElementService } from "./iModel/Services/TowerPhysicalElementService";
import { Categories } from "./iModel/Categories";
import { mandateConvertFeetToMeter } from "./ConnectorUtils";

export enum CodeSpecs {
    TowerInformation = "TowerConnector:TowerInformation",
    TowerPanelInformation = "TowerConnector:TowerPanelInformation",
    TowerMountPropertyInformation = "TowerConnector:TowerMountPropertyInformation",
    TowerMountPipePropertyInformation = "TowerConnector:TowerMountPipePropertyInformation",
    TowerAntennaPropertyInformation = "TowerConnector:TowerAntennaPropertyInformation",
    TowerAttachmentPropertyInformation = "TowerConnector:TowerAttachmentPropertyInformation",
    TowerAppurtenancePropertyInformation = "TowerConnector:TowerAppurtenancePropertyInformation",
    TowerPolePropertyInformation = "TowerConnector:TowerPolePropertyInformation",
}


export default class TowerConnector extends BaseConnector {

    private _data: any;
    private _sourceDataState: ItemState = ItemState.New;
    private _sourceData?: string;
    private _repositoryLinkId?: Id64String;

    private get repositoryLinkId(): Id64String {
        assert(this._repositoryLinkId !== undefined);
        return this._repositoryLinkId;
    }

    public getApplicationVersion(): string {
        return "1.0.0.0";
    }

    public getConnectorName(): string {
        return "TowerConnector";
    }

    public static override async create(): Promise<TowerConnector> {
        return new TowerConnector();
    }

    // __PUBLISH_EXTRACT_START__ TowerConnector-initializeJob.example-code
    public async initializeJob(): Promise<void> {
        console.log("inside the initializeJob method");

        console.log(`ItemState.New => ${ItemState.New}`);
        console.log(`this._sourceDataState => ${this._sourceDataState}`)

        if (ItemState.New === this._sourceDataState) {
            this.createConnectorStartUpModel();
        }
    }

    // __PUBLISH_EXTRACT_START__ TowerConnector-importDomainSchema.example-code
    public async importDomainSchema(_requestContext: AccessToken): Promise<any> {
        console.log("inside the importDomainSchema method");
        if (this._sourceDataState === ItemState.Unchanged) {
            return;
        }
        ConnectorSchema.registerSchema();
        console.log("no ConnectorSchema Registered")

        const fileName = path.join(KnownLocations.assetsDir, "iModelHubSchema/Connector.ecschema.xml");
        console.log(`fileName => ${fileName}`)

        await this.synchronizer.imodel.importSchemas([fileName]);
    }

    // __PUBLISH_EXTRACT_START__ TowerConnector-importDynamicSchema.example-code  
    public async importDynamicSchema(requestContext: AccessToken): Promise<any> {
        console.log(`requestContext : ${requestContext}`)
        console.log("inside the importDynamicSchema method");
        // if (null === requestContext)
        //     return;


    }

    // __PUBLISH_EXTRACT_START__ TowerConnector-importDefinitions.example-code
    // importDefinitions is for definitions that are written to shared models such as DictionaryModel
    public async importDefinitions(): Promise<any> {
        console.log("inside the importDefinitions method");
        if (this._sourceDataState === ItemState.Unchanged) {
            return;
        }
        this.insertCodeSpecs()


    }

    // __PUBLISH_EXTRACT_START__ TowerConnector-openSourceData.example-code
    public async openSourceData(sourcePath: string): Promise<void> {
        console.log("inside the openSourceData method");

        console.log(`sourcePath => ${sourcePath}`);

        this._data = importSourceData(sourcePath);
        console.log('this._data done');
        // console.log(JSON.stringify(this._data));
        this._sourceData = sourcePath;
        const documentStatus = this.getDocumentStatus(); // make sure the repository link is created now, while we are in the repository channel
        console.log('documentStatus');
        console.log(documentStatus);
        this._sourceDataState = documentStatus.itemState;
        assert(documentStatus.elementProps.id !== undefined);
        this._repositoryLinkId = documentStatus.elementProps.id;

    }

    // __PUBLISH_EXTRACT_START__ TowerConnector-updateExistingData.example-code
    public async updateExistingData() {
        console.log("inside updateExistingData method");

        console.log(`this._sourceDataState => ${this._sourceDataState}`);

        if (this._sourceDataState === ItemState.New) {

            // Insert Categories
            const categoryDefinitionModel = new CategoryDefinitionModel(this.synchronizer, this.jobSubject);
            categoryDefinitionModel.insertCategories();

            // Insert Materials
            const materialDefinitionModel = new MaterialDefinitionModel(this.synchronizer, this.jobSubject);
            materialDefinitionModel.insertMaterials();
        }

        const towerInformationGroupModel = new TowerInformationGroupInformationElement(this.synchronizer, this.jobSubject, this.repositoryLinkId);
        towerInformationGroupModel.updateTowerInformation(this._data['TowerInformation']);

        const towerPhysicalElementService = new TowerPhysicalElementService(this.synchronizer, this.jobSubject, this.repositoryLinkId, this._data,  IModel.repositoryModelId);
        
        // towerPhysicalElementService.processTowerAttachments();
        // towerPhysicalElementService.processTowerMounts();
        // // towerPhysicalElementService.processTowerMountPipes();
        // // towerPhysicalElementService.processTowerAppurtenances();
        // towerPhysicalElementService.processTowerAntennas(this._data['TowerInformation']['NoOfLegs']);
        // towerPhysicalElementService.processTowerPoles();
        // towerPhysicalElementService.processTowerPanelProperties();


        towerPhysicalElementService.processTowerPoles();
        towerPhysicalElementService.processTowerPanelProperties();
        towerPhysicalElementService.processTowerMounts();
        towerPhysicalElementService.processTowerMountPipes();
        towerPhysicalElementService.processTowerAntennas(this._data['TowerInformation']['NoOfLegs']);
        towerPhysicalElementService.processTowerAttachments();
        towerPhysicalElementService.processTowerAppurtenances();

        this.synchronizer.imodel.views.setDefaultViewId(this.createView("TowerConnectorView"));

        console.log("view created")


    }


    // Custom Code
    private insertCodeSpecs() {
        // TowerInformation
        if (this.synchronizer.imodel.codeSpecs.hasName(CodeSpecs.TowerInformation)) {
            return;
        }
        const towerInformationSpec = CodeSpec.create(this.synchronizer.imodel, CodeSpecs.TowerInformation, CodeScopeSpec.Type.Model);
        this.synchronizer.imodel.codeSpecs.insert(towerInformationSpec);

        // TowerPanelInformation
        if (this.synchronizer.imodel.codeSpecs.hasName(CodeSpecs.TowerPanelInformation)) {
            return;
        }
        const panelSpec = CodeSpec.create(this.synchronizer.imodel, CodeSpecs.TowerPanelInformation, CodeScopeSpec.Type.Model);
        this.synchronizer.imodel.codeSpecs.insert(panelSpec);
        
        // TowerMountPropertyInformation
        if (this.synchronizer.imodel.codeSpecs.hasName(CodeSpecs.TowerMountPropertyInformation)) {
            return;
        }
        const mountPropertySpec = CodeSpec.create(this.synchronizer.imodel, CodeSpecs.TowerMountPropertyInformation, CodeScopeSpec.Type.Model);
        this.synchronizer.imodel.codeSpecs.insert(mountPropertySpec);
        
        // TowerMountPipePropertyInformation
        if (this.synchronizer.imodel.codeSpecs.hasName(CodeSpecs.TowerMountPipePropertyInformation)) {
            return;
        }
        const mountPipePropertySpec = CodeSpec.create(this.synchronizer.imodel, CodeSpecs.TowerMountPipePropertyInformation, CodeScopeSpec.Type.Model);
        this.synchronizer.imodel.codeSpecs.insert(mountPipePropertySpec);
        
        // TowerAntennaPropertyInformation
        if (this.synchronizer.imodel.codeSpecs.hasName(CodeSpecs.TowerAntennaPropertyInformation)) {
            return;
        }
        const antennaPropertySpec = CodeSpec.create(this.synchronizer.imodel, CodeSpecs.TowerAntennaPropertyInformation, CodeScopeSpec.Type.Model);
        this.synchronizer.imodel.codeSpecs.insert(antennaPropertySpec);
        
        // TowerAttachmentPropertyInformation
        if (this.synchronizer.imodel.codeSpecs.hasName(CodeSpecs.TowerAttachmentPropertyInformation)) {
            return;
        }
        const attachmentPropertySpec = CodeSpec.create(this.synchronizer.imodel, CodeSpecs.TowerAttachmentPropertyInformation, CodeScopeSpec.Type.Model);
        this.synchronizer.imodel.codeSpecs.insert(attachmentPropertySpec);
        
        // TowerAppurtenancePropertyInformation
        if (this.synchronizer.imodel.codeSpecs.hasName(CodeSpecs.TowerAppurtenancePropertyInformation)) {
            return;
        }
        const appurtenancePropertySpec = CodeSpec.create(this.synchronizer.imodel, CodeSpecs.TowerAppurtenancePropertyInformation, CodeScopeSpec.Type.Model);
        this.synchronizer.imodel.codeSpecs.insert(appurtenancePropertySpec);
       
        // TowerPolePropertyInformation
        if (this.synchronizer.imodel.codeSpecs.hasName(CodeSpecs.TowerPolePropertyInformation)) {
            return;
        }
        const polePropertySpec = CodeSpec.create(this.synchronizer.imodel, CodeSpecs.TowerPolePropertyInformation, CodeScopeSpec.Type.Model);
        this.synchronizer.imodel.codeSpecs.insert(polePropertySpec);
    }

    private createConnectorStartUpModel() {
        const connectorGroupModelService = new ConnectorGroupModelService(this.synchronizer, this.jobSubject, IModel.repositoryModelId, this.repositoryLinkId);
        connectorGroupModelService.createTowerConnectorGroupInformationModel();
        connectorGroupModelService.createPhysicalModel();
        connectorGroupModelService.createDefinitionModel();
    }

    private getDocumentStatus(): SynchronizationResults {
        let timeStamp = Date.now();
        assert(this._sourceData !== undefined, "we should not be in this method if the source file has not yet been opened");
        const stat = IModelJsFs.lstatSync(this._sourceData); // will throw if this._sourceData names a file that does not exist. That would be a bug. Let it abort the job.

        if (undefined !== stat) {
            timeStamp = stat.mtimeMs;
        }

        BisCoreSchema

        const sourceDoc: SourceDocument = {
            docid: this._sourceData,
            lastModifiedTime: timeStamp.toString(),
            checksum: () => undefined,
        };

        console.log('sourceDoc')
        console.log(sourceDoc)
        const documentStatus = this.synchronizer.recordDocument(sourceDoc);
        console.log('documentStatus');
        console.log(documentStatus);
        if (undefined === documentStatus) {
            const error = `Failed to retrieve a RepositoryLink for ${this._sourceData}`;
            throw new IModelError(IModelStatus.BadArg, error);
        }
        return documentStatus;
    }

    private createView(name: string): Id64String {
        console.log("inside the createView method");
        // console.log('definitionModelId');
        // console.log(definitionModelId);
        // console.log('physicalModelId');
        // console.log(physicalModelId);
        // console.log('name');
        // console.log(name);
        const definitionModelId = queryDefinitionModel(this.synchronizer, this.jobSubject);
        const physicalModelId = queryPhysicalModel(this.synchronizer, this.jobSubject);
        const code = OrthographicViewDefinition.createCode(this.synchronizer.imodel, definitionModelId!, name);

        // console.log('code');
        // console.log(code);

        const viewId = this.synchronizer.imodel.elements.queryElementIdByCode(code);
        console.log('viewId');
        console.log(viewId);
        if (undefined !== viewId) {
            return viewId;
        }


        const categorySelectorId = this.createCategorySelector(definitionModelId!);
        const modelSelectorId = this.createModelSelector(definitionModelId!, physicalModelId!);
        const displayStyleId = this.createDisplayStyle(definitionModelId!);

        // console.log('categorySelectorId');
        // console.log(categorySelectorId);
        console.log('modelSelectorId');
        console.log(modelSelectorId);
        console.log('displayStyleId');
        console.log(displayStyleId);


        // let imodelProjectExtents: AxisAlignedBox3dProps = {
        //     low: {
        //         x: -10,
        //         y: -10,
        //         z: -10,
        //     },
        //     high: {
        //         x: 100,
        //         y: 100,
        //         z: 100
        //     }
        // }

        let towerX: any = mandateConvertFeetToMeter(this._data['TowerInformation']["TopFaceWidth"]) + 5;
        let towerY: any = mandateConvertFeetToMeter(this._data['TowerInformation']["TopFaceDepth"]) + 5;
        let towerZ: any = mandateConvertFeetToMeter(this._data['TowerInformation']["TowerHeight"]) + 5;
        console.log(`towerX: ${towerX}`);
        console.log(`towerY: ${towerY}`);
        console.log(`towerZ: ${towerZ}`);
        const originalExtents = this.synchronizer.imodel.projectExtents; 
        console.log("originalExtents");
        console.log(originalExtents);
        const newExtents = Range3d.create(originalExtents.low, originalExtents.high);
        newExtents.low.x = -towerX;
        newExtents.low.y = -towerY;
        newExtents.low.z = 0;
        newExtents.high.x = +towerX;
        newExtents.high.y = +towerY;
        newExtents.high.z = towerZ;
        console.log('newExtents');
        console.log(newExtents);
        this.synchronizer.imodel.updateProjectExtents(newExtents);

        console.log("===== new")
        console.log('this.synchronizer.imodel.projectExtents');
        console.log(this.synchronizer.imodel.projectExtents);

        const rotation = Matrix3d.createStandardWorldToView(StandardViewIndex.Front);
        console.log("rotation");
        console.log(rotation);
        const rotationTransform = Transform.createOriginAndMatrix(undefined, rotation);
        console.log("rotationTransform");
        console.log(rotationTransform);
        const rotatedRange = rotationTransform.multiplyRange(this.synchronizer.imodel.projectExtents);
        console.log("rotatedRange");
        console.log(rotatedRange);
        // rotatedRange.low.z = rotatedRange.low.y
        // rotatedRange.high.z = rotatedRange.high.y
        // rotatedRange.low.y = rotatedRange.low.x
        // rotatedRange.high.y = rotatedRange.high.x
        console.log("after rotatedRange");
        console.log(rotatedRange);
        console.log('rotatedRange.diagonal()')
        console.log(rotatedRange.diagonal())

        // let lowPoint = Point3d.create(-10, -10, -10)
        // let highPoint = Point3d.create(100, 100, projectionMaxHeight)
        // let imodelProjectExtentsRange = Range3d.create(lowPoint, highPoint)
        // this.synchronizer.imodel.updateProjectExtents(imodelProjectExtentsRange)

        // console.log(`this.synchronizer.imodel.projectExtents`);
        // console.log(this.synchronizer.imodel.projectExtents);

        const view = OrthographicViewDefinition.create(this.synchronizer.imodel, definitionModelId!, name, modelSelectorId, categorySelectorId, displayStyleId, rotatedRange, StandardViewIndex.Front);
        console.log('view.extents')
        console.log(view.extents)
        view.extents = Vector3d.create(10, 10, 10);
        view.camera.setEyePoint(Point3d.create( 5, 5, 10))
        console.log('view');
        console.log(view);

        view.insert();

        // console.log('view.id');
        // console.log(view.id);

        return view.id;
    }

    private createCategorySelector(definitionModelId: Id64String): Id64String {
        const code = CategorySelector.createCode(this.synchronizer.imodel, definitionModelId, "Default");
        const selectorId = this.synchronizer.imodel.elements.queryElementIdByCode(code);
        if (undefined !== selectorId) {
            return selectorId;
        }

        const categoryId = SpatialCategory.queryCategoryIdByName(this.synchronizer.imodel, definitionModelId, Categories.Panels);
        if (undefined === categoryId) {
            throw new IModelError(IModelStatus.BadElement, "Unable to find StandardConnector Category");
        }
        return CategorySelector.insert(this.synchronizer.imodel, definitionModelId, "Default", []);
    }

    private createModelSelector(definitionModelId: Id64String, physicalModelId: Id64String): Id64String {
        const code = ModelSelector.createCode(this.synchronizer.imodel, definitionModelId, "Default");
        const selectorId = this.synchronizer.imodel.elements.queryElementIdByCode(code);
        if (undefined !== selectorId) {
            return selectorId;
        }
        return ModelSelector.insert(this.synchronizer.imodel, definitionModelId, "Default", [physicalModelId]);
    }

    private createDisplayStyle(definitionModelId: Id64String): Id64String {
        const code = DisplayStyle3d.createCode(this.synchronizer.imodel, definitionModelId, "Default");
        const displayStyleId = this.synchronizer.imodel.elements.queryElementIdByCode(code);
        if (undefined !== displayStyleId) {
            return displayStyleId;
        }
        const viewFlags: ViewFlags = new ViewFlags({ renderMode: RenderMode.SmoothShade });
        const options: DisplayStyleCreationOptions = {
            backgroundColor: ColorDef.fromTbgr(ColorByName.white),
            viewFlags,
        };
        const displayStyle: DisplayStyle3d = DisplayStyle3d.create(this.synchronizer.imodel, definitionModelId, "Default", options);
        displayStyle.insert();
        return displayStyle.id;
    }

}
