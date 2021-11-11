import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { APIGatewayV2Router } from "../router/apigwV2.router";

export async function main(
  req: APIGatewayProxyEventV2,
  ctx: APIGatewayEventRequestContext
): Promise<APIGatewayProxyResultV2> {
  const router = new APIGatewayV2Router({
    routes: [
      {
        path: "/user-statistics",
        method: "GET",
        handler: (req, ctx) => {
          return `You called me: ${req.rawPath} ${ctx.eventType}`;
        },
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
