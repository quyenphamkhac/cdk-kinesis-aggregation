import {
  APIGatewayEventRequestContext,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";

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

export interface HttpError {
  errorType?: string;
  errorMessage?: string;
  code?: string;
  message?: string;
  time?: string;
  requestId?: string;
  statusCode: number;
}

export type APIGatewayV2Handler = (
  req: APIGatewayProxyEventV2,
  ctx: APIGatewayEventRequestContext
) => Promise<APIGatewayProxyResultV2> | APIGatewayProxyResultV2;

export type ErrorHandler = (
  statusCode: number,
  message: string,
  err?: HttpError
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

  findMatchingHandler(routeKey: string): ProxyIntegrationRoute | null {
    const { routes } = this.config;
    const route = routes.find(
      (route: ProxyIntegrationRoute) =>
        routeKey === `${route.method} ${route.path}`
    );
    if (route) return route;
    return null;
  }

  async serve(
    req: APIGatewayProxyEventV2,
    ctx: APIGatewayEventRequestContext
  ): Promise<APIGatewayProxyResultV2> {
    try {
      const route = this.findMatchingHandler(req.routeKey);
      if (route) {
        return route.handler(req, ctx);
      }
      return this.config.errorHandler(404, "Route Not Found");
    } catch (error) {
      // need improve here for better error handling
      // TODO: using Error Mapping
      const statusCode = (error as HttpError).statusCode || 500;
      const errorMessage =
        (error as HttpError).errorMessage || "Internal Server Error";
      console.log("DEBUG", error);
      return this.config.errorHandler(
        statusCode,
        errorMessage,
        error as HttpError
      );
    }
  }
}
