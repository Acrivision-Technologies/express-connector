
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Angle, AxisIndex, AxisOrder, Cone, IndexedPolyfaceVisitor, LineString3d, Matrix3d, Point3d, PolyfaceBuilder, SolidPrimitive, StrokeOptions, Transform, Vector3d, YawPitchRollAngles } from "@itwin/core-geometry";
import type { IModelDb } from "@itwin/core-backend";
import { GeometryPart, RenderMaterialElement, SubCategory } from "@itwin/core-backend";
import { BackgroundFill, FillDisplay, GeometryClass, GeometryPartProps, GeometryStreamProps, LineStyle } from "@itwin/core-common";
import { ColorByName, ColorDef, GeometryParams, GeometryStreamBuilder, IModelError } from "@itwin/core-common";
import type { Id64String } from "@itwin/core-bentley";
import { IModelStatus } from "@itwin/core-bentley";
import { Categories, CategoryColor } from "../Categories";
import { convertInchToMeter, getSlopeAngle, toNumber } from "../../ConnectorUtils";
import { Materials } from "../Materials";
import { LegGeometry } from "./Panel/LegGeometry";
import { FaceBracingSegmentMemberGeometry } from "./Panel/FaceBracingSegmentMemberGeometry";
import { PlanBracingMemberGeometry } from "./Panel/PlanBracingMemberGeometry";
import { TowerFaceBracingGeometry } from "./TowerFaceBracingGeometry";
import { TowerPlanBracingGeometry } from "./TowerPlanBracingGeometry";



export class TowerPanelBuilder {

    protected _builder: GeometryStreamBuilder;
    // protected _builder: PolyfaceBuilder;
    // 

    constructor(protected readonly _imodel: IModelDb, protected readonly _definitionModelId: Id64String, protected readonly _categoryId: Id64String) {
        this._builder = new GeometryStreamBuilder();
        // this._builder = new PolyfaceBuilder();
    }


    public createGeometry(panelLegs: any, nodes: any, sections: any, faceBracingDetails: any, planBracingDetails: any): GeometryStreamProps {

        if (panelLegs) {
            this.processPanelLegs(panelLegs, nodes, sections);
        }

        if (faceBracingDetails) {
            this.processPanelFaceBracingDetails(faceBracingDetails, nodes, sections)
        }

        if (planBracingDetails) {

            this.processPanelPlanBracingDetails(planBracingDetails, nodes, sections);

        }
        return this._builder.geometryStream;

    }

    private processPanelLegs = (panelLegs: any, nodes: any, sections: any) => {

        console.log(`inside processPanelLegs`);
        console.log(panelLegs);

        for (const legIndex of Object.keys(panelLegs)) {

            const panelLeg = panelLegs[legIndex];
            console.log(`Leg: ${panelLeg['ID']}`);

            // console.log(`for leg index: ${legIndex}`);
            // console.log(JSON.stringify(panelLeg));

            const startNode = nodes.find((node: any) => {
                if (node["ID"] == panelLeg['StartNodeID']) {
                    return node;
                }
            });
            const endNode = nodes.find((node: any) => {
                if (node["ID"] == panelLeg['EndNodeID']) {
                    return node;
                }
            });
            const section = sections.find((section: any) => {
                if (section["ID"] == panelLeg['SectionID']) {
                    return section;
                }
            });

            console.log(`startNode`);
            console.log(JSON.stringify(startNode));
            console.log(`endNode`);
            console.log(JSON.stringify(endNode));
            console.log(`section`);
            console.log(JSON.stringify(section));

            // this.convertPanelLeg(panelID, panelLeg, startNode, endNode, section)

            // const legShape = this.createLegShape(startNode, endNode, section);
            // if(legShape) {

            const name = "Panel_Leg_" + panelLeg['Name'] + "_" + panelLeg["ID"] + "_" + panelLeg["PanelPropertyID"];
            // let legShapeID = this.insertGeometryPart(name, legShape);
            const legGeometry = new LegGeometry(this._imodel, this._definitionModelId, this._categoryId);
            if (section['Name'] === 'LShapeProfile') {
                let legLShapeID = legGeometry.createLShapeLeg(this._categoryId, startNode, endNode, section, name);

                let baseMemberAngle = 0;
                let axisOrigin = { "X": 0, "Y": 0, "Z": 0 };
                const startXSign = Math.sign(startNode['X']);
                const startYSign = Math.sign(startNode['Y']);
                const endXSign = Math.sign(endNode['X']);
                const endYSign = Math.sign(endNode['Y']);

                console.log(`startNode:`);
                console.log(startNode);
                let verticalDegree = getSlopeAngle(axisOrigin, startNode);
                console.log('verticalDegree: ', verticalDegree);

                let degreeDoubleValue = verticalDegree * 2;
                let xDegreeValue = verticalDegree * startXSign;
                let yDegreeValue = verticalDegree * startYSign;

                console.log(`degreeDoubleValue => ${degreeDoubleValue}`)
                console.log(`xDegreeValue => ${xDegreeValue}`)
                console.log(`yDegreeValue => ${yDegreeValue}`);

                let finalDegree = degreeDoubleValue + xDegreeValue + yDegreeValue;

                console.log(`finalDegree => ${finalDegree}`)

                if (startXSign !== startYSign) {
                    finalDegree = finalDegree * startYSign;
                }

                console.log(`*** finalDegree => ${finalDegree}`)


                baseMemberAngle = finalDegree;
                // verticalMemberAngle +=verticalDegree;

                console.log(`baseMemberAngle => ${baseMemberAngle}`);
                // console.log(`verticalMemberAngle => ${verticalMemberAngle}`);

                let baseMemberOrigin = { ...startNode };
                // let baseMemberOrigin3dPoint = new Point3d(baseMemberOrigin['X'] + ((convertInchToMeter(section['Thickness']))*startXSign * 3 ), baseMemberOrigin['Y'] + ((convertInchToMeter(section['Thickness']))*startYSign * 3), baseMemberOrigin['Z']);
                let baseMemberOrigin3dPoint = new Point3d(baseMemberOrigin['X'] + ((convertInchToMeter(section['Thickness']) / 2) * startXSign), baseMemberOrigin['Y'] + ((convertInchToMeter(section['Thickness']) / 2) * startYSign), baseMemberOrigin['Z']);
                console.log('before baseMemberOrigin3dPoint');
                console.log(baseMemberOrigin3dPoint);


                console.log(`startXSign => ${startXSign} && startYSign: ${startYSign} && endXSign: ${endXSign} && endYSign: ${endYSign}`);
                console.log('after baseMemberOrigin3dPoint');
                console.log(baseMemberOrigin3dPoint);
                if(legLShapeID) {
                    this._builder.appendGeometryPart3d(legLShapeID, baseMemberOrigin3dPoint, YawPitchRollAngles.createDegrees(baseMemberAngle, 0, 0));
                }

            } else {
                let legShapeID = legGeometry.createLegShape(startNode, endNode, section, name);
                console.log('legShapeID');
                console.log(legShapeID);
                this._builder.appendGeometryPart3d(legShapeID);
            }

            // }
        }

    }

    private processPanelFaceBracingDetails = (faceBracingDetails: any, nodes: any, sections: any) => {

        const towerFaceBracingGeometry = new TowerFaceBracingGeometry(this._builder, this._imodel, this._definitionModelId, this._categoryId, nodes, sections);
        towerFaceBracingGeometry.processFaceBracingTypes(faceBracingDetails);


    }

    private processPanelPlanBracingDetails = (planBracingDetails: any, nodes: any, sections: any) => {

        const towerPlanBracingGeometry = new TowerPlanBracingGeometry(this._builder, this._imodel, this._definitionModelId, this._categoryId, nodes, sections);
        towerPlanBracingGeometry.processPlanBracingTypes(planBracingDetails);



    }


}