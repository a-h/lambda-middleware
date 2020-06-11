import "source-map-support/register";

import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { APIGatewayHandler } from "../";

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
  constructor(
    start: Date,
    end: Date,
    request: APIGatewayProxyEventV2,
    response: APIGatewayProxyStructuredResultV2
  ) {
    this.time = start.toISOString();
    this.src = "rl";
    this.status = response.statusCode;
    if (this.status && this.status >= 100 && this.status < 200) {
      this.http_1xx = 1;
    }
    if (this.status && this.status >= 200 && this.status < 300) {
      this.http_2xx = 1;
    }
    if (this.status && this.status >= 300 && this.status < 400) {
      this.http_3xx = 1;
    }
    if (this.status && this.status >= 400 && this.status < 500) {
      this.http_4xx = 1;
    }
    if (this.status && this.status >= 500 && this.status < 600) {
      this.http_5xx = 1;
    }
    this.len = response.body ? response.body.length : 0;
    this.ms = end.getTime() - start.getTime();
    this.method = request.requestContext.http.method;
    this.path = request.requestContext.http.path;
  }
}

export type OnRequestCompleteFunction = (data: RequestData) => void;

const DefaultLogger: OnRequestCompleteFunction = (data: RequestData) =>
  console.log(JSON.stringify(data));

// withHttpLogging logs HTTP information - the HTTP status code, response body length, time taken, method and path.
export const withHttpLogging = (
  next: APIGatewayHandler,
  onRequestComplete: OnRequestCompleteFunction = DefaultLogger
): APIGatewayHandler => async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  const start = new Date();
  const response = await next(event);
  onRequestComplete(new RequestData(start, new Date(), event, response));
  return response;
};
