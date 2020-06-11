import 'source-map-support/register';

import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

// An ErrorResponse defines the structure of HTTP errors returned to clients.
export class ErrorResponse {
    msg: string;
    code: number;
    constructor(msg: string, code: number) {
        this.msg = msg;
        this.code = code;
    }
}

export const jsonError = (msg: string, code: number) => jsonResponse<ErrorResponse>(new ErrorResponse(msg, code), code);

export const jsonOK = () => ({
    body: '{"ok":true}',
    statusCode: 200,
} as APIGatewayProxyStructuredResultV2);

// jsonResponse is a helper that produces an APIGatewayProxyStructuredResultV2 containing the JSON data.
export const jsonResponse = <T>(input: T, status: number): APIGatewayProxyStructuredResultV2 =>
    ({
        body: JSON.stringify(input),
        statusCode: status,
    } as APIGatewayProxyStructuredResultV2);
