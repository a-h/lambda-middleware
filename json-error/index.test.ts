import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { jsonOK } from '../response';
import { withJsonErrorHandling, DefaultLogger } from '.';

describe('JSON error handling middleware', () => {
    it('does not log if no errors occurred', async () => {
        // Arrange.
        const okHandler = async (_event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => jsonOK();
        const onError = jest.fn();
        const handler = withJsonErrorHandling(okHandler, onError);
        const expected = jsonOK();
        // Act.
        const response = await handler({} as APIGatewayProxyEventV2);
        // Assert.
        expect(onError).not.toHaveBeenCalled();
        expect(response.body).toBe(expected.body);
    });
    it('logs if an errors occurred', async () => {
        // Arrange.
        const expectedError = new Error("expected error");
        const errorHandler = async (_event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
            throw expectedError;
        };
        const onError = jest.fn();
        const handler = withJsonErrorHandling(errorHandler, onError);
        const expected = `{"msg":"unhandled error","code":500}`;
        const event = {} as APIGatewayProxyEventV2
        // Act.
        const response = await handler(event);
        // Assert.
        expect(onError).toHaveBeenCalledWith(event, expectedError);
        expect(response.body).toBe(expected);
    });
    it("has a DefaultLogger that does not crash", async () => {
       DefaultLogger({} as APIGatewayProxyEventV2, new Error("test")); 
    });
});
