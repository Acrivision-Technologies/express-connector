import { Materials } from "../Materials";


import { CategoryColor } from "../Categories";
import { RenderMaterialElement } from "@itwin/core-backend";
import { queryDefinitionModel } from "./ConnectorGroupModelService";
import { ColorDef } from "@itwin/core-common";

export class MaterialDefinitionModel {
    private synchronizer: any;
    private jobSubject: any;
    constructor(synchronizer: any, jobSubject: any) {
        this.synchronizer = synchronizer;
        this.jobSubject = jobSubject;
    }

    insertMaterials() {
        this.insertMaterial(Materials.PanelsMaterial, this.getElementMaterialParams(CategoryColor.Panels, Materials.PanelsMaterial)); //red
        this.insertMaterial(Materials.LegsMaterial, this.getElementMaterialParams(CategoryColor.Legs, Materials.LegsMaterial)); //red
        this.insertMaterial(Materials.FaceBracingMaterial, this.getElementMaterialParams(CategoryColor.FaceBracing, Materials.FaceBracingMaterial)); //red
        this.insertMaterial(Materials.PlanBracingMaterial, this.getElementMaterialParams(CategoryColor.PlanBracing, Materials.PlanBracingMaterial)); //red
    }

    private insertMaterial(materialName: string, params: RenderMaterialElement.Params) {
        RenderMaterialElement.insert(this.synchronizer.imodel, queryDefinitionModel(this.synchronizer, this.jobSubject)!, materialName, params);
    }

    private getElementMaterialParams(elementColor: any, paletteName: any): RenderMaterialElement.Params {
        const params = new RenderMaterialElement.Params(paletteName);
        const color = this.toRgbFactor(elementColor);
        params.specularColor = color;
        params.color = color;
        params.transmit = 0;
        return params;
    }

    private toRgbFactor(color: number): number[] {
        const numbers = ColorDef.getColors(color);
        const factor: number[] = [
            numbers.r,
            numbers.g,
            numbers.b,
        ];
        return factor;
    }
}