import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { type } from "os";

export type HttpMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE"
  | "PATCH";

export type APIGatewayV2Handler = (
  req: APIGatewayProxyEventV2,
  ctx: APIGatewayEventRequestContext
) => Promise<APIGatewayProxyResultV2> | APIGatewayProxyResultV2;

export type ErrorHandler = (
  statusCode: number,
  message: string
) => APIGatewayProxyResultV2;

export interface ProxyIntegrationRoute {
  path: string;
  method: HttpMethod;
  handler: APIGatewayV2Handler;
}

export interface config {
  routes: ProxyIntegrationRoute[];
  cors: boolean;
  debug: true;
  errorHandler: ErrorHandler;
}

export class APIGatewayV2Router {
  config: config;
  constructor(config: config) {
    this.config = config;
  }

  findMatchingHandler(
    path: string,
    method: string
  ): ProxyIntegrationRoute | null {
    const { routes } = this.config;
    const route = routes.find(
      (route: ProxyIntegrationRoute) => route.path === path && route.method
    );
    if (route) return route;
    return null;
  }

  async serve(
    req: APIGatewayProxyEventV2,
    ctx: APIGatewayEventRequestContext
  ): Promise<APIGatewayProxyResultV2> {
    try {
      const path = req.requestContext.http.path;
      const method = req.requestContext.http.method;
      const route = this.findMatchingHandler(path, method);
      if (route) {
        return route.handler(req, ctx);
      }
      return this.config.errorHandler(404, "Route Not Found");
    } catch (error) {
      return this.config.errorHandler(500, "Internal Server Error");
    }
  }
}
