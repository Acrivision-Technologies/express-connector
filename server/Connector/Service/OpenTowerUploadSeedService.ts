

// https://imodelhubprodsa01.blob.core.windows.net/imodelhub-4f7d2bc1-ad4c-41a9-a1fc-25f71df374b8/temp-baseline-31db87f8-1d11-4c66-bbf3-c7bedb5461c3u.bim?sv=2019-07-07&sr=b&sig=gUPKrxbT%2BxkjkEkvOXmLLC2bbBC85CbbIvGl2yjKgO4%3D&st=2023-05-15T05%3A22%3A08.6151775Z&se=2023-05-15T05%3A43%3A56.6472366Z&sp=rw"


export class OpenTowerUploadSeedService {


    uploadIModelSeedFile = () => {
        return new Promise((resolve: any, reject: any) => {

            try {
                resolve("Done");
            } catch(e) {
                reject((e as any).message)
            }


        })
    }
}