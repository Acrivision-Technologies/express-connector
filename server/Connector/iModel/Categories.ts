import { ColorByName } from "@itwin/core-common";

export enum Categories {
    Panels =  "Panels",
    Legs = "Legs",
    FaceBracing = "FaceBracing",
    PlanBracing = "PlanBracing",
    Mounts = "Mounts",
    Attachments = "Attachments",
    Appurtenances = "Appurtenances",
    Poles = "Poles",
}

export enum CategoryColor {
    Panels = ColorByName.silver,
    Legs = ColorByName.silver,
    FaceBracing = ColorByName.silver,
    PlanBracing = ColorByName.silver,
    Mounts = ColorByName.yellow,
    MountPipes = ColorByName.orange,
    Antenna = ColorByName.blue,
    Attachment = ColorByName.red,
    Appurtenance = ColorByName.green,
    Poles = ColorByName.lightSteelBlue,
}