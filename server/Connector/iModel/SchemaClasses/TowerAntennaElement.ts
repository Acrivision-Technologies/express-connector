import { AxisAlignedBox3d, Code, CodeScopeProps, CodeSpec, IModelError, PhysicalElementProps, Placement3d, Placement3dProps } from "@itwin/core-common";
import { IModelDb, PhysicalElement, SpatialCategory } from "@itwin/core-backend";
import { Id64String, IModelStatus, Logger } from "@itwin/core-bentley";
import {  XYZProps, YawPitchRollProps } from "@itwin/core-geometry";
import { ConnectorLoggerCategory } from "../../ConnectorLoggerCategory";
import { TowerMountPipeBuilder } from "../Geometry/TowerMountPipeGeometry";
import { CodeSpecs } from "../../TowerConnector";
import { Categories } from "../Categories";
import { TowerAntennaBuilder } from "../Geometry/TowerAntennaGeometry";



const loggerCategory: string = ConnectorLoggerCategory.Connector;

export interface TowerAntennaElementProps extends PhysicalElementProps {
    AntennaPropertyID: string;
    Label: string;
    Name: string;
    Elevation: string;
    Manufacturer: string;
    ModelName: string;
    Type: string;
    Location: string;
    Azimuth: string;
    LateralOffset: string;
    VerticalOffset: string;
    HorizontalOffset: string;
    Height: string;
    Width: string;
    Depth: string;
    Weight: string;
    Classification: string;
    ComponentName: string;
    SourceAppElementId: string;
    IconID: string;
    DirectionVector: string;

}
export class TowerAntennaElement extends PhysicalElement {
    public static override get className(): string { return "TowerAntenna"; }

    public AntennaPropertyID: string;
    public Label: string;
    public Name: string;
    public Elevation: string;
    public Manufacturer: string;
    public ModelName: string;
    public Type: string;
    public Location: string;
    public Azimuth: string;
    public LateralOffset: string;
    public VerticalOffset: string;
    public HorizontalOffset: string;
    public Height: string;
    public Width: string;
    public Depth: string;
    public Weight: string;
    public Classification: string;
    public ComponentName: string;
    public SourceAppElementId: string;
    public IconID: string;
    public DirectionVector: string;


    public constructor(props: TowerAntennaElementProps, iModel: IModelDb) {
        super(props, iModel);
        this.AntennaPropertyID = props.AntennaPropertyID
        this.Label = props.Label
        this.Name = props.Name
        this.Elevation = props.Elevation
        this.Manufacturer = props.Manufacturer
        this.ModelName = props.ModelName
        this.Type = props.Type
        this.Location = props.Location
        this.Azimuth = props.Azimuth
        this.LateralOffset = props.LateralOffset
        this.VerticalOffset = props.VerticalOffset
        this.HorizontalOffset = props.HorizontalOffset
        this.Height = props.Height
        this.Width = props.Width
        this.Depth = props.Depth
        this.Weight = props.Weight
        this.Classification = props.Classification
        this.ComponentName = props.ComponentName
        this.SourceAppElementId = props.SourceAppElementId
        this.IconID = props.IconID
        this.DirectionVector = props.DirectionVector
    }

    public override toJSON(): TowerAntennaElementProps {
        const val = super.toJSON() as TowerAntennaElementProps;
        val.AntennaPropertyID = this.AntennaPropertyID;
        val.Label = this.Label;
        val.Name = this.Name;
        val.Elevation = this.Elevation;
        val.Manufacturer = this.Manufacturer;
        val.ModelName = this.ModelName;
        val.Type = this.Type;
        val.Location = this.Location;
        val.Azimuth = this.Azimuth;
        val.LateralOffset = this.LateralOffset;
        val.VerticalOffset = this.VerticalOffset;
        val.HorizontalOffset = this.HorizontalOffset;
        val.Height = this.Height;
        val.Width = this.Width;
        val.Depth = this.Depth;
        val.Weight = this.Weight;
        val.Classification = this.Classification;
        val.ComponentName = this.ComponentName;
        val.SourceAppElementId = this.SourceAppElementId;
        val.IconID = this.IconID;
        val.DirectionVector = this.DirectionVector;
        return val;
    }

    public static createCode(iModelDb: IModelDb, scope: CodeScopeProps, codeValue: string): Code {
        const codeSpec: CodeSpec = iModelDb.codeSpecs.getByName(CodeSpecs.TowerAntennaPropertyInformation);
        return new Code({ spec: codeSpec.id, scope, value: codeValue });
    }

    public static create(imodel: IModelDb, physicalModelId: Id64String, definitionModelId: Id64String, antennaNodes: any, sections: any, antennaProperty: any, antennaElement: any, sourceEleID: any): PhysicalElement {
        const categoryId = SpatialCategory.queryCategoryIdByName(imodel, definitionModelId, Categories.Mounts);
        if (undefined === categoryId) {
            throw new IModelError(IModelStatus.BadElement, "Unable to find category id for StandardConnector category for createTowerAntennaElement");
        }
        return this.createTowerAntennaElement(imodel, physicalModelId, definitionModelId, antennaNodes, sections, antennaProperty, antennaElement, sourceEleID, categoryId, new TowerAntennaBuilder(imodel, definitionModelId, categoryId, antennaProperty), this.classFullName);
    }

    protected static createTowerAntennaElement(imodel: IModelDb, physicalModelId: Id64String, definitionModelId: Id64String,  antennaNodes: any, sections: any, antennaProperty: any, antennaElement: any, sourceEleID: any, categoryId: any, towerAntennaBuilder: TowerAntennaBuilder, classFullName: string): PhysicalElement {
        const code = this.createCode(imodel, physicalModelId, sourceEleID);
        console.log(`definitionModelId ==> ${definitionModelId}`);

        console.log(`inside createTowerAntennaElement`);
        console.log(JSON.stringify(antennaElement));

        const stream = towerAntennaBuilder.createGeometry(antennaElement, antennaNodes, sections);

        const props: TowerAntennaElementProps = {
            code,
            category: categoryId,
            model: physicalModelId,
            classFullName,
            geom: stream,
            AntennaPropertyID: antennaProperty['ID'],
            Label: antennaProperty['Label'],
            Name: antennaProperty['Name'],
            Elevation: antennaProperty['Elevation'],
            Manufacturer: antennaProperty['Manufacturer'],
            ModelName: antennaProperty['ModelName'],
            Type: antennaProperty['Type'],
            Location: antennaProperty['Location'],
            Azimuth: antennaProperty['Azimuth'],
            LateralOffset: antennaProperty['LateralOffset'],
            VerticalOffset: antennaProperty['VerticalOffset'],
            HorizontalOffset: antennaProperty['HorizontalOffset'],
            Height: antennaProperty['Height'],
            Width: antennaProperty['Width'],
            Depth: antennaProperty['Depth'],
            Weight: antennaProperty['Weight'],
            Classification: antennaProperty['Classification'],
            ComponentName: antennaProperty['ComponentName'],
            SourceAppElementId: antennaProperty['SourceAppElementId'],
            IconID: antennaProperty['IconID'],
            DirectionVector: antennaProperty['DirectionVector'],
        };
        return imodel.elements.createElement(props);
    }
}