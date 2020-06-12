import 'source-map-support/register';

import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { APIGatewayHandler } from '../';

export class RequestData {
    time: string;
    src: string;
    status?: number;
    http_1xx?: number;
    http_2xx?: number;
    http_3xx?: number;
    http_4xx?: number;
    http_5xx?: number;
    len: number;
    ms: number;
    method: string;
    path: string;
    constructor(start: Date, end: Date, request: APIGatewayProxyEventV2, response: APIGatewayProxyStructuredResultV2) {
        this.time = start.toISOString();
        this.src = 'rl';
        this.status = response?.statusCode || 0;
        this.http_1xx = inRange(this.status, 100, 200);
        this.http_2xx = inRange(this.status, 200, 300);
        this.http_3xx = inRange(this.status, 300, 400);
        this.http_4xx = inRange(this.status, 400, 500);
        this.http_5xx = inRange(this.status, 500, 600);
        this.len = response?.body ? response.body.length : 0;
        this.ms = end.getTime() - start.getTime();
        this.method = request?.requestContext?.http?.method || "";
        this.path = request?.requestContext?.http?.path || "";
    }
}

const inRange = (n: number, from: number, to: number): number => n >= from && n < to ? 1 : undefined;

export type OnRequestCompleteFunction = (data: RequestData) => void;
export type DateFunction = () => Date;

const DefaultLogger: OnRequestCompleteFunction = (data: RequestData) => console.log(JSON.stringify(data));
const DefaultDateFunction: DateFunction = () => new Date();

// withHttpLogging logs HTTP information - the HTTP status code, response body length, time taken, method and path.
export const withHttpLogging = (
    next: APIGatewayHandler,
    onRequestComplete: OnRequestCompleteFunction = DefaultLogger,
    now: DateFunction = DefaultDateFunction,
): APIGatewayHandler => async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    const start = now();
    const response = await next(event);
    onRequestComplete(new RequestData(start, now(), event, response));
    return response;
};
