import { GeometryPart, IModelDb, RenderMaterialElement } from "@itwin/core-backend";
import { Id64String } from "@itwin/core-bentley";
import { ColorByName, ColorDef, GeometryParams, GeometryPartProps, GeometryStreamBuilder } from "@itwin/core-common";
import { Box, Cone, Point3d, SolidPrimitive, StrokeOptions, Vector3d } from "@itwin/core-geometry";
import { convertInchToMeter, distanceBetweenPoint, fromSumOf, toNumber } from "../../../ConnectorUtils";
import { CategoryColor } from "../../Categories";
import { Materials } from "../../Materials";


export class FaceBracingSegmentMemberGeometry {

    constructor(protected readonly _imodel: IModelDb, protected readonly _definitionModelId: Id64String, protected readonly _categoryId: any) {
        // this._builder = new PolyfaceBuilder();
    }

    private createDiagonalMember = (startNode: any, endNode: any, section: any, name: string): any => {
        // const radius = convertInchToMeter(section['Radius']);
        let radius = convertInchToMeter(section['Radius']);
        if (radius == 0) {
            radius = convertInchToMeter(section['Width']) / 2;
        }

        console.log('radius');
        console.log(radius);

        const pointA = Point3d.create(startNode['X'], startNode['Y'], startNode['Z']);
        const pointB = Point3d.create(endNode['X'], endNode['Y'], endNode['Z']);

        const cylinder = Cone.createAxisPoints(pointA, pointB, radius, radius, true);

        let baseShapePartID: Id64String = "";
        if (cylinder) {
            baseShapePartID = this.insertGeometryPart(name, cylinder);
        }

        return baseShapePartID;



    }


    public createGeometry(startNode: any, endNode: any, section: any, name: string, memberTag: string): any {
        console.log('FaceBracingSegmentMemberGeometry');
        console.log(`startNode`);
        console.log(startNode);
        console.log(`endNode`);
        console.log(endNode);
        console.log(`section`);
        console.log(section);
        console.log(`memberTag`);
        console.log(memberTag);

        if (memberTag === 'DIAGONAL') {
            return this.createDiagonalMember(startNode, endNode, section, name);
        } else {
            return this.createCompleShapeMember(startNode, endNode, section, name);
        }
    }


    private createCompleShapeMember(startNode: any, endNode: any, section: any, name: any): any {

        console.log("********** inside the createCompleShapeMember");
        console.log(`name: ${name}`);

        const zIndexDifferece = endNode['Z'] - startNode['Z'];
        console.log(`zIndexDifferece => ${zIndexDifferece}`)

        let shapeElementID = null;
        if (section['Name'] === 'LShapeProfile') {
            shapeElementID = this.constructLShape(startNode, endNode, section, name, zIndexDifferece);
        } else if (section['Name'] === 'DoubleLShapeProfile') {
            shapeElementID = this.constructDoubleLShape(startNode, endNode, section, name, zIndexDifferece);
        }

        return shapeElementID;

    }

    private constructLShape = (startNode: any, endNode: any, section: any, name: any, zIndexDifferece: any): any => {

        let length = Math.abs(distanceBetweenPoint(startNode, endNode));
        console.log(`length => ${length}`);
        console.log(`name => ${name}`);
        console.log(`zIndexDifferece => ${zIndexDifferece}`);

        let baseElementWidth = convertInchToMeter(section['Depth']) * -1;
        let baseElementLength = length;
        let baseElementHeight = convertInchToMeter(section['Thickness']);

        let verticalElementWidth = convertInchToMeter(section['Thickness']) * -1;
        let verticalElementLength = length;
        let verticalElementHeight = convertInchToMeter(section['Depth']) * -1;


        const baseShape = this.createDgnShape(baseElementWidth, baseElementLength, baseElementHeight);
        const verticalShape = this.createDgnShape(verticalElementWidth, verticalElementLength, verticalElementHeight);
        if (baseShape && verticalShape) {
            const geometryStreamBuilder = new GeometryStreamBuilder();

            const params = new GeometryParams(this._categoryId, "fb-l-shape");
            params.fillColor = ColorDef.fromTbgr(CategoryColor.FaceBracing);
            params.lineColor = params.fillColor;
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
    }


    private constructDoubleLShape = (startNode: any, endNode: any, section: any, name: any, zIndexDifferece: any): any => {

        let length = Math.abs(distanceBetweenPoint(startNode, endNode));
        console.log(`length => ${length}`);
        console.log(`name => ${name}`);
        console.log(`zIndexDifferece => ${zIndexDifferece}`);

        let baseElementWidth = convertInchToMeter(section['Depth']) * -1;
        let baseElementLength = length;
        let baseElementHeight = convertInchToMeter(section['Thickness']);

        let verticalElementWidth = convertInchToMeter(section['Thickness']) * -1;
        let verticalElementLength = length;
        let verticalElementHeight = convertInchToMeter(section['Depth']) * -1;

        let baseRightElementWidth = convertInchToMeter(section['Depth']);
        let baseRightElementLength = length;
        let baseRightElementHeight = convertInchToMeter(section['Thickness']);


        const baseShape = this.createDgnShape(baseElementWidth, baseElementLength, baseElementHeight);
        const verticalShape = this.createDgnShape(verticalElementWidth, verticalElementLength, verticalElementHeight);
        const baseRightShape = this.createDgnShape(baseRightElementWidth, baseRightElementLength, baseRightElementHeight);
        if (baseShape && verticalShape && baseRightShape) {
            const geometryStreamBuilder = new GeometryStreamBuilder();

            const params = new GeometryParams(this._categoryId, "fb-t-shape");
            params.fillColor = ColorDef.fromTbgr(CategoryColor.FaceBracing);
            params.lineColor = params.fillColor;
            geometryStreamBuilder.appendGeometryParamsChange(params);
            geometryStreamBuilder.appendGeometry(baseShape);
            geometryStreamBuilder.appendGeometry(verticalShape);
            geometryStreamBuilder.appendGeometry(baseRightShape);

            const geometryPartProps: GeometryPartProps = {
                classFullName: GeometryPart.classFullName,
                model: this._definitionModelId,
                code: GeometryPart.createCode(this._imodel, this._definitionModelId, name),
                geom: geometryStreamBuilder.geometryStream,
            };

            return this._imodel.elements.insertElement(geometryPartProps);

        }
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


    private insertGeometryPart = (name: string, primitive: SolidPrimitive): Id64String => {
        // console.log("inside the insertGeometryPart");
        // console.log('definitionModelId');
        // console.log(definitionModelId);
        // console.log('name');
        // console.log(name);
        // console.log('primitive');
        // console.log(primitive);
        const geometryStreamBuilder = new GeometryStreamBuilder();

        const params = new GeometryParams(this._categoryId, "t-shape");
        params.fillColor = ColorDef.fromTbgr(CategoryColor.FaceBracing);
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