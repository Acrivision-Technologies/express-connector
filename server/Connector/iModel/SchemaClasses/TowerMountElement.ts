import { AxisAlignedBox3d, Code, CodeScopeProps, CodeSpec, IModelError, PhysicalElementProps, Placement3d, Placement3dProps } from "@itwin/core-common";
import { IModelDb, PhysicalElement, SpatialCategory } from "@itwin/core-backend";
import { Id64String, IModelStatus, Logger } from "@itwin/core-bentley";
import { ConnectorLoggerCategory } from "../../ConnectorLoggerCategory";
import { CodeSpecs } from "../../TowerConnector";
import { TowerMountBuilder } from "../Geometry/TowerMountGeometry";
import { Categories } from "../Categories";

const loggerCategory: string = ConnectorLoggerCategory.Connector;

export interface TowerMountElementProps extends PhysicalElementProps {
    MountID: string;
    Label: string;
    Name: string;
    Elevation: string;
    Manufacturer: string;
    ModelName: string;
    Type: string;
    Location: string;
    Azimuth: string;
    Height: string;
    Width: string;
    Standoff: string;
    Weight: string;
    Classification: string;
    ComponentName: string;
    SourceAppElementId: string;

}
export class TowerMountElement extends PhysicalElement {
    public static override get className(): string { return "TowerMount"; }

    public MountID: string;
    public Label: string;
    public Name: string;
    public Elevation: string;
    public Manufacturer: string;
    public ModelName: string;
    public Type: string;
    public Location: string;
    public Azimuth: string;
    public Height: string;
    public Width: string;
    public Standoff: string;
    public Weight: string;
    public Classification: string;
    public ComponentName: string;
    public SourceAppElementId: string;

    public constructor(props: TowerMountElementProps, iModel: IModelDb) {
        super(props, iModel);
        this.MountID = props.MountID
        this.Label = props.Label
        this.Name = props.Name
        this.Elevation = props.Elevation
        this.Manufacturer = props.Manufacturer
        this.ModelName = props.ModelName
        this.Type = props.Type
        this.Location = props.Location
        this.Azimuth = props.Azimuth
        this.Height = props.Height
        this.Width = props.Width
        this.Standoff = props.Standoff
        this.Weight = props.Weight
        this.Classification = props.Classification
        this.ComponentName = props.ComponentName
        this.SourceAppElementId = props.SourceAppElementId
    }

    public override toJSON(): TowerMountElementProps {
        const val = super.toJSON() as TowerMountElementProps;
        val.MountID = this.MountID;
        val.Label = this.Label;
        val.Name = this.Name;
        val.Elevation = this.Elevation;
        val.Manufacturer = this.Manufacturer;
        val.ModelName = this.ModelName;
        val.Type = this.Type;
        val.Location = this.Location;
        val.Azimuth = this.Azimuth;
        val.Height = this.Height;
        val.Width = this.Width;
        val.Standoff = this.Standoff;
        val.Weight = this.Weight;
        val.Classification = this.Classification;
        val.ComponentName = this.ComponentName;
        val.SourceAppElementId = this.SourceAppElementId;
        return val;
    }

    public static createCode(iModelDb: IModelDb, scope: CodeScopeProps, codeValue: string): Code {
        const codeSpec: CodeSpec = iModelDb.codeSpecs.getByName(CodeSpecs.TowerMountPropertyInformation);
        return new Code({ spec: codeSpec.id, scope, value: codeValue });
    }


    public static create(imodel: IModelDb, physicalModelId: Id64String, definitionModelId: Id64String, mountNodes: any, sections: any, mountProperty: any,  mount: any, sourceEleID: any): PhysicalElement {
        const categoryId: any = SpatialCategory.queryCategoryIdByName(imodel, definitionModelId, Categories.Mounts);
        if (undefined === categoryId) {
            throw new IModelError(IModelStatus.BadElement, "Unable to find category id for StandardConnector category");
        }
        return this.createTowerMountElement(imodel, physicalModelId, definitionModelId, mountNodes, sections, mountProperty, mount, sourceEleID, categoryId, new TowerMountBuilder(imodel, definitionModelId, categoryId), this.classFullName);
    }

    protected static createTowerMountElement(imodel: IModelDb, physicalModelId: Id64String, definitionModelId: Id64String, mountNodes: any, sections: any, mountProperty: any, mount: any, sourceEleID: any, categoryId: any, mountBuilder: TowerMountBuilder, classFullName: string): PhysicalElement {
        const code = this.createCode(imodel, physicalModelId, sourceEleID);
        console.log(`definitionModelId => ${definitionModelId}`)
        // // console.log("inside createTowerMountElement");
        // const categoryId = SpatialCategory.queryCategoryIdByName(imodel, definitionModelId, Categories.Category);
        // // console.log('categoryId');
        // // console.log(categoryId);
        // if (undefined === categoryId) {
        //     throw new IModelError(IModelStatus.BadElement, "Unable to find category id for StandardConnector category");
        // }


        // const startNode = mountNodes.find((node: any) => node["ID"] == mountElement['StartNodeID']);
        // const endNode = mountNodes.find((node: any) => node["ID"] == mountElement['EndNodeID']);
        // const mountSection = sections.find((section: any) => section["ID"] == mountElement["SectionID"]);

        // const mountRadius = convertFeetToMeter(mountSection['Radius']);

        // // console.log(`mountRadius => ${mountRadius}`)

        const stream = mountBuilder.createGeometry(mount, mountNodes, sections);
        // let origin: XYZProps;
        // let angles: YawPitchRollProps;

        // const xyz: XYZProps = {
        //     x: 0,
        //     y: 0,
        //     z: 0,
        // };
        // origin = xyz;

        // const yawp: YawPitchRollProps = {
        //     yaw: toNumber(0),
        //     pitch: toNumber(0),
        //     roll: toNumber(0),
        // };
        // angles = yawp;

        // const placement: Placement3dProps = {
        //     origin,
        //     angles,
        // };

        // console.log('placement');
        // console.log(placement);
        // const targetPlacement: Placement3d = Placement3d.fromJSON(placement);

        // const targetExtents: AxisAlignedBox3d = targetPlacement.calculateRange();
        // if (!targetExtents.isNull && !imodel.projectExtents.containsRange(targetExtents)) {
        //     Logger.logTrace(loggerCategory, "Auto-extending projectExtents");
        //     targetExtents.extendRange(imodel.projectExtents);
        //     imodel.updateProjectExtents(targetExtents);
        // }

        const props: TowerMountElementProps = {
            code,
            category: categoryId,
            model: physicalModelId,
            classFullName,
            geom: stream,
            MountID: mountProperty['ID'],
            Label: mountProperty['Label'],
            Name: mountProperty['Name'],
            Elevation: mountProperty['Elevation'],
            Manufacturer: mountProperty['Manufacturer'],
            ModelName: mountProperty['ModelName'],
            Type: mountProperty['Type'],
            Location: mountProperty['Location'],
            Azimuth: mountProperty['Azimuth'],
            Height: mountProperty['Height'],
            Width: mountProperty['Width'],
            Standoff: mountProperty['Standoff'],
            Weight: mountProperty['Weight'],
            Classification: mountProperty['Classification'],
            ComponentName: mountProperty['ComponentName'],
            SourceAppElementId: mountProperty['SourceAppElementId'],
        };
        return imodel.elements.createElement(props);
    }
}