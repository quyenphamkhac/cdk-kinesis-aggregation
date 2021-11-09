import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import DynamoDB = require("aws-sdk/clients/dynamodb");
import StatiticsRepository from "../repositories/statitics.repository";

const ddbClient = new DynamoDB.DocumentClient({
  region: "ap-southeast-1",
});

const statiticsTableName = process.env.STATITICS_TABLE_NAME;

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("event ", event);

  const statiticsRepo = new StatiticsRepository(
    ddbClient,
    `${statiticsTableName}`
  );

  const item = await statiticsRepo.findOne({
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
