import "source-map-support/register";

import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { withCors } from "./cors";
import { withJsonErrorHandling } from "./json-error";
import { PostApi, GetApi, withJsonGet, withJsonPost } from "./json-api";
import { withHttpLogging } from "./http-logging";

// A definition of an API Gateway handler. AWS has one, but it supports all of the variants of the handler
// which messes up the type safety.
export type APIGatewayHandler = (
  event: APIGatewayProxyEventV2
) => Promise<APIGatewayProxyStructuredResultV2>;

// buildGetApi creates the default configuration for a GET API.
export const buildGetApi = <TOutput>(api: GetApi<TOutput>): APIGatewayHandler =>
  withHttpLogging(withCors(withJsonErrorHandling(withJsonGet<TOutput>(api))));

// buildPostApi creates the default configuration for a POST API.
export const buildPostApi = <TInput, TOutput>(
  api: PostApi<TInput, TOutput>
): APIGatewayHandler =>
  withHttpLogging(
    withCors(withJsonErrorHandling(withJsonPost<TInput, TOutput>(api)))
  );
