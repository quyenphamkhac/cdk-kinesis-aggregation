import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import DynamoDB = require("aws-sdk/clients/dynamodb");
import AggregationRepository from "../repositories/aggregation.repository";

const ddbClient = new DynamoDB.DocumentClient({
  region: "ap-southeast-1",
});

const aggregationTable = process.env.AGGREGATION_TABLE;

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("event ", event);

  const aggregateRepo = new AggregationRepository(
    ddbClient,
    `${aggregationTable}`
  );

  const item = await aggregateRepo.findOne({
    PK: "test",
    SK: "test",
  });

  return {
    body: JSON.stringify({
      message: "Hello, successful lambda invocation",
      item,
    }),
    statusCode: 200,
  };
}
