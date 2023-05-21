
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
import { convertInchToMeter, distanceBetweenPoint, fromSumOf, getSlopeAngle, toNumber } from "../../ConnectorUtils";
import { CategoryColor } from "../Categories";



export class TowerAppurtenanceBuilder {

    protected _builder: GeometryStreamBuilder;
    // protected _builder: PolyfaceBuilder;
    // 

    constructor(protected readonly _imodel: IModelDb, protected readonly _definitionModelId: Id64String, protected readonly _categoryId: Id64String, protected readonly antennaProperty: any) {
        this._builder = new GeometryStreamBuilder();
        // this._builder = new PolyfaceBuilder();
    }

    public createGeometry(appurtenance: any, appurtenanceNodes: any, sections: any): GeometryStreamProps {

        appurtenance.elements.forEach((appurtenanceMember: any) => {

            const startNode = appurtenanceNodes.find((node: any) => node["Id"] == appurtenanceMember['StartNodeID']);
            const endNode = appurtenanceNodes.find((node: any) => node["Id"] == appurtenanceMember['EndNodeID']);
            const section = sections.find((section: any) => section["ID"] == appurtenanceMember['SectionId']);
            const name = "Appurtenance_" + appurtenanceMember['AppurtenancePropertyID'] + "_Member_" + appurtenanceMember["ID"];

            console.log('section');
            console.log(section);
            console.log('startNode');
            console.log(startNode);
            console.log('endNode');
            console.log(endNode);

            const radius = convertInchToMeter(section['Radius'])
            // const pointA = Point3d.create(toNumber(startNode['X']), toNumber(startNode['Z']) * -1, toNumber(startNode['Y']));
            // const pointB = Point3d.create(toNumber(endNode['X']), toNumber(endNode['Z']) * -1, toNumber(endNode['Y']));

            const pointA = Point3d.create(startNode['X'], startNode['Y'], startNode['Z']);
            const pointB = Point3d.create(endNode['X'], endNode['Y'], endNode['Z']);

            const shape = Cone.createAxisPoints(pointA, pointB, radius, radius, true);
            if (shape) {
                let shapeID = this.insertGeometryPart(name, shape);
                // let origin = new Point3d(toNumber(startNode['Z']), toNumber(startNode['X']), toNumber(startNode['Y']));
                this._builder.appendGeometryPart3d(shapeID);
            }



        })

        return this._builder.geometryStream;

    }

    private insertGeometryPart = (name: string, primitive: SolidPrimitive): Id64String => {
        console.log("inside the TowerMountPipeBuilder insertGeometryPart");
        const geometryStreamBuilder = new GeometryStreamBuilder();
        const params = new GeometryParams(this._categoryId, "attachement");
        params.fillColor = ColorDef.fromTbgr(CategoryColor.Appurtenance);
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