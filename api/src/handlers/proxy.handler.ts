import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import DynamoDB = require("aws-sdk/clients/dynamodb");
import UserRepository from "../repositories/user.repository";
import {
  APIGatewayV2Handler,
  APIGatewayV2Router,
} from "../router/apigwV2.router";

const { USER_TABLE_NAME: userTableName } = process.env;

const ddb = new DynamoDB.DocumentClient();
const userRepository = new UserRepository(ddb, <string>userTableName);

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
  const resp = await userRepository.find(10);
  return {
    statusCode: 200,
    body: JSON.stringify(resp),
  };
};
