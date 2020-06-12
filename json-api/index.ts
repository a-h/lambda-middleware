import 'source-map-support/register';

import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { jsonError, jsonResponse } from '../response';
import { APIGatewayHandler } from '..';
import { ObjectSchema, ValidationErrorItem } from "@hapi/joi";

// This is the request data passed to API handlers that allows them to gain access to the full detail
// of the raw event.
export class RequestContext {
    event: APIGatewayProxyEventV2;
    constructor(e: APIGatewayProxyEventV2) {
        this.event = e;
    }
}

// This is the response from each API.
export class Response<T> {
    status: number;
    body: T;
    constructor(status: number, body: T) {
        this.status = status;
        this.body = body;
    }
}

export class ValidationError {
    msg: string;
    errors: Array<ValidationErrorSummary>;
    constructor(msg: string, errors: Array<ValidationErrorItem>) {
        this.msg = msg;
        this.errors = errors.map(e => new ValidationErrorSummary(e.message, e.path.toString()));
    }
}

export class ValidationErrorSummary {
    msg: string;
    path: string;
    constructor(msg: string, path: string) {
        this.msg = msg;
        this.path = path;
    }
}

// The signature of a GET API.
export type GetApi<TOutput> = (context: RequestContext) => Promise<Response<TOutput>>;

// The signature of a POST API.
export type PostApi<TInput, TOutput> = (input: TInput, context: RequestContext) => Promise<Response<TOutput>>;

// withJsonGet converts the output from a handler into JSON.
export const withJsonGet = <TOutput>(handler: GetApi<TOutput>): APIGatewayHandler => async (
    event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> => {
    const output = await handler(new RequestContext(event));
    return jsonResponse<TOutput>(output.body, output.status);
};

// withJsonPost parses the request body and converts the output from a handler into JSON.
// If the body cannot be parsed, a HTTP 400 error is returned to the client.
export const withJsonPost = <TInput, TOutput>(handler: PostApi<TInput, TOutput>, schema: ObjectSchema<TInput> = null): APIGatewayHandler => async (
    event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> => {
    let parsedBody: TInput;
    try {
        parsedBody = JSON.parse(event.body) as TInput;
    } catch {
        return jsonError('invalid body, expected JSON', 400);
    }
    if(schema) {
        const vr = schema.validate(parsedBody, { abortEarly: false });
        if(vr.error) {
            return jsonResponse(new ValidationError("JSON body failed validation", vr.error.details), 422);
        }
    }
    const output = await handler(parsedBody, new RequestContext(event));
    return jsonResponse<TOutput>(output.body, output.status);
};
