
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Cone, Point3d, SolidPrimitive } from "@itwin/core-geometry";
import type { IModelDb } from "@itwin/core-backend";
import { GeometryPart} from "@itwin/core-backend";
import {  GeometryPartProps} from "@itwin/core-common";
import { ColorDef, GeometryParams, GeometryStreamBuilder } from "@itwin/core-common";
import type { Id64String } from "@itwin/core-bentley";
import { convertInchToMeter, toNumber } from "../../ConnectorUtils";
import { CategoryColor } from "../Categories";



export class TowerMountPipeBuilder {

    protected _builder: GeometryStreamBuilder;
    // protected _builder: PolyfaceBuilder;
    // 

    constructor(protected readonly _imodel: IModelDb, protected readonly _definitionModelId: Id64String, protected readonly _categoryId: Id64String) {
        this._builder = new GeometryStreamBuilder();
        // this._builder = new PolyfaceBuilder();
    }


    public createGeometry(mountPipes: any, mountNodes: any, sections: any) {

        mountPipes.forEach((mountPipeElement: any) => {

            const startNode = mountNodes.find((node: any) => node["ID"] == mountPipeElement['StartNodeID']);
            const endNode = mountNodes.find((node: any) => node["ID"] == mountPipeElement['EndNodeID']);
            const mountSection = sections.find((section: any) => section["ID"] == mountPipeElement["SectionID"]);
            const name = "Mount_Pipe_" + mountPipeElement['MountPipePropertyID'] + "_Member_" + mountPipeElement["ID"];
            let shapeId = this.createShape(startNode, endNode, mountSection, name);
            this._builder.appendGeometryPart3d(shapeId);

        })
        return this._builder.geometryStream;
    }

    public createShape = (startNode: any, endNode: any, section: any, name: string) => {

        const radius = convertInchToMeter(section['Radius'])
        // const pointA = Point3d.create(toNumber(startNode['X']), toNumber(startNode['Z']) * -1, toNumber(startNode['Y']));
        // const pointB = Point3d.create(toNumber(endNode['X']), toNumber(endNode['Z']) * -1, toNumber(endNode['Y']));

        const pointA = Point3d.create(startNode['X'], startNode['Y'], startNode['Z']);
        const pointB = Point3d.create(endNode['X'], endNode['Y'], endNode['Z']);

        const mountShape = Cone.createAxisPoints(pointA, pointB, radius, radius, true);
        let mountShapeID: Id64String = "";
        if (mountShape) {
            mountShapeID = this.insertGeometryPart(name, mountShape);
        }
        return mountShapeID;

    }

    private insertGeometryPart = (name: string, primitive: SolidPrimitive): Id64String => {
        console.log("inside the TowerMountPipeBuilder insertGeometryPart");
        const geometryStreamBuilder = new GeometryStreamBuilder();
        const params = new GeometryParams(this._categoryId, "mount");
        params.fillColor = ColorDef.fromTbgr(CategoryColor.MountPipes);
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