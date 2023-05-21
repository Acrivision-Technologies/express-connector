import { Code, CodeScopeProps, CodeSpec, IModelError, PhysicalElementProps } from "@itwin/core-common";
import { IModelDb, PhysicalElement, SpatialCategory } from "@itwin/core-backend";
import { Id64String, IModelStatus, Logger } from "@itwin/core-bentley";
import { ConnectorLoggerCategory } from "../../ConnectorLoggerCategory";
import { CodeSpecs } from "../../TowerConnector";
import { Categories } from "../Categories";
import { TowerPoleBuilder } from "../Geometry/TowerPoleGeometry";



const loggerCategory: string = ConnectorLoggerCategory.Connector;

export interface TowerPoleElementProps extends PhysicalElementProps {
    PoleID: string;
    Label: string;
    SectionLength: string;
    TopElevation: string;
    BottomElevation: string;
    TopFlatDiameter: string;
    BottomFlatDiameter: string;
    TopTipDiameter: string;
    BottomTipDiameter: string;
    Thickness: string;
    PolesectionType: string;
    TopFlatWidth: string;
    BottomFlatWidth: string;
    ComponentName: string;

}
export class TowerPoleElement extends PhysicalElement {
    public static override get className(): string { return "TowerPole"; }

    public PoleID: string;
    public Label: string;
    public SectionLength: string;
    public TopElevation: string;
    public BottomElevation: string;
    public TopFlatDiameter: string;
    public BottomFlatDiameter: string;
    public TopTipDiameter: string;
    public BottomTipDiameter: string;
    public Thickness: string;
    public PolesectionType: string;
    public TopFlatWidth: string;
    public BottomFlatWidth: string;
    public ComponentName: string;


    public constructor(props: TowerPoleElementProps, iModel: IModelDb) {
        super(props, iModel);
        this.PoleID = props.PoleID
        this.Label = props.Label
        this.SectionLength = props.SectionLength
        this.TopElevation = props.TopElevation
        this.BottomElevation = props.BottomElevation
        this.TopFlatDiameter = props.TopFlatDiameter
        this.BottomFlatDiameter = props.BottomFlatDiameter
        this.TopTipDiameter = props.TopTipDiameter
        this.BottomTipDiameter = props.BottomTipDiameter
        this.Thickness = props.Thickness
        this.PolesectionType = props.PolesectionType
        this.TopFlatWidth = props.TopFlatWidth
        this.BottomFlatWidth = props.BottomFlatWidth
        this.ComponentName = props.ComponentName
    }

    public override toJSON(): TowerPoleElementProps {
        const val = super.toJSON() as TowerPoleElementProps;
        val.PoleID = this.PoleID;
        val.Label = this.Label;
        val.SectionLength = this.SectionLength;
        val.TopElevation = this.TopElevation;
        val.BottomElevation = this.BottomElevation;
        val.TopFlatDiameter = this.TopFlatDiameter;
        val.BottomFlatDiameter = this.BottomFlatDiameter;
        val.TopTipDiameter = this.TopTipDiameter;
        val.BottomTipDiameter = this.BottomTipDiameter;
        val.Thickness = this.Thickness;
        val.PolesectionType = this.PolesectionType;
        val.TopFlatWidth = this.TopFlatWidth;
        val.BottomFlatWidth = this.BottomFlatWidth;
        val.ComponentName = this.ComponentName;
        return val;
    }

    public static createCode(iModelDb: IModelDb, scope: CodeScopeProps, codeValue: string): Code {
        const codeSpec: CodeSpec = iModelDb.codeSpecs.getByName(CodeSpecs.TowerPolePropertyInformation);
        return new Code({ spec: codeSpec.id, scope, value: codeValue });
    }

    public static create(imodel: IModelDb, physicalModelId: Id64String, definitionModelId: Id64String, nodes: any, sections: any, poleProperty: any, pole: any, sourceEleID: any): PhysicalElement {
        const categoryId = SpatialCategory.queryCategoryIdByName(imodel, definitionModelId, Categories.Poles);
        if (undefined === categoryId) {
            throw new IModelError(IModelStatus.BadElement, "Unable to find category id for StandardConnector category for createTowerPoleElement");
        }
        return this.createTowerPoleElement(imodel, physicalModelId, definitionModelId, nodes, sections, poleProperty, pole, sourceEleID, categoryId, new TowerPoleBuilder(imodel, definitionModelId, categoryId, poleProperty), this.classFullName);
    }

    protected static createTowerPoleElement(imodel: IModelDb, physicalModelId: Id64String, definitionModelId: Id64String,  nodes: any, sections: any, poleProperty: any, pole: any, sourceEleID: any, categoryId: any, towerPoleBuilder: TowerPoleBuilder, classFullName: string): PhysicalElement {
        const code = this.createCode(imodel, physicalModelId, sourceEleID);

        console.log(`definitionModelId => ${definitionModelId}`)
        
        console.log(`inside createTowerPoleElement`);
        console.log(JSON.stringify(pole));

        const stream = towerPoleBuilder.createGeometry(pole, nodes, sections);

        const props: TowerPoleElementProps = {
            code,
            category: categoryId,
            model: physicalModelId,
            classFullName,
            geom: stream,
            PoleID: poleProperty['PoleID'],
            Label: poleProperty['Label'],
            SectionLength: poleProperty['SectionLength'],
            TopElevation: poleProperty['TopElevation'],
            BottomElevation: poleProperty['BottomElevation'],
            TopFlatDiameter: poleProperty['TopFlatDiameter'],
            BottomFlatDiameter: poleProperty['BottomFlatDiameter'],
            TopTipDiameter: poleProperty['TopTipDiameter'],
            BottomTipDiameter: poleProperty['BottomTipDiameter'],
            Thickness: poleProperty['Thickness'],
            PolesectionType: poleProperty['PolesectionType'],
            TopFlatWidth: poleProperty['TopFlatWidth'],
            BottomFlatWidth: poleProperty['BottomFlatWidth'],
            ComponentName: poleProperty['ComponentName'],
        };
        return imodel.elements.createElement(props);
    }
}