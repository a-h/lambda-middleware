import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { jsonOK } from '../response';
import { withCors, CorsConfig } from '.';

const OKHandler = async (_event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => jsonOK();

describe('CORS middleware', () => {
    it('allows access to sites if no Origin header is present', async () => {
        // Arrange.
        const handler = withCors(OKHandler);
        const expected = jsonOK();
        // Act.
        const response = await handler({} as APIGatewayProxyEventV2);
        // Assert.
        expect(response.body).toBe(expected.body);
    });
    it('allows access to sites if an Origin header is present, but a wildcard allow is in place (default)', async () => {
        // Arrange.
        const handler = withCors(OKHandler);
        const request = {
            headers: {
                Origin: 'https://example.com',
            } as { [name: string]: string },
        } as APIGatewayProxyEventV2;
        const expected = jsonOK();
        // Act.
        const response = await handler(request as APIGatewayProxyEventV2);
        // Assert.
        expect(response.body).toBe(expected.body);
    });
    it('restricts access to sites if the Origin header is not allow-listed', async () => {
        // Arrange.
        const handler = withCors(OKHandler, new CorsConfig(new Array<string>('https://example.com'), true));
        const request = {
            headers: {
                Origin: 'https://another.com',
            } as { [name: string]: string },
        } as APIGatewayProxyEventV2;
        const expected = `{"msg":"invalid CORS origin: 'https://another.com'","code":403}`;
        // Act.
        const response = await handler(request);
        // Assert.
        expect(response.body).toBe(expected);
    });
    it('allows access to sites if the Origin header is allow-listed', async () => {
        // Arrange.
        const handler = withCors(OKHandler, new CorsConfig(new Array<string>('https://example.com'), true));
        const request = {
            headers: {
                Origin: 'https://example.com',
            } as { [name: string]: string },
        } as APIGatewayProxyEventV2;
        const expected = jsonOK();
        // Act.
        const response = await handler(request);
        // Assert.
        expect(response.body).toBe(expected.body);
    });
});
