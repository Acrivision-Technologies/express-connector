import { ColorByName } from "@itwin/core-common";

export const Config = {
    "connectorArgs": {
        "version": "0.0.1",
        "jobArgs": {
            "source": "879316_SA_lattice.xml",
            "stagingDir": __dirname,
            "doInteractiveSignin": false,
            "dbType": "briefcase",
            "jobSubjectName": "TowerConnector_JobSubject"
        },
        "hubArgs": {
            "projectGuid": "c50bd02f-7cb3-44c5-8708-a295907b3e21",
            "iModelGuid": "",
            "tokenCallbackUrl": "http://localhost:4001/connector/signin-callback",
            "region": 0,
            "doInteractiveSignIn": true,
            "clientConfig": {
                "clientId": "native-A5fBUJvryEnQwCjemnjmSZfRU",
                "redirectUri": "http://localhost:3000/signin-callback",
                "scope": "projects:read issues:read validation:modify issues:modify validation:read forms:read changedelements:read clashdetection:modify forms:modify mesh-export:read export:read synchronization:modify synchronization:read mesh-export:modify export:modify transformations:modify email openid profile organization itwinjs imodelaccess:read transformations:read clashdetection:read changedelements:modify insights:modify itwins:modify projects:modify users:read sensor-data:read sensor-data:modify savedviews:modify imodels:modify storage:modify storage:read savedviews:read library:modify realitydata:read library:read imodels:read realitydata:modify webhooks:read webhooks:modify realityconversion:modify realitydataanalysis:read realitydataanalysis:modify realityconversion:read contextcapture:read contextcapture:modify insights:read designelementclassification:read itwins:read designelementclassification:modify"
            }
            // spa doesn't works
            // "clientConfig": {
            //     "clientId": "spa-pgI3wzxG0n1et2Yr8ONmPMVhh",
            //     "redirectUri": "http://localhost:3000/signin-callback",
            //     "scope": "forms:modify clashdetection:modify changedelements:read forms:read issues:modify mesh-export:read validation:modify issues:read clashdetection:read validation:read export:read synchronization:modify synchronization:read mesh-export:modify export:modify transformations:modify email openid profile organization itwinjs imodelaccess:read transformations:read itwins:read changedelements:modify designelementclassification:read projects:read itwins:modify projects:modify users:read sensor-data:read sensor-data:modify savedviews:modify imodels:modify storage:modify storage:read savedviews:read library:modify realitydata:read library:read imodels:read realitydata:modify webhooks:read webhooks:modify realityconversion:modify realitydataanalysis:read realitydataanalysis:modify realityconversion:read contextcapture:read contextcapture:modify insights:read insights:modify designelementclassification:modify"
            // }
            // old
            // "clientConfig": {
            //     "clientId": "native-yDBfQWn98vK8ZkvxI9R2xjDvN",
            //     "redirectUri": "http://localhost:3000/signin-callback",
            //     "scope": "clashdetection:read issues:read validation:modify issues:modify validation:read mesh-export:modify export:modify transformations:modify synchronization:modify transformations:read export:read changedelements:modify synchronization:read email openid profile organization itwinjs imodelaccess:read mesh-export:read projects:modify forms:read clashdetection:modify projects:read itwins:read users:read savedviews:read library:modify realitydata:modify realitydata:read library:read imodels:read savedviews:modify imodels:modify itwins:modify storage:modify webhooks:modify webhooks:read contextcapture:read contextcapture:modify designelementclassification:read insights:modify realitydataanalysis:read realitydataanalysis:modify insights:read designelementclassification:modify changedelements:read storage:read forms:modify"
            // }

            // "clientConfig": {
            //     "clientId": "service-HiYv58kma6hjWzXvCGLN145yO",
            //     "clientSecret": "VJae5UXC31WA8rVDsLFN4TmZrX3jTRoGHp+vnoN5aEU0IZXC3KgmxvG2a9f9jiTFjTH9GlhMuBHpQ4t4NVos3A==",
            //     "scope": "mesh-export:read forms:modify clashdetection:modify changedelements:read issues:modify validation:read export:read validation:modify forms:read transformations:read export:modify synchronization:modify mesh-export:modify itwins:read transformations:modify itwinjs imodelaccess:read synchronization:read projects:read issues:read designelementclassification:modify itwins:modify projects:modify users:read sensor-data:read sensor-data:modify savedviews:modify imodels:modify storage:modify storage:read savedviews:read library:modify realitydata:read changedelements:modify library:read realitydata:modify webhooks:read webhooks:modify realityconversion:modify realitydataanalysis:read realitydataanalysis:modify realityconversion:read contextcapture:read contextcapture:modify insights:read designelementclassification:read insights:modify imodels:read clashdetection:read"
            // }
            
            // Web app
            // "clientConfig": {
            //     "clientId": "webapp-ExkwSrqRSLngAg3wzP8DLLdBn",
            //     "clientSecret": "cQQOYp5s1pnMXHI5MbsKVd4tmPSGX23c2CY90zYdv64Pitj6MHxPbRvZsu+RquJbuMkDGCZcJm9amN/fUCzAsg==",
            //     "scope": "issues:read validation:modify issues:modify validation:read forms:read changedelements:read clashdetection:modify forms:modify mesh-export:read export:read transformations:read synchronization:modify itwins:read mesh-export:modify export:modify transformations:modify itwinjs imodelaccess:read synchronization:read projects:read clashdetection:read insights:modify itwins:modify projects:modify users:read sensor-data:read sensor-data:modify savedviews:modify imodels:modify storage:modify storage:read savedviews:read library:modify designelementclassification:modify realitydata:read imodels:read realitydata:modify webhooks:read webhooks:modify realityconversion:modify realitydataanalysis:read realitydataanalysis:modify realityconversion:read contextcapture:read contextcapture:modify insights:read designelementclassification:read library:read changedelements:modify"
            // }
        }
    },
    "iModelName": "2:879316_SA_lattice",
    "iModelDescription": "2:879316_SA_lattice",
}