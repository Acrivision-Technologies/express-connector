import * as path from "path";
import * as fs from "fs";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { BisCoreSchema, CreateNewIModelProps, IModelHost, IModelHostConfiguration, IModelJsFs, IModelJsFsStats } from "@itwin/core-backend";
import { BackendIModelsAccess } from "@itwin/imodels-access-backend";
import { RpcInterfaceDefinition } from "@itwin/core-common";
import getSupportedRpcs from "./Rpcs/rpcs";
import { ConnectorIModelCreationRpcImpl } from "./Rpcs/impls/ConnectorIModelCreationRpcImpl";
import { OpenTowerClient, IModelsClientOptions } from "./Connector/Clients/OpenTowerClient";

// import * as FormData from "form-data";

// console.log('FormData');
// console.log(FormData);

// {
//     "instance": {
//       "instanceId": "6428117c-dd4a-4417-ae9f-004a4a0343d9",
//       "schemaName": "iModelScope",
//       "className": "SeedFile",
//       "properties": {
//         "FileName": "temp-baseline-6428117c-dd4a-4417-ae9f-004a4a0343d9.bim",
//         "FileDescription": "Test",
//         "FileSize": 2222,
//         "FileId": "6428117c-dd4a-4417-ae9f-004a4a0343d9",
//         "Index": 0,
//         "iModelName": "2218_dummyTrial33.otxml",
//       }
//     }
//   }


// 
// const url = "https://imodelhubprodsa01.blob.core.windows.net/imodelhub-6428117c-dd4a-4417-ae9f-004a4a0343d9/temp-baseline-6428117c-dd4a-4417-ae9f-004a4a0343d9u.bim?sv=2019-07-07&sr=b&sig=ONJDQByckQSW57AR%2BvucwCSJsm4bazFU8fQn2jKdkrk%3D&st=2023-05-15T06%3A26%3A34.5628929Z&se=2023-05-15T06%3A49%3A41.7433985Z&sp=rw";
// const url = "https://imodelhubprodsa01.blob.core.windows.net/imodelhub-f489c4d9-5dce-454c-8be6-fae127c6acb9/temp-baseline-377ccd99-143f-4c42-b633-5b7c05699e32u.bim?sv=2019-07-07&sr=b&sig=EbzFAan4ycsrmm3MqGV7o17Twv9fx5X1xvWezcujrSY%3D&st=2023-05-15T08%3A27%3A56.6933159Z&se=2023-05-15T08%3A52%3A03.1092487Z&sp=rw";

const file = path.join(__dirname, "Connector/assets/temp-baseline-377ccd99-143f-4c42-b633-5b7c05699e32.bim");
// console.log("file exits");
// console.log(fs.existsSync(file));
// const fd = new FormData();
// const access = "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkJlbnRsZXlJTVNfMjAyMyIsInBpLmF0bSI6ImE4bWUifQ.eyJzY29wZSI6WyJpbW9kZWxodWIiXSwiY2xpZW50X2lkIjoiaW1vZGVsaHViLXN3YWdnZXIiLCJhdWQiOlsiaHR0cHM6Ly9pbXMuYmVudGxleS5jb20vYXMvdG9rZW4ub2F1dGgyIiwiaHR0cHM6Ly9pbXNvaWRjLmJlbnRsZXkuY29tL2FzL3Rva2VuLm9hdXRoMiIsImh0dHBzOi8vaW1zb2lkYy5iZW50bGV5LmNvbS9yZXNvdXJjZXMiLCJpbW9kZWwtaHViLXNlcnZpY2VzLTI0ODUiXSwic3ViIjoiNWRjODkxMzItNWY2My00MjZmLTlhOGYtMzI0ODhhNTlhZWU5IiwibmJmIjoxNjg0MTM1OTc5LCJzdWJqZWN0IjoiNWRjODkxMzItNWY2My00MjZmLTlhOGYtMzI0ODhhNTlhZWU5IiwidXNhZ2VfY291bnRyeV9pc28iOiJJTiIsImF1dGhfdGltZSI6MTY4NDEzNjI3OSwiaXNzIjoiaHR0cHM6Ly9pbXNvaWRjLmJlbnRsZXkuY29tIiwibmFtZSI6ImhpdGVzaC5tYWMyMDIyQGdtYWlsLmNvbSIsInByZWZlcnJlZF91c2VybmFtZSI6ImhpdGVzaC5tYWMyMDIyQGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJIaXRlc2giLCJmYW1pbHlfbmFtZSI6IkRpbmdhbmthciIsImVtYWlsIjoiaGl0ZXNoLm1hYzIwMjJAZ21haWwuY29tIiwic2lkIjoiVF9GaElsX0Zyd3IyS21CSXBsWU9EOU1fQl9ZLlNVMVRMVUpsYm5Sc1pYa3RVMGMuWWI5OC5YbkZNRzhkNEpkZ1lwZ0N6QTAzMkdCeWdHIiwiZXhwIjoxNjg0MTM5ODgwfQ.UdMgE3QPVsA7ixYAOefGFXqdU8fvgX__XY7Cr_m46fd8Glz2xJYfr26cMY7tqvqbptLns6W_IoA5-3JOtXheRGJSdAKIf9rFChnPiY9bVx9P-UuvQS5drb6kTnOxmi9UGroYw_6WRZ9ZgY7fWsf8poocj4kQOOreit-KI9RcLnx84LUUH4iYHCDz9lcc9ip8DNCqKJ5pTI6pPCZsU9KACA8aUzRZrJgjUT4x8eUJbHjE1lIQb9vYdchwFc1G1VWTLz4v_RNIe6t995UogOxcUVPsEISyGK3FI9pGYh88ZhbBj_jabmG2WPTR43qrrtTiPV22SkrPW1f2jYJKt_1qvg"
// console.log("file path ", file);
// fd.append("blob", fs.readFileSync(file))
// const headers = fd.getHeaders({ "x-ms-blob-type": "BlockBlob"})
// console.log(headers);

// console.log("file data");
// console.log(fs.readFileSync(file).byteLength)


// fs.stat(file, (err: any, stats: any)  => {
//     console.log('err');
//     console.log(err);
//     console.log('stats');
//     console.log(stats);
// })


// // console.log('fd');
// // console.log(fd);

// console.log('IModelJsFs.lstatSync(file)');
// console.log(IModelJsFs.lstatSync(file));

// axios.put(url, fd, {headers: headers })
//     .then((res: AxiosResponse) => {
//         console.log("response");
//         console.log(res);
//     })
//     .catch((error: AxiosError) => {
//         console.log("AxiosError");
//         console.log(error.response);
//     })




const config = new IModelHostConfiguration();
const options: IModelsClientOptions = {
    api: {
        baseUrl: "https://imodelhubapi.bentley.com",
        version: "sv1.1"
    }
}
const openTowerClient: OpenTowerClient = new OpenTowerClient(options);
config.hubAccess = new BackendIModelsAccess(openTowerClient);
config.cacheDir = path.join(__dirname, "iModelHostCache");

// const fd = new FormData();
// fd.set("test", "value");

// console.log('fd');
// console.log(fd);



// Start IModelHost
IModelHost.startup(config);

console.log( IModelHost.platform.DgnDb.getAssetsDir());

console.log(BisCoreSchema.schemaFilePath)
console.log('BisCoreSchema.schemaFilePath')

// Register Rpc impls
ConnectorIModelCreationRpcImpl.register();


// Start up the server
(
    async () => {

        console.log("backend first async call");
        // get platform-specific initialization function
        let init: (rpcs: RpcInterfaceDefinition[]) => void;
        init = (await import("./BackendServer")).default;
        // get RPCs supported by this backend
        const rpcs = getSupportedRpcs();
        // do initialize
        init(rpcs);
    }
)();