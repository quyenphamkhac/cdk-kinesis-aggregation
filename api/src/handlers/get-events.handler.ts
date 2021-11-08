import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("event ", event);
  return {
    body: JSON.stringify({
      message: "Hello, successful lambda invocation",
    }),
    statusCode: 200,
  };
}
