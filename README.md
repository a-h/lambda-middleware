# lambda-middleware

Opinionated middleware for implementing API Gateway Lambdas.

Provides:

* CORS
* HTTP Logging
* JSON API
* JSON Error Handling

By using this API middleware, you can take the API Gateway handling code out of your Lambda code, and simplify your API code by leaving out CORS and global error handling.

APIs are defined with input and output types for HTTP handlers:

```typescript
// POST / PUT handlers would require an XInput type.
class HelloInput {
  first: string;
  last: string;
}

// All of the handlers need a JSON output type.
class HelloOutput {
  message: string;
  constructor(msg: string) {
    this.message = msg;
  }
}
```

A GET handler doesn't need to do JSON.stringify here - the middleware does that.

```typescript
// Each handler receives an optional "RequestContext" that can be used to get access to the raw event.
const getExample = async (ctx: RequestContext): Promise<Response<HelloOutput>> =>
  new Response<HelloOutput>( 200, new HelloOutput(`Here's the headers: ${JSON.stringify(ctx.event.headers)}`));
```

A POST handler also has an input type. The JSON middleware will handle JSON.parse and pass the data in.

```typescript
const postExample = async (input: HelloInput): Promise<Response<HelloOutput>> =>
  new Response<HelloOutput>(200, new HelloOutput(`Hello ${input.first}`));
```

This handler just throws an error. It's here to demonstrate how errors can be caught by the error handling middleware.

```typescript
const errorExample = async (): Promise<Response<HelloOutput>> => {
  throw new Error("I always throw an error");
};
```

A bundling function combines all of the middleware for use.

```
export const get = buildGetApi<HelloOutput>(getExample);
export const post = buildPostApi<HelloInput, HelloOutput>(postExample);
export const error = buildPostApi<HelloInput, HelloOutput>(errorExample);
```

