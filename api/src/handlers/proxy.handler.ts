import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import DynamoDB = require("aws-sdk/clients/dynamodb");
import { UpdateUserStatus } from "../dto/user.dto";
import { UserStatisticsQuery } from "../interfaces/query";
import StatisticsRepository from "../repositories/statistics.repository";
import UserRepository from "../repositories/user.repository";
import {
  APIGatewayV2Handler,
  APIGatewayV2Router,
} from "../router/apigwV2.router";
import { StatisticsRange, StatisticsType } from "../types/common";
import { parseJson } from "../utils/helpers";

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
  console.log("Event: ", JSON.stringify(req));
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
      {
        path: "/users/{userID}/status",
        method: "PATCH",
        handler: updateUserStatusHandler,
      },
      {
        path: "/users/{userID}",
        method: "POST",
        handler: updateUserStatusHandler,
      },
    ],
    cors: true,
    debug: true,
    errorHandler: (code, message, err) => ({
      statusCode: code,
      body: JSON.stringify({
        statusCode: code,
        message,
        ...err,
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

const updateUserStatusHandler: APIGatewayV2Handler = async (
  req: APIGatewayProxyEventV2,
  ctx: APIGatewayEventRequestContext
): Promise<APIGatewayProxyResultV2> => {
  const userID: string | undefined = req?.pathParameters?.userID;
  const updateUserStatusDto: UpdateUserStatus = parseJson(
    req.body as string
  ) as UpdateUserStatus;
  if (!userID) {
    throw new Error("Missing UserID in path parameters");
  }
  const resp = await userRepository.updateUserStatus(
    userID,
    updateUserStatusDto
  );
  return {
    statusCode: 200,
    body: JSON.stringify(resp),
  };
};
