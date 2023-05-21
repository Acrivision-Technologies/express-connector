import { GroupInformationElement, IModelDb } from "@itwin/core-backend";
import { Code, CodeScopeProps, CodeSpec, ElementProps } from "@itwin/core-common";
import { CodeSpecs } from "../../TowerConnector";


export interface TowerInformationProps extends ElementProps {
    TowerID?: string;
    ComponentName?: string;
    Label?: string;
    TowerName?: string;
    Description?: string;
    UnitSystem?: string;
    Convention?: string;
    BearingAngle?: string;
    TowerType?: string;
    TowerHeight?: string;
    TopFaceWidth?: string;
    TopFaceDepth?: string;
    BottomFaceWidth?: string;
    BottomFaceDepth?: string;
    NoofPanel?: string;
}

export class TowerInformation extends GroupInformationElement {
    public static override get className(): string { return "TowerInformation"; }
    public TowerID?: string;
    public ComponentName?: string;
    public Label?: string;
    public TowerName?: string;
    public Description?: string;
    public UnitSystem?: string;
    public Convention?: string;
    public BearingAngle?: string;
    public TowerType?: string;
    public TowerHeight?: string;
    public TopFaceWidth?: string;
    public TopFaceDepth?: string;
    public BottomFaceWidth?: string;
    public BottomFaceDepth?: string;
    public NoofPanel?: string;

    public constructor(props: TowerInformationProps, iModel: IModelDb) {
        super(props, iModel);
        this.TowerID = props.TowerID;
        this.ComponentName = props.ComponentName;
        this.Label = props.Label;
        this.TowerName = props.TowerName;
        this.Description = props.Description;
        this.UnitSystem = props.UnitSystem;
        this.Convention = props.Convention;
        this.BearingAngle = props.BearingAngle;
        this.TowerType = props.TowerType;
        this.TowerHeight = props.TowerHeight;
        this.TopFaceWidth = props.TopFaceWidth;
        this.TopFaceDepth = props.TopFaceDepth;
        this.BottomFaceWidth = props.BottomFaceWidth;
        this.BottomFaceDepth = props.BottomFaceDepth;
        this.NoofPanel = props.NoofPanel;
    }

    public override toJSON(): TowerInformationProps {
        const val = super.toJSON() as TowerInformationProps;
        val.TowerID = this.TowerID;
        val.ComponentName = this.ComponentName;
        val.Label = this.Label;
        val.TowerName = this.TowerName;
        val.Description = this.Description;
        val.UnitSystem = this.UnitSystem;
        val.Convention = this.Convention;
        val.BearingAngle = this.BearingAngle;
        val.TowerType = this.TowerType;
        val.TowerHeight = this.TowerHeight;
        val.TopFaceWidth = this.TopFaceWidth;
        val.TopFaceDepth = this.TopFaceDepth;
        val.BottomFaceWidth = this.BottomFaceWidth;
        val.BottomFaceDepth = this.BottomFaceDepth;
        val.NoofPanel = this.NoofPanel;
        return val;
    }

    public static createCode(iModelDb: IModelDb, scope: CodeScopeProps, codeValue: string): Code {
        const codeSpec: CodeSpec = iModelDb.codeSpecs.getByName(CodeSpecs.TowerInformation);
        return new Code({ spec: codeSpec.id, scope, value: codeValue });
    }
}