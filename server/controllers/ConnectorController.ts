import { mainExecution } from '../Connector/Main';
import { getLogger } from '../utils/loggers';
const logger = getLogger('CONNECTOR_CONTROLLER');

export interface CreateIModelRequestParam {
    filename: string;
    iModelName: string;
    accessToekn: string;
    iTwinId: string;
}

export class ConnectorController {

    public static processIModelCreationRequest(requestBody : CreateIModelRequestParam): Promise<any> {
        console.log("inside ======= processIModelCreationRequest");
        console.log('__dirname');
        console.log(__dirname);
        return new Promise(async (resolve: any, reject: any) => {
            logger.info(`processIModelCreationRequest: requestBody: ${JSON.stringify(requestBody)}`);
            try {
                mainExecution(requestBody.filename, requestBody.iModelName, requestBody.accessToekn, requestBody.iTwinId)
                    .then((iModelGuid: any) => {
                        resolve(iModelGuid)
                    })
                    .catch((error: any) => {
                        reject(error)
                    })
            } catch(e) {
                reject(e)
            }
        })
    }

}

