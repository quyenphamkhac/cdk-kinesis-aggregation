import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import DynamoDB = require("aws-sdk/clients/dynamodb");
import { UserStatisticsQuery } from "../interfaces/query";
import StatisticsRepository from "../repositories/statistics.repository";
import UserRepository from "../repositories/user.repository";
import {
  APIGatewayV2Handler,
  APIGatewayV2Router,
} from "../router/apigwV2.router";
import { StatisticsRange, StatisticsType } from "../types/common";

const {
  USER_TABLE_NAME: userTableName,
  STATISTICS_TABLE_NAME: statisticsTableName,
} = process.env;

const ddb = new DynamoDB.DocumentClient();
const userRepository = new UserRepository(ddb, <string>userTableName);
const statisticsRepository = new StatisticsRepository(
  ddb,
  <string>statisticsTableName
);

export async function main(
  req: APIGatewayProxyEventV2,
  ctx: APIGatewayEventRequestContext
): Promise<APIGatewayProxyResultV2> {
  const router = new APIGatewayV2Router({
    routes: [
      {
        path: "/users",
        method: "GET",
        handler: getUsersHandler,
      },
      {
        path: "/user-statistics",
        method: "GET",
        handler: getUserStatisticsHandler,
      },
      {
        path: "/user-statistics/count",
        method: "GET",
        handler: getCountUserStatisticsHandler,
      },
    ],
    cors: true,
    debug: true,
    errorHandler: (code, message) => ({
      statusCode: code,
      body: JSON.stringify({
        statusCode: code,
        message,
      }),
    }),
  });
  return router.serve(req, ctx);
}

const getUsersHandler: APIGatewayV2Handler = async (
  req: APIGatewayProxyEventV2,
  ctx: APIGatewayEventRequestContext
): Promise<APIGatewayProxyResultV2> => {
  const nextToken = req?.queryStringParameters?.nextToken;
  const limit = req?.queryStringParameters?.limit || 10;

  const resp = await userRepository.find(+limit, nextToken);
  return {
    statusCode: 200,
    body: JSON.stringify(resp),
  };
};

const getUserStatisticsHandler: APIGatewayV2Handler = async (
  req: APIGatewayProxyEventV2,
  ctx: APIGatewayEventRequestContext
): Promise<APIGatewayProxyResultV2> => {
  // get maximum 100 records
  const limit = req?.queryStringParameters?.limit || 100;
  const query: UserStatisticsQuery = {
    limit: +limit,
    sort: "ASC",
    // from year 2000 by default
    from: req?.queryStringParameters?.from || "2000",
    // to year 2999 by default
    to: req?.queryStringParameters?.to || "2999",
  };
  const resp = await statisticsRepository.find(query);
  return {
    statusCode: 200,
    body: JSON.stringify(resp),
  };
};

const getCountUserStatisticsHandler: APIGatewayV2Handler = async (
  req: APIGatewayProxyEventV2,
  ctx: APIGatewayEventRequestContext
): Promise<APIGatewayProxyResultV2> => {
  const resp = await statisticsRepository.findById(
    StatisticsType.USER,
    StatisticsRange.TOTAL
  );
  return {
    statusCode: 200,
    body: JSON.stringify(resp),
  };
};
