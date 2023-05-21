import { AxisAlignedBox3d, Code, CodeScopeProps, CodeSpec, IModelError, PhysicalElementProps, Placement3d, Placement3dProps } from "@itwin/core-common";
import { IModelDb, PhysicalElement, SpatialCategory } from "@itwin/core-backend";
import { Id64String, IModelStatus, Logger } from "@itwin/core-bentley";
import {  XYZProps, YawPitchRollProps } from "@itwin/core-geometry";
import { ConnectorLoggerCategory } from "../../ConnectorLoggerCategory";
import { TowerMountPipeBuilder } from "../Geometry/TowerMountPipeGeometry";
import { CodeSpecs } from "../../TowerConnector";
import { Categories } from "../Categories";
import { TowerAntennaBuilder } from "../Geometry/TowerAntennaGeometry";
import { TowerAppurtenanceBuilder } from "../Geometry/TowerAppurtenanceGeometry";



const loggerCategory: string = ConnectorLoggerCategory.Connector;

export interface TowerAppurtenanceElementProps extends PhysicalElementProps {
    AppurtenancePropertyID: string;
    Label: string;
    StartElevation: string;
    EndElevation: string;
    Manufacturer: string;
    ModelName: string;
    Location: string;
    Depth: string;
    Width: string;
    ForceCoefficient: string;
    Weight: string;
    AttachmentID: string;
    Classification: string;
    ComponentName: string;
    SourceAppElementId: string;

}
export class TowerAppurtenanceElement extends PhysicalElement {
    public static override get className(): string { return "TowerAppurtenance"; }

    public AppurtenancePropertyID: string;
    public Label: string;
    public StartElevation: string;
    public EndElevation: string;
    public Manufacturer: string;
    public ModelName: string;
    public Location: string;
    public Depth: string;
    public Width: string;
    public ForceCoefficient: string;
    public Weight: string;
    public AttachmentID: string;
    public Classification: string;
    public ComponentName: string;
    public SourceAppElementId: string;


    public constructor(props: TowerAppurtenanceElementProps, iModel: IModelDb) {
        super(props, iModel);
        this.AppurtenancePropertyID = props.AppurtenancePropertyID
        this.Label = props.Label
        this.StartElevation = props.StartElevation
        this.EndElevation = props.EndElevation
        this.Manufacturer = props.Manufacturer
        this.ModelName = props.ModelName
        this.Location = props.Location
        this.Depth = props.Depth
        this.Width = props.Width
        this.ForceCoefficient = props.ForceCoefficient
        this.Weight = props.Weight
        this.AttachmentID = props.AttachmentID
        this.Classification = props.Classification
        this.ComponentName = props.ComponentName
        this.SourceAppElementId = props.SourceAppElementId
    }

    public override toJSON(): TowerAppurtenanceElementProps {
        const val = super.toJSON() as TowerAppurtenanceElementProps;
        val.AppurtenancePropertyID = this.AppurtenancePropertyID;
        val.Label = this.Label;
        val.StartElevation = this.StartElevation;
        val.EndElevation = this.EndElevation;
        val.Manufacturer = this.Manufacturer;
        val.ModelName = this.ModelName;
        val.Location = this.Location;
        val.Depth = this.Depth;
        val.Width = this.Width;
        val.ForceCoefficient = this.ForceCoefficient;
        val.Weight = this.Weight;
        val.AttachmentID = this.AttachmentID;
        val.Classification = this.Classification;
        val.ComponentName = this.ComponentName;
        val.SourceAppElementId = this.SourceAppElementId;
        return val;
    }

    public static createCode(iModelDb: IModelDb, scope: CodeScopeProps, codeValue: string): Code {
        const codeSpec: CodeSpec = iModelDb.codeSpecs.getByName(CodeSpecs.TowerAppurtenancePropertyInformation);
        return new Code({ spec: codeSpec.id, scope, value: codeValue });
    }

    public static create(imodel: IModelDb, physicalModelId: Id64String, definitionModelId: Id64String, appurtenanceNodes: any, sections: any, appurtenanceProperty: any, appurtenance: any, sourceEleID: any): PhysicalElement {
        const categoryId = SpatialCategory.queryCategoryIdByName(imodel, definitionModelId, Categories.Appurtenances);
        if (undefined === categoryId) {
            throw new IModelError(IModelStatus.BadElement, "Unable to find category id for StandardConnector category for createTowerAppurtenanceElement");
        }
        return this.createTowerAppurtenanceElement(imodel, physicalModelId, definitionModelId, appurtenanceNodes, sections, appurtenanceProperty, appurtenance, sourceEleID, categoryId, new TowerAppurtenanceBuilder(imodel, definitionModelId, categoryId, appurtenanceProperty), this.classFullName);
    }

    protected static createTowerAppurtenanceElement(imodel: IModelDb, physicalModelId: Id64String, definitionModelId: Id64String,  appurtenanceNodes: any, sections: any, appurtenanceProperty: any, appurtenance: any, sourceEleID: any, categoryId: any, towerAppurtenanceBuilder: TowerAppurtenanceBuilder, classFullName: string): PhysicalElement {
        const code = this.createCode(imodel, physicalModelId, sourceEleID);
        console.log(`definitionModelId => ${definitionModelId}`)

        console.log(`inside createTowerAppurtenanceElement`);
        console.log(JSON.stringify(appurtenance));

        const stream = towerAppurtenanceBuilder.createGeometry(appurtenance, appurtenanceNodes, sections);

        const props: TowerAppurtenanceElementProps = {
            code,
            category: categoryId,
            model: physicalModelId,
            classFullName,
            geom: stream,
            AppurtenancePropertyID: appurtenanceProperty['AppurtenancePropertyID'],
            Label: appurtenanceProperty['Label'],
            StartElevation: appurtenanceProperty['StartElevation'],
            EndElevation: appurtenanceProperty['EndElevation'],
            Manufacturer: appurtenanceProperty['Manufacturer'],
            ModelName: appurtenanceProperty['ModelName'],
            Location: appurtenanceProperty['Location'],
            Depth: appurtenanceProperty['Depth'],
            Width: appurtenanceProperty['Width'],
            ForceCoefficient: appurtenanceProperty['ForceCoefficient'],
            Weight: appurtenanceProperty['Weight'],
            AttachmentID: appurtenanceProperty['AttachmentID'],
            Classification: appurtenanceProperty['Classification'],
            ComponentName: appurtenanceProperty['ComponentName'],
            SourceAppElementId: appurtenanceProperty['SourceAppElementId'],
        };
        return imodel.elements.createElement(props);
    }
}