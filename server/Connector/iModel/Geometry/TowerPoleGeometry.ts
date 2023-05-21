
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Box, Cone, Point3d, SolidPrimitive, Vector3d, YawPitchRollAngles } from "@itwin/core-geometry";
import type { IModelDb } from "@itwin/core-backend";
import { GeometryPart } from "@itwin/core-backend";
import { GeometryPartProps, GeometryStreamProps } from "@itwin/core-common";
import { ColorDef, GeometryParams, GeometryStreamBuilder } from "@itwin/core-common";
import type { Id64String } from "@itwin/core-bentley";
import { convertFeetToMeter, convertInchToMeter, distanceBetweenPoint, fromSumOf, getSlopeAngle, toNumber } from "../../ConnectorUtils";
import { CategoryColor } from "../Categories";



export class TowerPoleBuilder {

    protected _builder: GeometryStreamBuilder;
    // protected _builder: PolyfaceBuilder;
    // 

    constructor(protected readonly _imodel: IModelDb, protected readonly _definitionModelId: Id64String, protected readonly _categoryId: Id64String, protected readonly poleProperty: any) {
        this._builder = new GeometryStreamBuilder();
        // this._builder = new PolyfaceBuilder();
    }

    public createGeometry(pole: any, nodes: any, sections: any): GeometryStreamProps {


        // console.log('nodes')
        // console.log(nodes)
        // console.log('sections')
        // console.log(sections)
        const startNode = nodes.find((node: any) => node["ID"] == pole['StartNodeID']);
        const endNode = nodes.find((node: any) => node["ID"] == pole['EndNodeID']);
        const section = sections.find((section: any) => section["ID"] == pole['SectionID']);
        const name = "Pole_" + pole['PolePropertyID'] + "_Member_" + pole["ID"];

        console.log('section');
        console.log(section);
        console.log('startNode');
        console.log(startNode);
        console.log('endNode');
        console.log(endNode);
        console.log('name');
        console.log(name);

        const topRadius = convertFeetToMeter(this.poleProperty['TopFlatDiameter']) / 2;
        const bottomRadius = convertFeetToMeter(this.poleProperty['BottomFlatDiameter']) / 2;
        // const pointA = Point3d.create(toNumber(startNode['X']), toNumber(startNode['Z']) * -1, toNumber(startNode['Y']));
        // const pointB = Point3d.create(toNumber(endNode['X']), toNumber(endNode['Z']) * -1, toNumber(endNode['Y']));

        const pointA = Point3d.create(startNode['X'], startNode['Y'], startNode['Z']);
        const pointB = Point3d.create(endNode['X'], endNode['Y'], endNode['Z']);

        console.log(`topRadius => ${topRadius}`);
        console.log(`bottomRadius => ${bottomRadius}`);
        const shape = Cone.createAxisPoints(pointA, pointB, topRadius, bottomRadius, true);
        if (shape) {
            let shapeID = this.insertGeometryPart(name, shape);
            // let origin = new Point3d(toNumber(startNode['Z']), toNumber(startNode['X']), toNumber(startNode['Y']));
            this._builder.appendGeometryPart3d(shapeID);
        }

        return this._builder.geometryStream;

    }

    private insertGeometryPart = (name: string, primitive: SolidPrimitive): Id64String => {
        console.log("inside the TowerMountPipeBuilder insertGeometryPart");
        const geometryStreamBuilder = new GeometryStreamBuilder();
        const params = new GeometryParams(this._categoryId, "pole");
        params.fillColor = ColorDef.fromTbgr(CategoryColor.Poles);
        params.lineColor = params.fillColor;
        geometryStreamBuilder.appendGeometryParamsChange(params);

        geometryStreamBuilder.appendGeometry(primitive);

        const geometryPartProps: GeometryPartProps = {
            classFullName: GeometryPart.classFullName,
            model: this._definitionModelId,
            code: GeometryPart.createCode(this._imodel, this._definitionModelId, name),
            geom: geometryStreamBuilder.geometryStream,
        };

        // console.log('geometryPartProps');
        // console.log(geometryPartProps);

        return this._imodel.elements.insertElement(geometryPartProps);
    }


}