import { AxisAlignedBox3d, Code, CodeScopeProps, CodeSpec, IModelError, PhysicalElementProps, Placement3d, Placement3dProps, SubCategoryProps } from "@itwin/core-common";
// import { ConnectorGroup, convertFeetToMeter, convertInchToMeter } from "./ConnectorElements";
import { CategoryOwnsSubCategories, IModelDb, PhysicalElement, SpatialCategory, SubCategory } from "@itwin/core-backend";
import { Id64String, IModelStatus, Logger } from "@itwin/core-bentley";
import { XYZProps, YawPitchRollProps } from "@itwin/core-geometry";
import { ConnectorLoggerCategory } from "../../ConnectorLoggerCategory";
import { Categories } from "../Categories";
import { toNumber, convertFeetToMeter, convertInchToMeter } from "../../ConnectorUtils";
import { TowerPanelBuilder } from "../Geometry/TowerPanelGeometry";
import { CodeSpecs } from "../../TowerConnector";




const loggerCategory: string = ConnectorLoggerCategory.Connector;


export interface TowerPanelElementProps extends PhysicalElementProps {
    PanelID: string;
    Label: string;
    Height: string;
    TopWidth: string;
    TopElevation: string;
    BottomElevation: string;
    BottomWidth: string;
    FaceBracing: string;
    PlanBracing: string;
    HipBracing: string;
    NumberOfSegments: string;
    Weight: string;
    ComponentName: string;
    SourceAppElementId: string;

}

export class TowerPanelElement extends PhysicalElement {

    public static override get className(): string { return "TowerPanel"; }

    public PanelID: string;
    public Label: string;
    public Height: string;
    public TopWidth: string;
    public TopElevation: string;
    public BottomElevation: string;
    public BottomWidth: string;
    public FaceBracing: string;
    public PlanBracing: string;
    public HipBracing: string;
    public NumberOfSegments: string;
    public Weight: string;
    public ComponentName: string;
    public SourceAppElementId: string;

    public constructor(props: TowerPanelElementProps, iModel: IModelDb) {
        super(props, iModel);
        this.PanelID = props.PanelID
        this.Label = props.Label
        this.Height = props.Height
        this.TopWidth = props.TopWidth
        this.TopElevation = props.TopElevation
        this.BottomElevation = props.BottomElevation
        this.BottomWidth = props.BottomWidth
        this.FaceBracing = props.FaceBracing
        this.PlanBracing = props.PlanBracing
        this.HipBracing = props.HipBracing
        this.NumberOfSegments = props.NumberOfSegments
        this.Weight = props.Weight
        this.ComponentName = props.ComponentName
        this.SourceAppElementId = props.SourceAppElementId
    }

    public override toJSON(): TowerPanelElementProps {
        const val = super.toJSON() as TowerPanelElementProps;
        val.PanelID = this.PanelID;
        val.Label = this.Label;
        val.Height = this.Height;
        val.TopWidth = this.TopWidth;
        val.TopElevation = this.TopElevation;
        val.BottomElevation = this.BottomElevation;
        val.BottomWidth = this.BottomWidth;
        val.FaceBracing = this.FaceBracing;
        val.PlanBracing = this.PlanBracing;
        val.HipBracing = this.HipBracing;
        val.NumberOfSegments = this.NumberOfSegments;
        val.Weight = this.Weight;
        val.ComponentName = this.ComponentName;
        val.SourceAppElementId = this.SourceAppElementId;
        return val;
    }

    public static createCode(iModelDb: IModelDb, scope: CodeScopeProps, codeValue: string): Code {
        const codeSpec: CodeSpec = iModelDb.codeSpecs.getByName(CodeSpecs.TowerPanelInformation);
        return new Code({ spec: codeSpec.id, scope, value: codeValue });
    }

    public static create(imodel: IModelDb, physicalModelId: Id64String, definitionModelId: Id64String, panelProperty: any, panelID: any, panelLeg: any, nodes: any, sections: any, panelFaceBraicng: any, planBracingDetails: any): PhysicalElement {
        const categoryId: any = SpatialCategory.queryCategoryIdByName(imodel, definitionModelId, Categories.Panels);
        if (undefined === categoryId) {
            throw new IModelError(IModelStatus.BadElement, "Unable to find category id for StandardConnector category");
        }
        return this.createPanelElement(imodel, physicalModelId, definitionModelId, categoryId, panelProperty, panelID, panelLeg, nodes, sections, panelFaceBraicng, planBracingDetails, new TowerPanelBuilder(imodel, definitionModelId, categoryId), this.classFullName);
    }

    protected static createPanelElement(imodel: IModelDb, physicalModelId: Id64String, definitionModelId: Id64String, categoryId: any, panelProperty: any, panelID: any, panelLeg: any, nodes: any, sections: any, panelFaceBraicng: any, planBracingDetails: any, mountBuilder: TowerPanelBuilder, classFullName: string): PhysicalElement {
        const code = this.createCode(imodel, physicalModelId, panelID);
        console.log("inside createPanelElement code");
        console.log(code);
        console.log(`definitionModelId => ${definitionModelId}`)
        


        // console.log(`radius => ${radius}`)

        const firstLegElement = panelLeg[0];
        const startNode = nodes.find((node: any) => {
            if (node["ID"] == firstLegElement['StartNodeID']) {
                return node;
            }
        });

        console.log("first leg element startNode");
        console.log(startNode);

        const placement: Placement3dProps = {
            origin:{
                x: 0,
                y: 0,
                z: 10,
            },
            angles: {
                yaw: 0,
                pitch: 0,
                roll: 0
            }
        }


        

        const stream = mountBuilder.createGeometry(panelLeg, nodes, sections, panelFaceBraicng, planBracingDetails);
        console.log('placement');
        console.log(placement);

        const props: TowerPanelElementProps = {
            code,
            category: categoryId,
            model: physicalModelId,
            classFullName,
            geom: stream,
            // placement,
            PanelID: panelProperty['PanelID'],
            Label: panelProperty['Label'],
            Height: panelProperty['Height'],
            TopWidth: panelProperty['TopWidth'],
            TopElevation: panelProperty['TopElevation'],
            BottomElevation: panelProperty['BottomElevation'],
            BottomWidth: panelProperty['BottomWidth'],
            FaceBracing: panelProperty['FaceBracing'],
            PlanBracing: panelProperty['PlanBracing'],
            HipBracing: panelProperty['HipBracing'],
            NumberOfSegments: panelProperty['NumberOfSegments'],
            Weight: panelProperty['Weight'],
            ComponentName: panelProperty['ComponentName'],
            SourceAppElementId: panelProperty['SourceAppElementId'],
        };
        return imodel.elements.createElement(props);
    }

}