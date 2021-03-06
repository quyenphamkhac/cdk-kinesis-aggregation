import {
  CorsHttpMethod,
  HttpApi,
  HttpAuthorizer,
  HttpMethod,
} from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { Construct, Duration } from "@aws-cdk/core";
import * as path from "path";
import * as lambdaNode from "@aws-cdk/aws-lambda-nodejs";
import * as lambda from "@aws-cdk/aws-lambda";
import Database from "../database/infrastructure";
import Auth from "../auth/infastructure";
import { HttpUserPoolAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers";

const stage = process.env.STAGE || "Dev";
const projectName = process.env.PROJECT_NAME || "Abcs";

class API extends Construct {
  constructor(
    scope: Construct,
    id: string,
    databaseInfra: Database,
    authInfra: Auth
  ) {
    super(scope, id);

    // abcs databases
    const statisticsTable = databaseInfra.getStatisticsTable();
    const userTable = databaseInfra.getUserModelTable();

    // abcs auth user pools
    const adminUserPool = authInfra.getAdminUserPool();
    const adminUserPoolClients = authInfra.getUserPoolClients();

    // cognito user pool authorizers
    const cognitoAuthorizer = new HttpUserPoolAuthorizer({
      userPool: adminUserPool,
      userPoolClients: adminUserPoolClients,
    });

    const httpApiV2 = new HttpApi(this, `${projectName}APIGatewayV2`, {
      apiName: `Abcs-API-Endpoints-${stage}`,
      description: `Abcs API endpoints for ${stage} environment`,
      corsPreflight: {
        allowHeaders: [
          "content-type",
          "x-amz-date",
          "authorization",
          "x-api-key",
          "x-amz-security-token",
          "x-amz-user-agent",
        ],
        allowMethods: [CorsHttpMethod.ANY],
        allowOrigins: ["*"],
        maxAge: Duration.days(10),
      },
    });

    // define get events fn: for testing purpose
    const getEventsFn = new lambdaNode.NodejsFunction(
      this,
      `${projectName}GetEventsLambda`,
      {
        memorySize: 512,
        functionName: `${projectName}-GetEventsFn-${stage}`,
        description: `${projectName} GetEventsFn for ${stage} environment.`,
        timeout: Duration.seconds(6),
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "main",
        entry: path.join(__dirname, "/src/handlers/get-events.handler.ts"),
        bundling: {
          minify: true,
          externalModules: ["aws-sdk"],
        },
        environment: {
          STATISTICS_TABLE_NAME: statisticsTable.tableName,
        },
      }
    );

    // allow read write access
    statisticsTable.grantReadWriteData(getEventsFn);

    // define healcheck fn
    const getEventsIntegration = new LambdaProxyIntegration({
      handler: getEventsFn,
    });

    const healthCheckFn = new lambdaNode.NodejsFunction(
      this,
      `${projectName}HealthCheckFnLambda`,
      {
        memorySize: 512,
        functionName: `${projectName}-HealthCheckFn-${stage}`,
        description: `${projectName} HealthCheckFn for ${stage} environment.`,
        timeout: Duration.seconds(6),
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "main",
        entry: path.join(__dirname, "/src/handlers/health.handler.ts"),
        bundling: {
          minify: true,
          externalModules: ["aws-sdk"],
        },
      }
    );

    const healthCheckIntegration = new LambdaProxyIntegration({
      handler: healthCheckFn,
    });

    const proxyHandlerFn = new lambdaNode.NodejsFunction(
      this,
      `${projectName}ProxyHanlerFnLambda`,
      {
        memorySize: 512,
        functionName: `${projectName}-ProxyHandlerFn-${stage}`,
        description: `${projectName} ProxyHandlerFn for ${stage} environment.`,
        timeout: Duration.seconds(6),
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "main",
        entry: path.join(__dirname, "/src/handlers/proxy.handler.ts"),
        bundling: {
          minify: true,
          externalModules: ["aws-sdk"],
        },
        environment: {
          STATISTICS_TABLE_NAME: statisticsTable.tableName,
          USER_TABLE_NAME: userTable.tableName,
        },
      }
    );

    const proxyHandlerIntegration = new LambdaProxyIntegration({
      handler: proxyHandlerFn,
    });

    // allow read write access
    statisticsTable.grantReadWriteData(proxyHandlerFn);
    userTable.grantReadWriteData(proxyHandlerFn);

    httpApiV2.addRoutes({
      path: "/",
      methods: [HttpMethod.GET],
      integration: healthCheckIntegration,
    });

    httpApiV2.addRoutes({
      path: "/events",
      methods: [HttpMethod.GET],
      integration: getEventsIntegration,
    });

    httpApiV2.addRoutes({
      path: "/users",
      methods: [HttpMethod.GET],
      integration: proxyHandlerIntegration,
      authorizer: cognitoAuthorizer,
    });

    httpApiV2.addRoutes({
      path: "/user-statistics",
      methods: [HttpMethod.GET],
      integration: proxyHandlerIntegration,
      authorizer: cognitoAuthorizer,
    });

    httpApiV2.addRoutes({
      path: "/user-statistics/count",
      methods: [HttpMethod.GET],
      integration: proxyHandlerIntegration,
      authorizer: cognitoAuthorizer,
    });

    httpApiV2.addRoutes({
      path: "/users/{userID}/status",
      methods: [HttpMethod.PATCH],
      integration: proxyHandlerIntegration,
      authorizer: cognitoAuthorizer,
    });

    httpApiV2.addRoutes({
      path: "/users/{userID}",
      methods: [HttpMethod.POST],
      integration: proxyHandlerIntegration,
      authorizer: cognitoAuthorizer,
    });
  }
}

export default API;
