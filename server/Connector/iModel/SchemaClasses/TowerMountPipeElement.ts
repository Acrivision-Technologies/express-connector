import { AxisAlignedBox3d, Code, CodeScopeProps, CodeSpec, IModelError, PhysicalElementProps, Placement3d, Placement3dProps } from "@itwin/core-common";
import { IModelDb, PhysicalElement, SpatialCategory } from "@itwin/core-backend";
import { Id64String, IModelStatus, Logger } from "@itwin/core-bentley";
import {  XYZProps, YawPitchRollProps } from "@itwin/core-geometry";
import { ConnectorLoggerCategory } from "../../ConnectorLoggerCategory";
import { TowerMountPipeBuilder } from "../Geometry/TowerMountPipeGeometry";
import { CodeSpecs } from "../../TowerConnector";
import { Categories } from "../Categories";



const loggerCategory: string = ConnectorLoggerCategory.Connector;

export interface TowerMountPipeElementProps extends PhysicalElementProps {
    MountPropertyID: string;
    Label: string;
    Name: string;
    Elevation: string;
    LateralOffset: string;
    HorizontalOffset: string;
    Height: string;
    VerticalOffset: string;
    Weight: string;
    OuterDia: string;
    InnerDia: string;
    Thickness: string;
    MountRefId: string;
    AntennaRefId: string;
    FaceRef: string;
    ComponentName: string;
    SourceAppElementId: string;

}
export class TowerMountPipeElement extends PhysicalElement {
    public static override get className(): string { return "TowerMountPipe"; }

    public MountPropertyID: string;
    public Label: string;
    public Name: string;
    public Elevation: string;
    public LateralOffset: string;
    public HorizontalOffset: string;
    public Height: string;
    public VerticalOffset: string;
    public Weight: string;
    public OuterDia: string;
    public InnerDia: string;
    public Thickness: string;
    public MountRefId: string;
    public AntennaRefId: string;
    public FaceRef: string;
    public ComponentName: string;
    public SourceAppElementId: string;


    public constructor(props: TowerMountPipeElementProps, iModel: IModelDb) {
        super(props, iModel);
        this.MountPropertyID = props.MountPropertyID
        this.Label = props.Label
        this.Name = props.Name
        this.Elevation = props.Elevation
        this.LateralOffset = props.LateralOffset
        this.HorizontalOffset = props.HorizontalOffset
        this.Height = props.Height
        this.VerticalOffset = props.VerticalOffset
        this.Weight = props.Weight
        this.OuterDia = props.OuterDia
        this.InnerDia = props.InnerDia
        this.Thickness = props.Thickness
        this.MountRefId = props.MountRefId
        this.AntennaRefId = props.AntennaRefId
        this.FaceRef = props.FaceRef
        this.ComponentName = props.ComponentName
        this.SourceAppElementId = props.SourceAppElementId
    }

    public override toJSON(): TowerMountPipeElementProps {
        const val = super.toJSON() as TowerMountPipeElementProps;
        val.MountPropertyID = this.MountPropertyID;
        val.Label = this.Label;
        val.Name = this.Name;
        val.Elevation = this.Elevation;
        val.LateralOffset = this.LateralOffset;
        val.HorizontalOffset = this.HorizontalOffset;
        val.Height = this.Height;
        val.VerticalOffset = this.VerticalOffset;
        val.Weight = this.Weight;
        val.OuterDia = this.OuterDia;
        val.InnerDia = this.InnerDia;
        val.Thickness = this.Thickness;
        val.MountRefId = this.MountRefId;
        val.AntennaRefId = this.AntennaRefId;
        val.FaceRef = this.FaceRef;
        val.ComponentName = this.ComponentName;
        val.SourceAppElementId = this.SourceAppElementId;
        return val;
    }

    public static createCode(iModelDb: IModelDb, scope: CodeScopeProps, codeValue: string): Code {
        const codeSpec: CodeSpec = iModelDb.codeSpecs.getByName(CodeSpecs.TowerMountPipePropertyInformation);
        return new Code({ spec: codeSpec.id, scope, value: codeValue });
    }

    public static create(imodel: IModelDb, physicalModelId: Id64String, definitionModelId: Id64String, mountNodes: any, sections: any, mountPipeProperty: any, mountPipes: any, sourceEleID: any): PhysicalElement {
        const categoryId = SpatialCategory.queryCategoryIdByName(imodel, definitionModelId, Categories.Mounts);
        if (undefined === categoryId) {
            throw new IModelError(IModelStatus.BadElement, "Unable to find category id for StandardConnector category for createTowerMountPipeElement");
        }
        return this.createTowerMountPipeElement(imodel, physicalModelId, definitionModelId, mountNodes, sections, mountPipeProperty, mountPipes, sourceEleID, categoryId, new TowerMountPipeBuilder(imodel, definitionModelId, categoryId), this.classFullName);
    }

    protected static createTowerMountPipeElement(imodel: IModelDb, physicalModelId: Id64String, definitionModelId: Id64String,  mountNodes: any, sections: any, mountPipeProperty: any, mountPipes: any, sourceEleID: any, categoryId: any, mountPipeBuilder: TowerMountPipeBuilder, classFullName: string): PhysicalElement {
        const code = this.createCode(imodel, physicalModelId, sourceEleID);
        console.log(`definitionModelId => ${definitionModelId}`)

        const stream = mountPipeBuilder.createGeometry(mountPipes, mountNodes, sections);
        // let origin: XYZProps;
        // let angles: YawPitchRollProps;


        // const xyz: XYZProps = {
        //     x: toNumber(startNode['Z']),
        //     y: toNumber(startNode['X']),
        //     z: toNumber(startNode['Y']),
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

        // // console.log('placement');
        // // console.log(placement);
        // const targetPlacement: Placement3d = Placement3d.fromJSON(placement);

        // const targetExtents: AxisAlignedBox3d = targetPlacement.calculateRange();
        // if (!targetExtents.isNull && !imodel.projectExtents.containsRange(targetExtents)) {
        //     Logger.logTrace(loggerCategory, "Auto-extending projectExtents");
        //     targetExtents.extendRange(imodel.projectExtents);
        //     imodel.updateProjectExtents(targetExtents);
        // }

        const props: TowerMountPipeElementProps = {
            code,
            category: categoryId,
            model: physicalModelId,
            classFullName,
            geom: stream,
            MountPropertyID: mountPipeProperty['ID'],
            Label: mountPipeProperty['Label'],
            Name: mountPipeProperty['Name'],
            Elevation: mountPipeProperty['Elevation'],
            LateralOffset: mountPipeProperty['LateralOffset'],
            HorizontalOffset: mountPipeProperty['HorizontalOffset'],
            Height: mountPipeProperty['Height'],
            VerticalOffset: mountPipeProperty['VerticalOffset'],
            Weight: mountPipeProperty['Weight'],
            OuterDia: mountPipeProperty['OuterDia'],
            InnerDia: mountPipeProperty['InnerDia'],
            Thickness: mountPipeProperty['Thickness'],
            MountRefId: mountPipeProperty['MountRefId'],
            AntennaRefId: mountPipeProperty['AntennaRefId'],
            FaceRef: mountPipeProperty['FaceRef'],
            ComponentName: mountPipeProperty['ComponentName'],
            SourceAppElementId: mountPipeProperty['SourceAppElementId'],
        };
        return imodel.elements.createElement(props);
    }
}