import { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
    withJsonGet,
    withJsonPost,
    RequestContext,
    Response,
    GetApi,
    PostApi,
} from '.';

class HelloInput {
    first: string;
    last: string;
    constructor(first: string, last: string) {
        this.first = first;
        this.last = last;
    }
}

class HelloOutput {
    message: string;
    constructor(msg: string) {
        this.message = msg;
    }
}

const helloWorld: GetApi<HelloOutput> = async (_context: RequestContext) =>
    new Response<HelloOutput>(200, new HelloOutput('Hello, World!'));

describe('JSON GET API', () => {
    it('returns JSON', async () => {
        // Arrange.
        const handler = withJsonGet(helloWorld);
        const expected = `{"message":"Hello, World!"}`;
        const expectedStatus = 200;
        // Act.
        const response = await handler({} as APIGatewayProxyEventV2);
        // Assert.
        expect(response.body).toBe(expected);
        expect(response.statusCode).toBe(expectedStatus);
    });
});

const greeter: PostApi<HelloInput, HelloOutput> = async (input: HelloInput, _context: RequestContext) =>
    new Response<HelloOutput>(200, new HelloOutput(`Hello, ${input.first} ${input.last}!`));

describe('JSON POST API', () => {
    it('returns JSON', async () => {
        // Arrange.
        const handler = withJsonPost(greeter);
        const input = new HelloInput('Keith', 'Jackson');
        const expected = `{"message":"Hello, Keith Jackson!"}`;
        const expectedStatus = 200;
        // Act.
        const response = await handler({
            body: JSON.stringify(input),
        } as APIGatewayProxyEventV2);
        // Assert.
        expect(response.body).toBe(expected);
        expect(response.statusCode).toBe(expectedStatus);
    });
    it('returns an error if the JSON post is invalid', async () => {
        // Arrange.
        const handler = withJsonPost(greeter);
        const expected = `{"msg":"invalid body, expected JSON","code":400}`;
        const expectedStatus = 400;
        // Act.
        const response = await handler({
            body: `{ ____ invalid JSON ____ }`,
        } as APIGatewayProxyEventV2);
        // Assert.
        expect(response.body).toBe(expected);
        expect(response.statusCode).toBe(expectedStatus);
    });
});
