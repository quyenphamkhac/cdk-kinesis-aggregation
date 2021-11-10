import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import DynamoDB = require("aws-sdk/clients/dynamodb");
import StatisticsRepository from "../repositories/statistics.repository";

const ddbClient = new DynamoDB.DocumentClient({
  region: "ap-southeast-1",
});

const statisticsTableName = process.env.STATISTICS_TABLE_NAME;

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("event ", event);

  const statisticsRepo = new StatisticsRepository(
    ddbClient,
    statisticsTableName as string
  );

  const item = await statisticsRepo.findOne({
    pk: "test",
    sk: "test",
  });

  return {
    body: JSON.stringify({
      message: "Hello, successful lambda invocation",
      item,
    }),
    statusCode: 200,
  };
}
