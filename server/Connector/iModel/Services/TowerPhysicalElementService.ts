import { Subject, SubjectOwnsSubjects } from "@itwin/core-backend";
import { SubjectProps } from "@itwin/core-common";
import { queryDefinitionModel, queryPhysicalModel, queryTowerInformationGroup } from "./ConnectorGroupModelService";
import { TowerAntennaPropertyPhysicalElementService } from "./TowerAntennaPropertyPhysicalElementService";
import { TowerAppurtenancePropertyPhysicalElementService } from "./TowerAppurtenancePropertyPhysicalElementService";
import { TowerAttachmentPropertyPhysicalElementService } from "./TowerAttachmentPropertyPhysicalElementService";
import { TowerMountPipePropertyPhysicalElementService } from "./TowerMountPipePropertyPhysicalElementService";
import { TowerMountPropertyPhysicalElementService } from "./TowerMountPropertyPhysicalElementService";
import { TowerPanelPhysicalElementService } from "./TowerPanelPhysicalElementService";
import { TowerPolePropertyPhysicalElementService } from "./TowerPolePropertyPhysicalElementService";


export class TowerPhysicalElementService {

    private synchronizer: any;
    private jobSubject: any;
    private repositoryLinkId: any;
    private repositoryModelId: any;
    private data: any;
    private towerName: string;
    private definitaionModelId: string | undefined;
    private physicalModelId: string | undefined;


    constructor(synchronizer: any, jobSubject: any, repositoryLinkId: any, data: any, repositoryModelId: any) {
        this.synchronizer = synchronizer;
        this.jobSubject = jobSubject;
        this.repositoryLinkId = repositoryLinkId;
        this.repositoryModelId = repositoryModelId;
        this.data = data;
        this.towerName = this.data['TowerInformation']["TowerName"];

        this.definitaionModelId = queryDefinitionModel(this.synchronizer, this.jobSubject);
        this.physicalModelId = queryPhysicalModel(this.synchronizer, this.jobSubject);
    }


    processTowerPanelProperties = () => {
        if (this.data['PanelProperties']) {

            console.log("inside processTowerPanelProperties")


            // const panelSubject = this.createPanelsSubject();

            // console.log('**************************** panelSubject');
            // console.log(panelSubject);

            console.log("Object.keys(this.data['PanelProperties'])");
            console.log(Object.keys(this.data['PanelProperties']));

            for (const panelIndex of Object.keys(this.data['PanelProperties'])) {

                console.log(`panelIndex => ${panelIndex}`);

                const panelProperty = this.data["PanelProperties"][panelIndex];
                console.log(`panelProperty`);
                console.log(JSON.stringify(panelProperty));

                console.log(`panelProperty panelID => ${panelProperty['PanelID']}`)
                const definitaionModelId = queryDefinitionModel(this.synchronizer, this.jobSubject);
                const physicalModelId = queryPhysicalModel(this.synchronizer, this.jobSubject);
                const towerInformationGroupId = queryTowerInformationGroup(this.synchronizer, this.jobSubject);

                const towerPanelPhysicalElements = new TowerPanelPhysicalElementService(this.synchronizer, this.jobSubject, panelProperty, this.data['Nodes'], this.data['Sections'], this.repositoryLinkId, definitaionModelId, physicalModelId);
                const panel = this.data['Panel'].find((panel: any) => {
                    if (panel['ID'] == panelProperty['PanelID']) {
                        return panel;
                    }
                });

                console.log('panel');
                console.log(JSON.stringify(panel));
                towerPanelPhysicalElements.processPanelPhysicalElementCreation(panel);
                console.log("Panel Done")

            }
        } else {
            console.log(`PanelProperties not found in sourceData`);
        }
    }

    processTowerMounts = () => {
        if (this.data['MountProperties']) {

            for (const mountPropertyIndex of Object.keys(this.data['MountProperties'])) {

                console.log(`mountPropertyIndex => ${mountPropertyIndex}`);

                const mountProperty = this.data["MountProperties"][mountPropertyIndex];

                console.log(`mountProperty id => ${mountProperty['ID']}`)
                const definitaionModelId = queryDefinitionModel(this.synchronizer, this.jobSubject);
                const physicalModelId = queryPhysicalModel(this.synchronizer, this.jobSubject);

                const mount = this.data["Mounts"].find((mount: any) => {
                    console.log(`mount["ID"] => ${mount["ID"]}`);
                    console.log(`mountProperty["ID"] => ${mountProperty["ID"]}`)
                    if (mount["ID"] == mountProperty["ID"]) {
                        return mount['elements']
                    }
                });
                console.log('---- mount');
                console.log(JSON.stringify(mount));

                if (mount) {
                    const towerMountPropertyPhysicalElement = new TowerMountPropertyPhysicalElementService(this.synchronizer, this.jobSubject, this.repositoryLinkId, definitaionModelId, physicalModelId, mountProperty, this.data['MountNodes'], this.data['Sections'])
                    towerMountPropertyPhysicalElement.processMount(mount)
                }


            }

        }
    }

    processTowerMountPipes = () => {
        if (this.data['MountPipeProperties']) {

            for (const mountPipePropertyIndex of Object.keys(this.data['MountPipeProperties'])) {

                console.log(`mountPipePropertyIndex => ${mountPipePropertyIndex}`);
                const mountPipeProperty = this.data["MountPipeProperties"][mountPipePropertyIndex];

                console.log(`mountPipePropertyIndex id => ${mountPipeProperty['ID']}`)
                const definitaionModelId = queryDefinitionModel(this.synchronizer, this.jobSubject);
                const physicalModelId = queryPhysicalModel(this.synchronizer, this.jobSubject);

                const pipes: any[] = [];

                this.data["MountPipes"].find((mountPipe: any) => {
                    if (mountPipe.attributes["MountPipePropertyID"] == mountPipeProperty["ID"]) {
                        pipes.push(mountPipe.attributes);
                    }
                });
                console.log('---- pipes');
                console.log(JSON.stringify(pipes));

                if (pipes) {
                    const towerMountPropertyPhysicalElement = new TowerMountPipePropertyPhysicalElementService(this.synchronizer, this.jobSubject, this.repositoryLinkId, definitaionModelId, physicalModelId, mountPipeProperty, this.data['MountNodes'], this.data['Sections'])
                    towerMountPropertyPhysicalElement.processMountPipes(pipes)
                }


            }

        }

    }

    processTowerAntennas = (noOfLegs: any) => {
        if (this.data['AntennaProperties']) {
            console.log("----------------------------- process AntennaProperties otmxl")
            console.log("noOfLegs: ", noOfLegs)
            for (const antennaIndex of Object.keys(this.data['AntennaProperties'])) {
                console.log(`antennaIndex => ${antennaIndex}`);
                const antennaProperty = this.data['AntennaProperties'][antennaIndex];
                console.log(`AntennaPropertyIndex id => ${antennaProperty['ID']}`)
                const definitaionModelId = queryDefinitionModel(this.synchronizer, this.jobSubject);
                const physicalModelId = queryPhysicalModel(this.synchronizer, this.jobSubject);

                const antennaElement = this.data['Antennas'].filter((antennaElement: any) => {
                    if (antennaElement['elements']) {
                        if (antennaElement['elements'][0]['AntennaPropertyID'] == antennaProperty['ID']) {
                            return antennaElement;
                        }
                    }
                });

                if (antennaElement.length > 0) {

                    const MountProperty = this.data['MountProperties'].find((mountProperty: any) => {
                        return mountProperty['ID'] === antennaElement[0]['elements'][0]['MountID'];
                    });

                    console.log('---- antennaElement');
                    console.log(JSON.stringify(antennaElement));

                    console.log('MountProperty');
                    console.log(MountProperty);

                    console.log(`noOfLegs => ${noOfLegs}`);

                    let antennaAzmith = 0;
                    if (MountProperty) {
                        const Location = MountProperty['Location'];
                        const Azimuth = MountProperty['Azimuth'] * 1;


                        let legLocation = 0;
                        if (noOfLegs == 3) {
                            if (Location === 'LegA') {
                                legLocation = 60;

                            } else if (Location === 'LegB') {
                                legLocation = 180; // 45 + 90;
                            } else if (Location === 'LegC') {
                                legLocation = 300; // 45 + 90 + 90;
                            }
                        } else {
                            if (Location === 'LegA') {
                                legLocation = 45;

                            } else if (Location === 'LegB') {
                                legLocation = 135; // 45 + 90;
                            } else if (Location === 'LegC') {
                                legLocation = 225; // 45 + 90 + 90;
                            } else if (Location === 'LegD') {
                                legLocation = 315; // 45 + 90 + 90 + 90;
                            }
                        }

                        console.log(`legLocation => ${legLocation}`);

                        const antennaAzmith = (legLocation + Azimuth) * -1;

                        console.log(`antennaAzmith -> ${antennaAzmith}`);
                        antennaProperty['antennaAzmith'] = antennaAzmith;
                    } else {
                        antennaProperty['antennaAzmith'] = antennaProperty['Azimuth'];
                    }

                    console.log("antennaProperty['antennaAzmith']: ", antennaProperty['antennaAzmith'])

                    if (antennaElement) {
                        const towerAntennaPropertyPhysicalElement = new TowerAntennaPropertyPhysicalElementService(this.synchronizer, this.jobSubject, this.repositoryLinkId, definitaionModelId, physicalModelId, antennaProperty, this.data['AntennaNodes'], this.data['Sections'])
                        towerAntennaPropertyPhysicalElement.processAntennas(antennaElement)

                    }
                }

            }

        }
    }

    processTowerAttachments = () => {

        if (this.data['AttachmentProperties']) {

            for (const attachmentPropertyIndex of Object.keys(this.data['AttachmentProperties'])) {
                console.log("AttachmentNodes");
                console.log(this.data['AttachmentNodes'])
                const attachmentProperty = this.data['AttachmentProperties'][attachmentPropertyIndex];
                const attahcment = this.data['Attachments'].find((attachment: any) => {
                    if (attachment['ID'] == attachmentProperty['ID']) {
                        return attachment;
                    }
                });

                console.log('attachmentProperty');
                console.log(attachmentProperty);
                if (attahcment && attahcment.elements) {

                    console.log('attahcment');
                    console.log(attahcment);

                    const towerAttachmentPropertyPhysicalElement = new TowerAttachmentPropertyPhysicalElementService(this.synchronizer, this.jobSubject, this.repositoryLinkId, this.definitaionModelId, this.physicalModelId, attachmentProperty, this.data['AttachmentNodes'], this.data['Sections'])
                    towerAttachmentPropertyPhysicalElement.processAttachment(attahcment)


                }
            }

        }

    }

    processTowerAppurtenances = () => {
        if (this.data['AppurtenanceProperties'] && this.data['AppurtenanceProperties'].length > 0) {


            const appurtenanceSections = this.data["LinearAppurtenancesSections"].filter((section: any) => section["ID"]);

            for (const appurtenancePropertyIndex of Object.keys(this.data['AppurtenanceProperties'])) {
                const appurtenanceProperty = this.data['AppurtenanceProperties'][appurtenancePropertyIndex];
                const appurtenance = this.data['Appurtenances'].find((appurtenance: any) => {
                    if (appurtenance['ID'] == appurtenanceProperty['ID']) {
                        return appurtenance;
                    }
                });

                console.log('appurtenanceProperty');
                console.log(appurtenanceProperty);
                if (appurtenance && appurtenance.elements) {

                    console.log('appurtenance');
                    console.log(appurtenance);

                    const towerAppurtenancePropertyPhysicalElement = new TowerAppurtenancePropertyPhysicalElementService(this.synchronizer, this.jobSubject, this.repositoryLinkId, this.definitaionModelId, this.physicalModelId, appurtenanceProperty, this.data['AppurtenanceNodes'], appurtenanceSections)
                    towerAppurtenancePropertyPhysicalElement.processAppurtenance(appurtenance)


                }
            }
        }

    }

    processTowerPoles = () => {
        if (this.data['PoleProperties']) {
            for (const polePropertyIndex of Object.keys(this.data['PoleProperties'])) {
                const poleProperty = this.data['PoleProperties'][polePropertyIndex];
                const pole = this.data['Pole'].find((pole: any) => {
                    console.log("inside pole");
                    console.log(pole);
                    if (pole['PolePropertyID'] == poleProperty['PoleID']) {
                        return pole;
                    }
                });

                console.log('poleProperty');
                console.log(poleProperty);
                console.log('pole');
                console.log(pole);
                if (pole) {

                    console.log('pole');
                    console.log(pole);

                    const towerPolePropertyPhysicalElementService = new TowerPolePropertyPhysicalElementService(this.synchronizer, this.jobSubject, this.repositoryLinkId, this.definitaionModelId, this.physicalModelId, poleProperty, this.data['Nodes'], this.data['Sections'])
                    towerPolePropertyPhysicalElementService.processPole(pole);


                }

            }

        }
    }

}