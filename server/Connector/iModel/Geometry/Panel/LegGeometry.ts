import { GeometryPart, IModelDb } from "@itwin/core-backend";
import { Id64String } from "@itwin/core-bentley";
import { ColorDef, GeometryParams, GeometryPartProps, GeometryStreamBuilder } from "@itwin/core-common";
import { Box, Cone, Point3d, SolidPrimitive, Vector3d } from "@itwin/core-geometry";
import { convertInchToMeter, distanceBetweenPoint, fromSumOf, getSlopeAngle, toNumber } from "../../../ConnectorUtils";
import { CategoryColor } from "../../Categories";


export class LegGeometry {

    constructor(protected readonly _imodel: IModelDb, protected readonly _definitionModelId: Id64String, protected readonly _categoryId: any) {

    }

    public createLShapeLeg(categoryId: Id64String, startNode: any, endNode: any, section: any, name: any): any {

        console.log(`name => ${name}`);
        console.log(`categoryId => ${categoryId}`);

        let length = Math.abs(distanceBetweenPoint(startNode, endNode));
        console.log(`length => ${length}`);
        console.log(`name => ${name}`);

        const baseShape = this.createDgnShape(convertInchToMeter(section['Depth']), convertInchToMeter(section['Thickness']), length);
        const verticalShape = this.createDgnShape(convertInchToMeter(section['Thickness']), convertInchToMeter(section['Depth']), length);
        if (baseShape && verticalShape) {
            const geometryStreamBuilder = new GeometryStreamBuilder();

            const params = new GeometryParams(this._categoryId, "l-shape");
            params.fillColor = ColorDef.fromTbgr(CategoryColor.Legs);
            params.lineColor = params.fillColor;
            geometryStreamBuilder.appendGeometryParamsChange(params);
            geometryStreamBuilder.appendGeometry(baseShape);
            geometryStreamBuilder.appendGeometry(verticalShape);

            const geometryPartProps: GeometryPartProps = {
                classFullName: GeometryPart.classFullName,
                model: this._definitionModelId,
                code: GeometryPart.createCode(this._imodel, this._definitionModelId, name),
                geom: geometryStreamBuilder.geometryStream,
            };

            return this._imodel.elements.insertElement(geometryPartProps);

        }

        // let baseShapePartID: Id64String = "";

        // const baseShape = this.createDgnShape(convertInchToMeter(section['Depth']), convertInchToMeter(section['Thickness']), length);
        // // console.log('baseShape');
        // // console.log(baseShape);
        // // const name = segmentMember["ID"] + "_" + segmentMember['MemberTag'];
        // if (baseShape) {
        //     baseShapePartID = this.insertGeometryPart(categoryId, name, baseShape);
        // }

        // let lshapeID = this.constructLShape(categoryId, startNode, endNode, section, name);
        // if(lshapeID) {
        //     return lshapeID;
        // }

        // console.log(`startNode:`);
        // console.log(startNode);
        // let verticalDegree = getSlopeAngle(axisOrigin, startNode);
        // console.log('verticalDegree: ', verticalDegree);

        // let degreeDoubleValue = verticalDegree * 2;
        // let xDegreeValue = verticalDegree * startXSign;
        // let yDegreeValue = verticalDegree * startYSign;

        // console.log(`degreeDoubleValue => ${degreeDoubleValue}`)
        // console.log(`xDegreeValue => ${xDegreeValue}`)
        // console.log(`yDegreeValue => ${yDegreeValue}`);

        // let finalDegree = degreeDoubleValue +  xDegreeValue + yDegreeValue;

        // console.log(`finalDegree => ${finalDegree}`)

        // if(startXSign !== startYSign) {
        //     finalDegree = finalDegree * startYSign;
        // }

        // console.log(`*** finalDegree => ${finalDegree}`)


        // baseMemberAngle = finalDegree;
        // // verticalMemberAngle +=verticalDegree;

        // console.log(`baseMemberAngle => ${baseMemberAngle}`);
        // // console.log(`verticalMemberAngle => ${verticalMemberAngle}`);

        // let baseMemberOrigin = {...startNode};
        // // let baseMemberOrigin3dPoint = new Point3d(baseMemberOrigin['X'] + ((convertInchToMeter(section['Thickness']))*startXSign * 3 ), baseMemberOrigin['Y'] + ((convertInchToMeter(section['Thickness']))*startYSign * 3), baseMemberOrigin['Z']);
        // let baseMemberOrigin3dPoint = new Point3d(baseMemberOrigin['X'] + ((convertInchToMeter(section['Thickness']) / 2 )*startXSign), baseMemberOrigin['Y'] + ((convertInchToMeter(section['Thickness']) / 2)*startYSign), baseMemberOrigin['Z']);
        // console.log('before baseMemberOrigin3dPoint');
        // console.log(baseMemberOrigin3dPoint);


        // console.log(`startXSign => ${startXSign} && startYSign: ${startYSign} && endXSign: ${endXSign} && endYSign: ${endYSign}`);
        // console.log('after baseMemberOrigin3dPoint');
        // console.log(baseMemberOrigin3dPoint);

        // if(lshapeID) {
        //     this._builder.appendGeometryPart3d(lshapeID, baseMemberOrigin3dPoint, YawPitchRollAngles.createDegrees(baseMemberAngle, 0, 0));
        // }

    }

    // private constructLShape = (categoryId: Id64String, startNode: any, endNode: any, section: any, name: any) => {

    //     let length = Math.abs(distanceBetweenPoint(startNode, endNode));
    //     console.log(`length => ${length}`);
    //     console.log(`name => ${name}`);

    //     const baseShape = this.createDgnShape(convertInchToMeter(section['Depth']), convertInchToMeter(section['Thickness']), length);
    //     const verticalShape = this.createDgnShape(convertInchToMeter(section['Thickness']), convertInchToMeter(section['Depth']), length);
    //     if (baseShape && verticalShape) {
    //         const geometryStreamBuilder = new GeometryStreamBuilder();

    //         const params = new GeometryParams(this._categoryId, "l-shape");
    //         params.fillColor = ColorDef.fromTbgr(CategoryColor.Legs);
    //         params.lineColor = params.fillColor;
    //         geometryStreamBuilder.appendGeometryParamsChange(params);
    //         geometryStreamBuilder.appendGeometry(baseShape);
    //         geometryStreamBuilder.appendGeometry(verticalShape);

    //         const geometryPartProps: GeometryPartProps = {
    //             classFullName: GeometryPart.classFullName,
    //             model: this._definitionModelId,
    //             code: GeometryPart.createCode(this._imodel, this._definitionModelId, name),
    //             geom: geometryStreamBuilder.geometryStream,
    //         };

    //         return this._imodel.elements.insertElement(geometryPartProps);

    //     }
    // }

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


    public createLegShape = (startNode: any, endNode: any, section: any, name: string): any => {


        let radius = convertInchToMeter(section['Radius']);
        if (radius == 0) {
            radius = convertInchToMeter(section['Width']) / 2;
        }

        console.log(`radius: `, radius)
        // const pointA = Point3d.create(toNumber(startNode['X']), toNumber(startNode['Z']) * -1, toNumber(startNode['Y']));
        // const pointB = Point3d.create(toNumber(endNode['X']), toNumber(endNode['Z']) * -1, toNumber(endNode['Y']));

        const zPointDifference = endNode['Z'] - startNode['Z'];

        console.log(`zPointDifference: ${zPointDifference}`)

        const pointA = Point3d.create(startNode['X'], startNode['Y'], startNode['Z']);
        const pointB = Point3d.create(endNode['X'], endNode['Y'], endNode['Z']);

        const legShape = Cone.createAxisPoints(pointA, pointB, radius, radius, true);

        console.log(`pointA`);
        console.log(pointA);
        console.log(`pointB`);
        console.log(pointB);
        console.log('radius');
        console.log(radius);
        console.log('legShape');
        console.log(legShape);
        let legShapeID: Id64String = "";
        if (legShape) {
            legShapeID = this.insertGeometryPart(name, legShape);
        }
        return legShapeID;

    }

    private insertGeometryPart = (name: string, primitive: SolidPrimitive): Id64String => {
        console.log("inside the insertGeometryPart");
        // console.log('definitionModelId');
        // console.log(definitionModelId);
        // console.log('name');
        // console.log(name);
        // console.log('primitive');
        // console.log(primitive);
        const geometryStreamBuilder = new GeometryStreamBuilder();
        const params = new GeometryParams(this._categoryId, "leg-cone-shape");
        params.fillColor = ColorDef.fromTbgr(CategoryColor.Legs);
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