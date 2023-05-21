import * as fs from "fs";
import * as xmlJs from "xml-js";
import { transformNodeCoordinates } from "../../ConnectorUtils";


const collectNodes = (elements: any) => {
    console.log("collect nodes");
    // console.log(elements);

    const nodes: any = [];
    if (elements && elements.length > 0) {
        elements.forEach((element: any) => {
            // console.log(`element => ${JSON.stringify(element)}`);
            let elementAttributes = element['attributes'];
            // console.log(`elementAttributes: ${JSON.stringify(elementAttributes)}`)
            let transformedElementAttributes = transformNodeCoordinates(elementAttributes);
            // console.log(`transformedElementAttributes => ${JSON.stringify(transformedElementAttributes)}`)
            nodes.push(transformedElementAttributes);
        })
    }
    return nodes;
}

const collectHipBracingInfo = (elements: any) => {
    console.log("inside collectHipBracingInfo");
    // console.log(elements);

    const hipBracingInfo = elements.map((ele: any) => {
        let eleObject = { ...ele.attributes };
        return eleObject;
    })

    return hipBracingInfo;
}

const collectPlanBracingInfo = (elements: any) => {

    console.log(`collectPlanBracingInfo inside`);
    // console.log(JSON.stringify(elements));

    const planBracingInfo = elements.map((ele: any) => {
        let eleObject = { ...ele.attributes };
        eleObject['Members'] = [];
        ele.elements.map((childEle: any) => {
            eleObject['Members'].push({ ...childEle.attributes });
        })

        return eleObject;
    })

    return planBracingInfo;

}
const collectPanelFaceBracingInfo = (elements: any) => {

    console.log('collectPanelFaceBracingInfo elements');
    // console.log(JSON.stringify(elements));

    const faceBracingInfo = elements.map((ele: any) => {
        let eleObject = { ...ele.attributes }

        eleObject['Segment'] = [];

        const segmentsElements = ele['elements'][0].elements;
        // console.log(`segmentsElements`);
        // console.log(segmentsElements);
        segmentsElements.map((segmentElement: any) => {
            let segmentObject = { ...segmentElement.attributes };
            segmentObject['Members'] = [];
            segmentElement.elements.map((childele: any) => {
                segmentObject['Members'].push({ ...childele.attributes })
            });

            eleObject['Segment'].push(segmentObject);

        })

        return eleObject;
    });


    return faceBracingInfo;

}

const collectPanelLegInfo = (elements: any) => {

    console.log('collectPanelLegInfo elements');
    // console.log(elements);

    let legCollection = elements.map((ele: any) => {
        return { ...ele.attributes, ...ele.elements[0].attributes };
    });

    return legCollection;

}

export const importSourceData = (sourcePath: string) => {

    const fileContent = fs.readFileSync(sourcePath, "utf8");

    const xmlJSonData: any = JSON.parse(xmlJs.xml2json(fileContent));

    const outputJson: any = {};

    xmlJSonData.elements[0].elements.forEach((element: any) => {

        const elementName = element['name'];
        if (elementName === 'Panel') {
            // console.log(`elementName => ${elementName}`);
            // console.log(element);
            if (element.elements) {
                if (!outputJson[elementName]) {
                    outputJson[elementName] = [];
                }
                let eleObject: any = { ...element.attributes };
                element.elements.forEach((ele: any) => {

                    // console.log('---- ele');
                    // console.log(ele);

                    switch (ele.name) {
                        case 'Legs':
                            if (ele.elements)
                                eleObject[ele.name] = collectPanelLegInfo(ele.elements)
                            break;
                        case 'FaceBracingDetails':
                            if (ele.elements)
                                eleObject[ele.name] = collectPanelFaceBracingInfo(ele.elements)
                            break;

                        case 'PlanBracingDetails':
                            if (ele.elements)
                                eleObject[ele.name] = collectPlanBracingInfo(ele.elements)
                            break;

                        case 'HipBracingDetails':
                            if (ele.elements)
                                eleObject[ele.name] = collectHipBracingInfo(ele.elements)
                            break;
                    }
                })
                outputJson[elementName].push(eleObject);
            } else {
                if (!outputJson[elementName]) {
                    outputJson[elementName] = { ...element.attributes };
                }
            }
        } else if (elementName === 'MountPipes') {
            // console.log(`elementName => ${elementName}`);
            // console.log(element);
            if (element.elements) {

                if (!outputJson[elementName]) {
                    outputJson[elementName] = [];
                }
                element.elements.forEach((ele: any) => {

                    outputJson[elementName].push(...ele.elements);

                })
            }
        } else if (elementName === 'Nodes') {

            const nodes = collectNodes(element.elements);

            outputJson[elementName] = nodes;

        }
        else if (elementName === 'MountNodes') {

            const nodes = collectNodes(element.elements);

            outputJson[elementName] = nodes;

        }
        else if (elementName === 'AntennaNodes') {

            const nodes = collectNodes(element.elements);

            outputJson[elementName] = nodes;

        }
        else if (elementName === 'AppurtenanceNodes') {

            const nodes = collectNodes(element.elements);

            outputJson[elementName] = nodes;

        }
        else if (elementName === 'AttachmentNodes') {

            const nodes = collectNodes(element.elements);

            outputJson[elementName] = nodes;

        } else {
            if (element.elements) {
                if (!outputJson[elementName]) {
                    outputJson[elementName] = [];
                }
                element.elements.forEach((ele: any) => {
                    let eleObject: any = { ...ele.attributes };
                    if (ele.elements) {
                        eleObject["elements"] = [];
                        ele.elements.forEach((ele: any) => {
                            eleObject["elements"].push({ ...ele.attributes });
                        })
                    }
                    outputJson[elementName].push(eleObject);
                })
            } else {
                if (!outputJson[elementName]) {
                    outputJson[elementName] = { ...element.attributes };
                }
            }

        }

    });

    return outputJson;

}