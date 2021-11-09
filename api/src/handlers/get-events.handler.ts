import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import DynamoDB = require("aws-sdk/clients/dynamodb");
import AggregationRepository from "../repositories/aggregation.repository";

const ddbClient = new DynamoDB({
  region: "ap-southeast-1",
});

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("event ", event);

  const aggregateRepo = new AggregationRepository(
    ddbClient,
    `${process.env.TABLE_NAME}`
  );

  const item = await aggregateRepo.findOne();

  return {
    body: JSON.stringify({
      message: "Hello, successful lambda invocation",
    }),
    statusCode: 200,
  };
}
