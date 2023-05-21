export type OpenTowerIModelCreateDto = {
    "instance": {
        "schemaName": string,
        "className": string,
        "properties": {
            "Name": string;
            "Description": string;
            // "UserCreated": string;
            // "CreatedDate": string;
            // "DataLocationId": string;
            "Initialized": boolean;
            "Type": number,
            "Extent": [
                number,
                number,
                number,
                number
            ],
            "Secured": boolean,
            "Shared": boolean
        }
    }
}