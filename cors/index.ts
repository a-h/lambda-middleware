import 'source-map-support/register';

import { APIGatewayHandler } from '../';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { jsonError } from '../response';

// CorsConfig allows configuration of CORS.
export class CorsConfig {
    allow: Array<string>;
    allowCredentials: boolean;
    constructor(allow: Array<string> = new Array<string>('*'), allowCredentials = true) {
        this.allow = allow;
        this.allowCredentials = allowCredentials;
    }
}

export const DefaultCorsConfig = new CorsConfig();

const corsIsAllowed = (conf: CorsConfig, origin: string): boolean =>
    origin == undefined ||
    conf.allow.map((ao) => ao == '*' || ao.indexOf(origin) !== -1).reduce((prev, current) => prev || current);

// withCors creates middleware that applies CORS headers to the response, and validates CORS
// headers present on the request.
export const withCors = (next: APIGatewayHandler, conf: CorsConfig = DefaultCorsConfig): APIGatewayHandler => async (
    event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> => {
    if (!corsIsAllowed(conf, event.headers?.Origin)) {
        return jsonError(`invalid CORS origin: '${event.headers.Origin}'`, 403);
    }
    const response = await next(event);
    if (!response.headers) {
        response.headers = {};
    }
    response.headers['Access-Control-Allow-Origin'] = '*';
    response.headers['Access-Control-Allow-Credentials'] = true;
    return response;
};
