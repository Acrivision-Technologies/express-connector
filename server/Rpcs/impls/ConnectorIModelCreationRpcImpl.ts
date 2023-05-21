import { RpcManager, IModelRpcProps } from "@itwin/core-common";
import { ConnectorIModelCreationInterface } from "../interfaces/ConnectorIModelCreationInterface";
import { getLogger } from '../../utils/loggers';
import { ConnectorController, CreateIModelRequestParam } from "../../controllers/ConnectorController";
const logger = getLogger('CONNECTOR_RPC_IMPL');

const defaultAccessToken = "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IkJlbnRsZXlJTVNfMjAyMyIsInBpLmF0bSI6ImE4bWUifQ.eyJzY29wZSI6WyJjbGFzaGRldGVjdGlvbjpyZWFkIiwiaXNzdWVzOnJlYWQiLCJ2YWxpZGF0aW9uOm1vZGlmeSIsImlzc3Vlczptb2RpZnkiLCJ2YWxpZGF0aW9uOnJlYWQiLCJtZXNoLWV4cG9ydDptb2RpZnkiLCJleHBvcnQ6bW9kaWZ5IiwidHJhbnNmb3JtYXRpb25zOm1vZGlmeSIsInN5bmNocm9uaXphdGlvbjptb2RpZnkiLCJ0cmFuc2Zvcm1hdGlvbnM6cmVhZCIsImV4cG9ydDpyZWFkIiwiY2hhbmdlZGVsZW1lbnRzOm1vZGlmeSIsInN5bmNocm9uaXphdGlvbjpyZWFkIiwiZW1haWwiLCJvcGVuaWQiLCJwcm9maWxlIiwib3JnYW5pemF0aW9uIiwiaXR3aW5qcyIsImltb2RlbGFjY2VzczpyZWFkIiwibWVzaC1leHBvcnQ6cmVhZCIsInByb2plY3RzOm1vZGlmeSIsImZvcm1zOnJlYWQiLCJjbGFzaGRldGVjdGlvbjptb2RpZnkiLCJwcm9qZWN0czpyZWFkIiwiaXR3aW5zOnJlYWQiLCJ1c2VyczpyZWFkIiwic2F2ZWR2aWV3czpyZWFkIiwibGlicmFyeTptb2RpZnkiLCJyZWFsaXR5ZGF0YTptb2RpZnkiLCJyZWFsaXR5ZGF0YTpyZWFkIiwibGlicmFyeTpyZWFkIiwiaW1vZGVsczpyZWFkIiwic2F2ZWR2aWV3czptb2RpZnkiLCJpbW9kZWxzOm1vZGlmeSIsIml0d2luczptb2RpZnkiLCJzdG9yYWdlOm1vZGlmeSIsIndlYmhvb2tzOm1vZGlmeSIsIndlYmhvb2tzOnJlYWQiLCJjb250ZXh0Y2FwdHVyZTpyZWFkIiwiY29udGV4dGNhcHR1cmU6bW9kaWZ5IiwiZGVzaWduZWxlbWVudGNsYXNzaWZpY2F0aW9uOnJlYWQiLCJpbnNpZ2h0czptb2RpZnkiLCJyZWFsaXR5ZGF0YWFuYWx5c2lzOnJlYWQiLCJyZWFsaXR5ZGF0YWFuYWx5c2lzOm1vZGlmeSIsImluc2lnaHRzOnJlYWQiLCJkZXNpZ25lbGVtZW50Y2xhc3NpZmljYXRpb246bW9kaWZ5IiwiY2hhbmdlZGVsZW1lbnRzOnJlYWQiLCJzdG9yYWdlOnJlYWQiLCJmb3Jtczptb2RpZnkiLCJvZmZsaW5lX2FjY2VzcyJdLCJjbGllbnRfaWQiOiJuYXRpdmUteURCZlFXbjk4dks4Wmt2eEk5UjJ4akR2TiIsImF1ZCI6WyJodHRwczovL2ltcy5iZW50bGV5LmNvbS9hcy90b2tlbi5vYXV0aDIiLCJodHRwczovL2ltc29pZGMuYmVudGxleS5jb20vYXMvdG9rZW4ub2F1dGgyIiwiaHR0cHM6Ly9pbXNvaWRjLmJlbnRsZXkuY29tL3Jlc291cmNlcyIsImJlbnRsZXktYXBpLW1hbmFnZW1lbnQiLCJpdHdpbmpzLXNlcnZpY2VzIl0sInN1YiI6IjVkYzg5MTMyLTVmNjMtNDI2Zi05YThmLTMyNDg4YTU5YWVlOSIsIm5iZiI6MTY4MjYyMjQ1NCwic3ViamVjdCI6IjVkYzg5MTMyLTVmNjMtNDI2Zi05YThmLTMyNDg4YTU5YWVlOSIsInVzYWdlX2NvdW50cnlfaXNvIjoiSU4iLCJhdXRoX3RpbWUiOjE2ODI2MjI3NTQsImlzcyI6Imh0dHBzOi8vaW1zLmJlbnRsZXkuY29tIiwibmFtZSI6ImhpdGVzaC5tYWMyMDIyQGdtYWlsLmNvbSIsInByZWZlcnJlZF91c2VybmFtZSI6ImhpdGVzaC5tYWMyMDIyQGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJIaXRlc2giLCJmYW1pbHlfbmFtZSI6IkRpbmdhbmthciIsImVtYWlsIjoiaGl0ZXNoLm1hYzIwMjJAZ21haWwuY29tIiwic2lkIjoidV9VZ3RqYW9nU3lOSUpHN2k5M2I1S2ZBbldJLlNVMVRMVUpsYm5Sc1pYa3RVMGMuU3Nncy5SYmNDTVduZkltYUJRRUVMVnNXUVJGdkFsIiwiZXhwIjoxNjgzNjQwNDE2fQ.TJkEZ_jjhUHY3XY3HgoKDeQsV89VYvcOor82F1wGzGOgIg_pruNkxZtym_cBYZHXTyvjIPRpwe0UZ-Or0Ro4FriKfwrIvDZzt5Aw97MhiYCSwksESTyax7n74ZpGriVdt9CYmw6p5AhFbKmMsX_S985B7vN_3MLdkFf7p8zglhadu1IvIBOe3SNbetZgXRVcMPvlU5kh_Z4LmpS6AVorhB8ngqp9ZzhpHuKI2XMLV1dywcoTO2iAXYN7Pl5q-40Ai4h1IfBs3xm0IyDUdD_o0pl6RIlVgLnUvAoy5Mh64MO3ccPF8TiG5jtgn-mZ1bCruEocprLPiT5UfAtOgz1TzQ";

export class ConnectorIModelCreationRpcImpl extends ConnectorIModelCreationInterface {
  public static register() { RpcManager.registerImpl(ConnectorIModelCreationInterface, ConnectorIModelCreationRpcImpl); }

  public override createIModel(_requestParams: IModelRpcProps, _requestBody: any): Promise<any> {
    console.log("inside the ConnectorIModelCreationRpcImpl createIModel")
    return new Promise(async (resolve: any) => {
        console.log('_req');
        console.log(_requestBody?.filename);
        console.log('_requestParams.iTwinId');
        console.log(_requestParams.iTwinId);
        logger.info('respond with a resource');
        let params: CreateIModelRequestParam = {
            filename: _requestBody?.filename ?? '',
            iModelName: _requestBody?.iModelName ?? '',
            accessToekn: _requestBody?.accessToekn ?? '',
            iTwinId: _requestParams.iTwinId ?? ""
        }
        ConnectorController.processIModelCreationRequest(params)
            .then((iModelGuid: any) => {
                console.log('+++ iModelGuid');
                console.log(iModelGuid);
                resolve({ status: "Success", iModelGuid: iModelGuid})
            })
            .catch((error: any) => {
                console.log('error');
                console.log(error);
                resolve({ status: "Failed", message: error })
            })


    })

  }

}
