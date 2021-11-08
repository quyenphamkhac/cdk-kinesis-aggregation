import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  return {
    body: JSON.stringify({
      status: "pass",
      version: "1",
      releaseId: "1.0.0",
      notes: [""],
      output: "",
      description: "Health of Abcs service",
    }),
    statusCode: 200,
  };
}
