import { IModelDb } from "@itwin/core-backend";
import { Id64String } from "@itwin/core-bentley";
import { GeometryStreamBuilder } from "@itwin/core-common";
import { Point3d, YawPitchRollAngles } from "@itwin/core-geometry";
import { convertInchToMeter, distanceBetweenPoint, getSlopeAngle } from "../../ConnectorUtils";
import { PlanBracingMemberGeometry } from "./Panel/PlanBracingMemberGeometry";
import { Diamond1XBracingGeometry } from "./Panel/PlanBracingTypes/Diamond1XBracingGeometry";


export class TowerPlanBracingGeometry {
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

    processPlanBracingTypes = (planBracingDetails: any) => {

        for (const planBracingIndex of Object.keys(planBracingDetails)) {
            const planBracing = planBracingDetails[planBracingIndex];

            const PlanBracingId = planBracing['ID'];
            const PlanBracingName = planBracing['Name'];
            const planBracingMembers = planBracing['Members'];

            this.processPlanBracingRawGeometry(planBracingMembers, PlanBracingId, PlanBracingName);


        }

    }

    private processPlanBracingRawGeometry = (planBracingMembers: any, PlanBracingId: any, PlanBracingName: any) => {
        console.log("inside processPlanBracingRawGeometry");
        for (const memberIndex of Object.keys(planBracingMembers)) {
            console.log(`for memberIndex: ${memberIndex}`);
            const member = planBracingMembers[memberIndex];

            console.log(`member`);
            console.log(JSON.stringify(member))

            const startNode = this.nodes.find((node: any) => {
                if (node["ID"] == member['StartNodeID']) {
                    return node;
                }
            });
            const endNode = this.nodes.find((node: any) => {
                if (node["ID"] == member['EndNodeID']) {
                    return node;
                }
            });
            const section = this.sections.find((section: any) => {
                if (section["ID"] == member['SectionID']) {
                    return section;
                }
            });

            console.log(`startNode`);
            console.log(JSON.stringify(startNode));
            console.log(`endNode`);
            console.log(JSON.stringify(endNode));
            console.log(`section`);
            console.log(JSON.stringify(section));

            const name = "Panel_Plan_Bracing_" + PlanBracingId + "_" + PlanBracingName + "_" + member['PanelPropertyID'] + "_" + member['ID'];
            console.log(`name => ${name}`);

            const planBracingMemberGeometry = new PlanBracingMemberGeometry(this._imodel, this._definitionModelId, this._categoryId);
            let planBracingMemberId = planBracingMemberGeometry.createGeometry(startNode, endNode, section, name);
            if (planBracingMemberId) {

                let length = Math.abs(distanceBetweenPoint(startNode, endNode));
                console.log(`length => ${length}`);

                let yawDegrees = 0;

                let pointA = Point3d.create(startNode['X'], startNode['Y'], startNode['Z']);
                let pointB = Point3d.create(endNode['X'], endNode['Y'], endNode['Z']);
                let pointC = Point3d.create(startNode['X'], startNode['Y'] + length, startNode['Z']);

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

                console.log(`_radians: ${_radians}`);

                yawDegrees = _radians;
                if (vectorab['x'] > vectorac['x']) {
                    yawDegrees = yawDegrees * -1;
                }
                console.log(`yawDegrees => ${yawDegrees}`)

                const startXSign = Math.sign(startNode['X']);
                const startYSign = Math.sign(startNode['Y']);

                let origin = new Point3d(startNode['X'] + ((convertInchToMeter(section['Thickness']) / 2) * startXSign), startNode['Y'] + ((convertInchToMeter(section['Thickness']) / 2) * startYSign), startNode['Z']);

                this._builder.appendGeometryPart3d(planBracingMemberId, origin, YawPitchRollAngles.createDegrees(yawDegrees, 0, 0));

            }


        }

    }

}