
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Box, Cone, Point3d, PolyfaceBuilder, SolidPrimitive, StrokeOptions, Vector3d, YawPitchRollAngles, YawPitchRollProps } from "@itwin/core-geometry";
import type { IModelDb } from "@itwin/core-backend";
import { GeometryPart } from "@itwin/core-backend";
import { GeometryPartProps, GeometryStreamProps } from "@itwin/core-common";
import { ColorDef, GeometryParams, GeometryStreamBuilder } from "@itwin/core-common";
import type { Id64String } from "@itwin/core-bentley";
import { convertInchToFeet, convertInchToMeter, fromSumOf, mandateConvertInchToMeter, toNumber } from "../../ConnectorUtils";
import { CategoryColor } from "../Categories";



export class TowerAntennaBuilder {

    protected _builder: GeometryStreamBuilder;
    // protected _builder: PolyfaceBuilder;
    // 

    constructor(protected readonly _imodel: IModelDb, protected readonly _definitionModelId: Id64String, protected readonly _categoryId: Id64String, protected readonly antennaProperty: any) {
        this._builder = new GeometryStreamBuilder();
        // this._builder = new PolyfaceBuilder();
    }

    private createDgnShape = (width: any, length: any, height: any): any => {
        const boxWitdh = width;
        const boxLength = length;
        const boxHeight = height;

        // console.log(`boxWitdh => ${boxWitdh}`);
        // console.log(`boxLength => ${boxLength}`);
        // console.log(`boxHeight => ${boxHeight}`);

        // const antenna = Box.createRange(new Range3d(0 - boxLength / 2, 0 - boxWitdh / 2, 0 / 2, 0 + boxLength / 2, 0 + boxWitdh / 2, boxHeight), false)

        const size = new Point3d(boxWitdh, boxLength, boxHeight);
        const center = new Point3d(boxWitdh / 2.0, boxLength / 2.0, boxHeight / 2.0);

        // console.log('size');
        // console.log(size);
        // console.log('center');
        // console.log(center);
        const vectorX = Vector3d.unitX();
        const vectorY = Vector3d.unitY();
        const baseX = size.x;
        const baseY = size.y;
        const topX = size.x;
        const topY = size.y;
        const halfHeight: number = size.z / 2;

        // console.log('vectorX');
        // console.log(vectorX);
        // console.log('vectorY');
        // console.log(vectorY);

        // console.log(`baseX => ${baseX} ===> baseY: ${baseY}`);
        // console.log(`topX => ${topX} ===> topY: ${topY}`);
        // console.log(`halfHeight => ${halfHeight}`);


        const baseCenter = new Point3d(center.x, center.y, center.z - halfHeight);
        const topCenter = new Point3d(center.x, center.y, center.z + halfHeight);

        // console.log('baseCenter');
        // console.log(baseCenter);
        // console.log('topCenter');
        // console.log(topCenter);

        let baseOrigin = fromSumOf(baseCenter, vectorX, baseX * -0.5); //* -0.5
        // console.log('first baseOrigin');
        // console.log(baseOrigin);
        baseOrigin = fromSumOf(baseOrigin, vectorY, baseY * -0.5); // * -0.5
        // console.log('second baseOrigin');
        // console.log(baseOrigin);

        let topOrigin = fromSumOf(topCenter, vectorX, baseX * -0.5); // * -0.5
        // console.log('first topOrigin');
        // console.log(topOrigin);
        topOrigin = fromSumOf(topOrigin, vectorY, baseY * -0.5); // * -0.5
        // console.log('second topOrigin');
        // console.log(topOrigin);

        return Box.createDgnBox(baseOrigin, vectorX, vectorY, topOrigin, baseX, baseY, topX, topY, true);
    }

    private createConeShape = (name: string, origin: any, antennaProperty: any): any => {
        console.log(`createConeShape`);
        const dishHeight = convertInchToMeter(this.antennaProperty['Depth']) / 2;
        const dishRadius = convertInchToMeter(this.antennaProperty['Width']) / 2;

        console.log(`dishHeight => ${dishHeight}`)
        console.log(`dishRadius => ${dishRadius}`)

        const pointA = Point3d.create(0, 0, 0);
        const pointB = Point3d.create(0, 0, dishHeight);
        let shape =  Cone.createAxisPoints(pointA, pointB, dishRadius, dishRadius, true);

        if(shape) {
            let shapeId = this.insertGeometryPart(name, shape);
            this._builder.appendGeometryPart3d(shapeId, origin, YawPitchRollAngles.createDegrees(antennaProperty["antennaAzmith"], 0, 0));
        }
    }

    private constructBoxShape = (categoryId: Id64String, startNode: any, endNode: any, antennaProperties: any, name: any): any => {

        // let length = Math.abs(distanceBetweenPoint(startNode, endNode));
        // console.log(`length => ${length}`);
        console.log(`name => ${name}`);
        console.log(`startNode => ${startNode}`);
        console.log(`endNode => ${endNode}`);

        let boxWitdh: any = mandateConvertInchToMeter(antennaProperties['Width']);
        let boxLength: any = mandateConvertInchToMeter(antennaProperties['Depth']);
        let boxHeight: any = mandateConvertInchToMeter(antennaProperties['Height']);
        console.log("boxWitdh: ", boxWitdh, typeof boxWitdh)
        console.log("boxLength: ", boxLength, typeof boxLength)
        console.log("boxHeight: ", boxHeight, typeof boxHeight)
        console.log("boxWitdh < 1 ", boxWitdh < 1)
        // boxWitdh = boxWitdh < 1 ? 1 : boxWitdh;
        // boxLength = boxLength < 1 ? 1 : boxLength;
        // boxHeight = boxHeight < 1 ? 1 : boxHeight;
        // console.log("after boxWitdh: ", boxWitdh, typeof boxWitdh)
        // console.log("after boxLength: ", boxLength, typeof boxLength)
        // console.log("after boxHeight: ", boxHeight, typeof boxHeight)

        const baseShape = this.createDgnShape(boxWitdh, boxLength, boxHeight);

        if (baseShape) {
            console.log("antenna shape created");
            console.log(baseShape)
            const geometryStreamBuilder = new GeometryStreamBuilder();
            const params = new GeometryParams(categoryId, "tower-antenna-element");
            params.fillColor = ColorDef.fromTbgr(CategoryColor.Antenna);
            params.lineColor = params.fillColor;
            geometryStreamBuilder.appendGeometryParamsChange(params);
            
            let origin = new Point3d((boxWitdh / 2),(boxLength/ 2), 0);
            geometryStreamBuilder.setLocalToWorld3d(origin);
            geometryStreamBuilder.appendGeometry(baseShape);


            const geometryPartProps: GeometryPartProps = {
                classFullName: GeometryPart.classFullName,
                model: this._definitionModelId,
                code: GeometryPart.createCode(this._imodel, this._definitionModelId, name),
                geom: geometryStreamBuilder.geometryStream,
            };

            return this._imodel.elements.insertElement(geometryPartProps);

        }
    }

    private createAntennaMember = (categoryId: Id64String, startNode: any, endNode: any, antennaProperties: any): any => {

        const name = "Antenna_" + antennaProperties['ID'];
        console.log(`AntennaName: ${name}`);

        // const boxWitdh = convertInchToMeter(antennaProperties['Width']);
        // const boxLength = convertInchToMeter(antennaProperties['Depth']);

        const options = StrokeOptions.createForFacets();
        options.needParams = true;
        options.needNormals = true;
        const builder = PolyfaceBuilder.create(options);

        let shapeElementID = null;
        shapeElementID = this.constructBoxShape(categoryId, startNode, endNode, antennaProperties, name);

        // let origin = new Point3d(startNode['X'] - (boxWitdh / 2), startNode['Y'] - (boxLength/ 2), startNode['Z']);
        let origin = new Point3d(startNode['X'],  startNode['Y'], startNode['Z']);
        console.log('origin')
        console.log(origin)

        console.log(`antennaProperties["antennaAzmith"]: ${antennaProperties["antennaAzmith"]}`);

        if (shapeElementID) {
            this._builder.appendGeometryPart3d(shapeElementID, origin, YawPitchRollAngles.createDegrees(antennaProperties["antennaAzmith"], 0, 0));
        }
    }


    public createGeometry(antennaElement: any, mountNodes: any, sections: any): GeometryStreamProps {

        console.log("inside antenna createGeometry")

        const startNodeID = antennaElement[0]['elements'][0]['StartNodeID'];
        const endNodeID = antennaElement[0]['elements'][0]['EndNodeID'];
        const sectionID = antennaElement[0]['elements'][0]['SectionID'];
        console.log(`startNodeID => ${startNodeID}`)
        console.log(`endNodeID => ${endNodeID}`)
        console.log(`sectionID => ${sectionID}`)

        const startNode = mountNodes.filter((node: any) => {
            if (node['ID'] == startNodeID) {
                return node;
            }
        })[0]
        const endNode = mountNodes.filter((node: any) => {
            if (node['ID'] == endNodeID) {
                return node;
            }
        })[0];
        const section = sections.find((section: any) => section["ID"] == sectionID);
        const name = "Antenna_" + antennaElement[0]['elements'][0]['AntennaPropertyID'] + "_Member_" + antennaElement[0]['elements'][0]["ID"];
        console.log(`name => ${name}`);
        console.log(`section => ${JSON.stringify(section)}`);
        console.log(`startNode => ${JSON.stringify(startNode)}`);
        console.log(`endNode => ${JSON.stringify(endNode)}`);

        let origin = new Point3d(startNode['X'], startNode['Y'], startNode['Z']);
        console.log(`============================================= origin`);
        console.log(origin);
        let shape = null;
        let degree = 0;
        if (this.antennaProperty['Type'] !== 'DISH') {
            // // Box Shape
            // degree =  this.antennaProperty['Azimuth'];
            // console.log('degree: ', degree);
            // if(Math.sign(degree) == -1) {
            //     degree = degree - 90;
            // } else {
            //     degree = degree + 90;
            // }
            // console.log('===> degree : ', degree);
            // const boxHalfWitdh = convertInchToMeter(this.antennaProperty['Width']) / 2;
            // const boxHalfLength = convertInchToMeter(this.antennaProperty['Depth']) / 2;
            // origin = new Point3d(startNode['X'] - boxHalfWitdh, startNode['Y'] - boxHalfLength, startNode['Z']);
            // shape = this.createBoxShape(name);
            this.createAntennaMember(this._categoryId, startNode, endNode, this.antennaProperty);
        } else {
            // Cone Shape
            this.createConeShape(name, origin, this.antennaProperty)
            
        }   





        return this._builder.geometryStream;

    }

    private insertGeometryPart = (name: string, primitive: SolidPrimitive): Id64String => {
        console.log("inside the TowerMountPipeBuilder insertGeometryPart");
        const geometryStreamBuilder = new GeometryStreamBuilder();
        const params = new GeometryParams(this._categoryId, "antenna");
        params.fillColor = ColorDef.fromTbgr(CategoryColor.Antenna);
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