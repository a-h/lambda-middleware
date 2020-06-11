import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { jsonOK } from '../response';
import { withHttpLogging, RequestData, DateFunction } from '.';

const OKHandler = async (_event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => jsonOK();

describe('HTTP logging middleware', () => {
    it('logs HTTP access', async () => {
        // Arrange.
        const startDate = new Date("2000-01-01T00:00:00.000Z")
        const endDate = new Date("2000-01-01T00:00:00.100Z")
        let index = 0;
        const now: DateFunction = (): Date => {
            if(index == 0) {
                index ++;
                return startDate;
            }
            return endDate;
        };
        const expectedData = new RequestData(startDate, endDate, null, null);
        expectedData.len = 11;
        expectedData.status = 200;
        expectedData.http_2xx = 1;
        const mockLogger = (data: RequestData) => {
            expect(data).toEqual(expectedData);
        };
        const handler = withHttpLogging(OKHandler, mockLogger, now);
        const expected = jsonOK();
        // Act.
        const response = await handler({} as APIGatewayProxyEventV2);
        // Assert.
        expect(response.body).toBe(expected.body);
    });
});
