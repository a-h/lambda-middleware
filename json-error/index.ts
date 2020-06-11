import 'source-map-support/register';

import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { APIGatewayHandler } from '../';
import { jsonError } from '../response';

type OnErrorFunction = (event: APIGatewayProxyEventV2, error: Error) => void;

export const DefaultLogger: OnErrorFunction = (_event: APIGatewayProxyEventV2, error: Error) =>
    console.log(JSON.stringify(error));

// withJsonErrorHandling executes the next handler, logging any errors and returning a JSON error response.
export const withJsonErrorHandling = (
    next: APIGatewayHandler,
    onError: OnErrorFunction = DefaultLogger,
): APIGatewayHandler => async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    try {
        return await next(event);
    } catch (error) {
        if (onError) {
            onError(event, error);
        }
    }
    return jsonError('unhandled error', 500);
};
