// import { AgentAuthorizationClient, AgentAuthorizationClientConfiguration } from "@bentley/backend-itwin-client";
import { AccessToken } from "@itwin/core-bentley";
import axios, { AxiosRequestConfig } from "axios";
import * as dotenv from "dotenv";
const envconfigs = dotenv.config();

// import { ServiceAuthorizationClient, ServiceAuthorizationClientConfiguration } from "@itwin/service-authorization"

const formUrlEncoded = (obj: any) =>
   Object.keys(obj).reduce((p, c) => p + `&${c}=${encodeURIComponent(obj[c])}`, '')
export class ClientAuthorization {
    private clientId: string;
    private clientSecret: string;
    private scope: string;
    private grant_type: string = "client_credentials";
    constructor(clientId: string, clientSecret: string, scope: string) {

        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.scope = scope;

        console.log("insifde ClientAuthorization construct =====");
        console.log(this.scope);

    }

    getAccessToken = (): Promise<AccessToken> => {
        return new Promise(async (resolve: any) => {
            console.log("inside getAccessToken");
            // const clientConfig: ServiceAuthorizationClientConfiguration = {
            //     clientId: this.clientId,
            //     clientSecret: this.clientSecret,
            //     scope: this.scope,
            // }

            // const client: ServiceAuthorizationClient = new ServiceAuthorizationClient(clientConfig)

            // const access_token: any =  await client.getAccessToken();
            // console.log('access_token');
            // console.log(access_token);
            // resolve(access_token);

            let url = `${envconfigs?.parsed?.AUTH_CLIENT_AUTHORITY}/connect/token`;
            let requestOptions: AxiosRequestConfig = {
                headers: {
                    Accept: 'application/x-www-form-urlencoded',
                },
            }
            let data =  {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                scope: this.scope,
                grant_type: this.grant_type

            }

            axios.post(url, formUrlEncoded(data), requestOptions)
                .then((res: any) => {
                    // console.log('res');
                    // console.log(res.data);
                    resolve(res.data.token_type +' '+res.data.access_token);
                })
                .catch((e: any) => {
                    console.log("reject");
                    console.log(e);
                    resolve(null);
                    // reject(e)
                })
        })
    }
}