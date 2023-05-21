import { GeometryPart, IModelDb } from "@itwin/core-backend";
import { Id64String } from "@itwin/core-bentley";
import { ColorDef, GeometryParams, GeometryPartProps, GeometryStreamBuilder } from "@itwin/core-common";
import { Box, Point3d, SolidPrimitive, Vector3d } from "@itwin/core-geometry";
import { convertInchToMeter, distanceBetweenPoint, fromSumOf } from "../../../../ConnectorUtils";
import { CategoryColor } from "../../../Categories";


export class Diamond1XBracingGeometry {

    constructor(protected readonly _imodel: IModelDb, protected readonly _definitionModelId: Id64String, protected readonly _categoryId: any) {
        // this._builder = new PolyfaceBuilder();
    }

    public createGeometry(startNode: any, endNode: any, section: any, name: any) {

        console.log("********** inside the PlanBracingMemberGeometry createGeometry");
        console.log(`startNode`);
        console.log(startNode);
        console.log(`endNode`);
        console.log(endNode);
        console.log(`section`);
        console.log(section);

        let length = Math.abs(distanceBetweenPoint(startNode, endNode));
        console.log(`length => ${length}`)


        let baseShapePartID: Id64String = "";

        const baseShape = this.createDgnShape(convertInchToMeter(section['Width']), length, convertInchToMeter(section['Thickness']));
        if (baseShape) {
            baseShapePartID = this.insertGeometryPart(this._definitionModelId, name, baseShape);
        }

        return baseShapePartID;

        // let degree =  getSlopeAngle(startNode, endNode);
        // console.log('degree: ', degree);
        // if(Math.sign(degree) == -1) {
        //     degree = degree - 90;
        // } else {
        //     degree = degree + 90;
        // }
        // console.log('===> degree : ', degree);


        // const origin = new Point3d(0, 0, 0);

        // if (baseShapePartID) {

        //     this._builder.appendGeometryPart3d(baseShapePartID, origin, YawPitchRollAngles.createDegrees(degree, 0, 0));
        //     this._builder.appendGeometryPart3d(baseShapePartID, origin, YawPitchRollAngles.createDegrees(degree, 90, 0));
        // }


        // return this._builder.geometryStream;


    }

    private createDgnShape = (width: any, length: any, height: any) => {
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


    private insertGeometryPart = (definitionModelId: Id64String, name: string, primitive: SolidPrimitive): Id64String => {
        // console.log("inside the insertGeometryPart");
        // console.log('definitionModelId');
        // console.log(definitionModelId);
        // console.log('name');
        // console.log(name);
        // console.log('primitive');
        // console.log(primitive);
        const geometryStreamBuilder = new GeometryStreamBuilder();
        const params = new GeometryParams(this._categoryId, "plan-t-shape");
        params.fillColor = ColorDef.fromTbgr(CategoryColor.PlanBracing);
        params.lineColor = params.fillColor;
        geometryStreamBuilder.appendGeometryParamsChange(params);

        geometryStreamBuilder.appendGeometry(primitive);

        const geometryPartProps: GeometryPartProps = {
            classFullName: GeometryPart.classFullName,
            model: definitionModelId,
            code: GeometryPart.createCode(this._imodel, definitionModelId, name),
            geom: geometryStreamBuilder.geometryStream,
        };

        // console.log('geometryPartProps');
        // console.log(geometryPartProps);

        return this._imodel.elements.insertElement(geometryPartProps);
    }
}