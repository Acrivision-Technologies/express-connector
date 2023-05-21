import { IModelDb } from "@itwin/core-backend";
import { Id64String } from "@itwin/core-bentley";
import { GeometryStreamBuilder } from "@itwin/core-common";
import { Point3d, YawPitchRollAngles } from "@itwin/core-geometry";
import { convertInchToMeter, distanceBetweenPoint, getSlopeAngle } from "../../ConnectorUtils";
import { FaceBracingSegmentMemberGeometry } from "./Panel/FaceBracingSegmentMemberGeometry";
import { DoubleKBracingGeometry } from "./Panel/FaceBracingTypes/DoubleKBracingGeometry";


export class TowerFaceBracingGeometry {

    constructor(
        protected readonly _builder: GeometryStreamBuilder,
        protected readonly _imodel: IModelDb,
        protected readonly _definitionModelId: Id64String,
        protected readonly _categoryId: any,
        protected readonly nodes: any,
        protected readonly sections: any,
    ) {
        // this._builder = new PolyfaceBuilder();
    }

    processFaceBracingTypes = (faceBracingDetails: any) => {

        for (const barcingIndex of Object.keys(faceBracingDetails)) {

            console.log(`for panelFaceBracing barcingIndex : ${barcingIndex}`);

            const panelFaceBracing = faceBracingDetails[barcingIndex];
            // console.log('panelFaceBracing');
            // console.log(JSON.stringify(panelFaceBracing));;

            const FaceBracingID = panelFaceBracing['ID'];
            const FaceBracingName = panelFaceBracing['Name'];
            const panelFaceBracingSegment = panelFaceBracing['Segment'];
            if (panelFaceBracingSegment) {
                for (const segmentIndex of Object.keys(panelFaceBracingSegment)) {
                    const segment = panelFaceBracingSegment[segmentIndex];
                    const SegmentID = segment['ID'];
                    const SegmentName = segment['Name'];
                    const segmentMembers = segment['Members'];

                    console.log(`SegmentName => ${SegmentName}`);

                    this.processFaceBracingRawGeometry(segmentMembers, FaceBracingID, FaceBracingName, SegmentID, SegmentName)

                }
            }

        }

    }

    private processFaceBracingRawGeometry = (segmentMembers: any, FaceBracingID: any, FaceBracingName: any, SegmentID: any, SegmentName: any) => {

        console.log("inside processFaceBracingRawGeometry")

        for (const segmentMemberIndex of Object.keys(segmentMembers)) {
            console.log(`for segmentMemberIndex: ${segmentMemberIndex}`);

            const segmentMember = segmentMembers[segmentMemberIndex];
            console.log('segmentMember');
            console.log(segmentMember);

            // console.log(`segmentMember`);
            // console.log(JSON.stringify(segmentMember))

            const startNode = this.nodes.find((node: any) => {
                if (node["ID"] == segmentMember['StartNodeID']) {
                    return node;
                }
            });
            const endNode = this.nodes.find((node: any) => {
                if (node["ID"] == segmentMember['EndNodeID']) {
                    return node;
                }
            });
            const section = this.sections.find((section: any) => {
                if (section["ID"] == segmentMember['SectionID']) {
                    return section;
                }
            });

            const name = "Panel_Face_Bracing_" + FaceBracingID + "_" + FaceBracingName + "_" + SegmentID + "_" + SegmentName + "_" + segmentMember['ID'];
            console.log(`name => ${name}`);
            // let legShapeID = this.insertGeometryPart(name, legShape);
            const faceBracingSegmentMemberGeometry = new FaceBracingSegmentMemberGeometry(this._imodel, this._definitionModelId, this._categoryId);
            let faceBracingSegmentMemberId = faceBracingSegmentMemberGeometry.createGeometry(startNode, endNode, section, name, segmentMember['MemberTag']);

            console.log(`faceBracingSegmentMemberId => ${faceBracingSegmentMemberId}`)

            if (faceBracingSegmentMemberId) {
                if (segmentMember['MemberTag'] === 'DIAGONAL') {
                    this._builder.appendGeometryPart3d(faceBracingSegmentMemberId);
                } else {
                    const startXSign = Math.sign(startNode['X']) == 0 ? 1 : Math.sign(startNode['X']);
                    const startYSign = Math.sign(startNode['Y']) == 0 ? 1 : Math.sign(startNode['Y']);
                    const endXSign = Math.sign(endNode['X']) == 0 ? 1 : Math.sign(endNode['X']);
                    const endYSign = Math.sign(endNode['Y']) == 0 ? 1 : Math.sign(endNode['Y']);
                    const zIndexDifferece = endNode['Z'] - startNode['Z'];
                    console.log(`zIndexDifferece => ${zIndexDifferece}`)



                    let rotateDegree = 0;
                    let yawDegrees = 0;


                    let length = Math.abs(distanceBetweenPoint(startNode, endNode));
                    console.log(`**** length => ${length}`);
                    // rotateDegree Calculation
                    let pointA = Point3d.create(startNode['X'], startNode['Y'], startNode['Z']);
                    let pointB = Point3d.create(endNode['X'], endNode['Y'], endNode['Z']);
                    let pointC = Point3d.create(startNode['X'], startNode['Y'] + length, startNode['Z']);

                    if (zIndexDifferece != 0) {
                        pointB = Point3d.create(endNode['X'], endNode['Y'], startNode['Z']);
                    }

                    console.log('pointA');
                    console.log(pointA);
                    console.log('pointB');
                    console.log(pointB);
                    console.log('pointC');
                    console.log(pointC);

                    const vectorab = pointA.vectorTo(pointB);
                    console.log('vectorab');
                    console.log(vectorab);

                    const vectorac = pointA.vectorTo(pointC);
                    console.log('vectorac');
                    console.log(vectorac);

                    const result: any = vectorab.angleTo(vectorac);
                    let _radians = 0;
                    if (result) {
                        _radians = result['_radians'] * 180 / Math.PI;
                    }

                    console.log(`_radians: ${_radians}`)

                    yawDegrees = _radians;
                    // if (slopeDegree === 0 && Math.abs(slopeDegree) === 1 && yawDegrees == 90) {
                    //     yawDegrees = -90;
                    // }

                    if (vectorab['x'] > vectorac['x']) {
                        yawDegrees = yawDegrees * -1;
                    }

                    if (zIndexDifferece != 0) {

                        // rotateDegree Calculation
                        const pointD = Point3d.create(endNode['X'], endNode['Y'], endNode['Z']);
                        console.log('pointD');
                        console.log(pointD);

                        const vectorplanerab = pointA.vectorTo(pointB);
                        console.log('vectorplanerab');
                        console.log(vectorplanerab);

                        const vectorVerticalad = pointA.vectorTo(pointD);
                        console.log('vectorVerticalad');
                        console.log(vectorVerticalad);

                        const result: any = vectorplanerab.angleTo(vectorVerticalad);
                        let _radians = 0;
                        if (result) {
                            _radians = result['_radians'] * 180 / Math.PI;
                        }

                        rotateDegree = _radians;
                    }

                    rotateDegree = rotateDegree * Math.sign(zIndexDifferece)

                    console.log('===> yawDegrees : ', yawDegrees);
                    // yawDegrees = 0;
                    console.log('===> rotateDegree : ', rotateDegree);
                    // rotateDegree = 0;

                    // degree = 0;
                    let origin = new Point3d(startNode['X'], startNode['Y'], startNode['Z']);

                    console.log(`startXSign => ${startXSign}`)
                    console.log(`startYSign => ${startYSign}`)
                    console.log(`endXSign => ${endXSign}`)
                    console.log(`endYSign => ${endYSign}`)


                    // For L-Shape
                    origin = new Point3d(startNode['X'] + ((convertInchToMeter(section['Thickness']) / 2) * startXSign), startNode['Y'] + ((convertInchToMeter(section['Thickness']) / 2) * startYSign), startNode['Z']);
                    this._builder.appendGeometryPart3d(faceBracingSegmentMemberId, origin, YawPitchRollAngles.createDegrees(yawDegrees, 0, rotateDegree));
                }
            }
        }

    }
}