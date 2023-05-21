import { AxisAlignedBox3d, Code, CodeScopeProps, CodeSpec, IModelError, PhysicalElementProps, Placement3d, Placement3dProps } from "@itwin/core-common";
import { IModelDb, PhysicalElement, SpatialCategory } from "@itwin/core-backend";
import { Id64String, IModelStatus, Logger } from "@itwin/core-bentley";
import {  XYZProps, YawPitchRollProps } from "@itwin/core-geometry";
import { ConnectorLoggerCategory } from "../../ConnectorLoggerCategory";
import { TowerMountPipeBuilder } from "../Geometry/TowerMountPipeGeometry";
import { CodeSpecs } from "../../TowerConnector";
import { Categories } from "../Categories";
import { TowerAntennaBuilder } from "../Geometry/TowerAntennaGeometry";
import { TowerAttachmentBuilder } from "../Geometry/TowerAttachmentGeometry";



const loggerCategory: string = ConnectorLoggerCategory.Connector;

export interface TowerAttachmentElementProps extends PhysicalElementProps {
    AttachmentPropertyID: string;
    Label: string;
    TopElevation: string;
    BottomElevation: string;
    AttachmentName: string;
    AttachmentType: string;
    Location: string;
    Azimuth: string;
    Width: string;
    Depth: string;
    Weight: string;
    Classification: string;
    ComponentName: string;
    SourceAppElementId: string;

}
export class TowerAttachmentElement extends PhysicalElement {
    public static override get className(): string { return "TowerAttachment"; }

    public AttachmentPropertyID: string;
    public Label: string;
    public TopElevation: string;
    public BottomElevation: string;
    public AttachmentName: string;
    public AttachmentType: string;
    public Location: string;
    public Azimuth: string;
    public Width: string;
    public Depth: string;
    public Weight: string;
    public Classification: string;
    public ComponentName: string;
    public SourceAppElementId: string;


    public constructor(props: TowerAttachmentElementProps, iModel: IModelDb) {
        super(props, iModel);
        this.AttachmentPropertyID = props.AttachmentPropertyID
        this.Label = props.Label
        this.TopElevation = props.TopElevation
        this.BottomElevation = props.BottomElevation
        this.AttachmentName = props.AttachmentName
        this.AttachmentType = props.AttachmentType
        this.Location = props.Location
        this.Azimuth = props.Azimuth
        this.Width = props.Width
        this.Depth = props.Depth
        this.Weight = props.Weight
        this.Classification = props.Classification
        this.ComponentName = props.ComponentName
        this.SourceAppElementId = props.SourceAppElementId
    }

    public override toJSON(): TowerAttachmentElementProps {
        const val = super.toJSON() as TowerAttachmentElementProps;
        val.AttachmentPropertyID = this.AttachmentPropertyID;
        val.Label = this.Label;
        val.TopElevation = this.TopElevation;
        val.BottomElevation = this.BottomElevation;
        val.AttachmentName = this.AttachmentName;
        val.AttachmentType = this.AttachmentType;
        val.Location = this.Location;
        val.Azimuth = this.Azimuth;
        val.Width = this.Width;
        val.Depth = this.Depth;
        val.Weight = this.Weight;
        val.Classification = this.Classification;
        val.ComponentName = this.ComponentName;
        val.SourceAppElementId = this.SourceAppElementId;
        return val;
    }

    public static createCode(iModelDb: IModelDb, scope: CodeScopeProps, codeValue: string): Code {
        const codeSpec: CodeSpec = iModelDb.codeSpecs.getByName(CodeSpecs.TowerAttachmentPropertyInformation);
        return new Code({ spec: codeSpec.id, scope, value: codeValue });
    }

    public static create(imodel: IModelDb, physicalModelId: Id64String, definitionModelId: Id64String, attachmentNodes: any, sections: any, attachmentProperty: any, attachment: any, sourceEleID: any): PhysicalElement {
        const categoryId = SpatialCategory.queryCategoryIdByName(imodel, definitionModelId, Categories.Attachments);
        if (undefined === categoryId) {
            throw new IModelError(IModelStatus.BadElement, "Unable to find category id for StandardConnector category for createTowerAttachmentElement");
        }
        return this.createTowerAttachmentElement(imodel, physicalModelId, definitionModelId, attachmentNodes, sections, attachmentProperty, attachment, sourceEleID, categoryId, new TowerAttachmentBuilder(imodel, definitionModelId, categoryId, attachmentProperty), this.classFullName);
    }

    protected static createTowerAttachmentElement(imodel: IModelDb, physicalModelId: Id64String, definitionModelId: Id64String,  attachmentNodes: any, sections: any, attachmentProperty: any, attachment: any, sourceEleID: any, categoryId: any, towerAttachmentBuilder: TowerAttachmentBuilder, classFullName: string): PhysicalElement {
        const code = this.createCode(imodel, physicalModelId, sourceEleID);

        console.log(`definitionModelId: ${definitionModelId}`)

        console.log(`inside createTowerAttachmentElement`);
        console.log(JSON.stringify(attachment));

        const stream = towerAttachmentBuilder.createGeometry(attachment, attachmentNodes, sections);

        const props: TowerAttachmentElementProps = {
            code,
            category: categoryId,
            model: physicalModelId,
            classFullName,
            geom: stream,
            AttachmentPropertyID: attachmentProperty['AttachmentPropertyID'],
            Label: attachmentProperty['Label'],
            TopElevation: attachmentProperty['TopElevation'],
            BottomElevation: attachmentProperty['BottomElevation'],
            AttachmentName: attachmentProperty['AttachmentName'],
            AttachmentType: attachmentProperty['AttachmentType'],
            Location: attachmentProperty['Location'],
            Azimuth: attachmentProperty['Azimuth'],
            Width: attachmentProperty['Width'],
            Depth: attachmentProperty['Depth'],
            Weight: attachmentProperty['Weight'],
            Classification: attachmentProperty['Classification'],
            ComponentName: attachmentProperty['ComponentName'],
            SourceAppElementId: attachmentProperty['SourceAppElementId'],
        };
        return imodel.elements.createElement(props);
    }
}