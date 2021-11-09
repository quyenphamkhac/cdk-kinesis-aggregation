import { CorsHttpMethod, HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { Construct, Duration } from "@aws-cdk/core";
import * as path from "path";
import * as lambdaNode from "@aws-cdk/aws-lambda-nodejs";
import * as lambda from "@aws-cdk/aws-lambda";
import Database from "../database/infrastructure";

const stage = process.env.STAGE || "Dev";
const projectName = process.env.PROJECT_NAME || "Abcs";

class API extends Construct {
  constructor(scope: Construct, id: string, databaseInfra: Database) {
    super(scope, id);

    const statiticsTable = databaseInfra.getStatiticsTable();

    const httpApiV2 = new HttpApi(this, `${projectName}APIGatewayV2`, {
      apiName: `Abcs-API-Endpoints-${stage}`,
      description: `Abcs API endpoints for ${stage} environment`,
      corsPreflight: {
        allowHeaders: ["Authorization"],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.HEAD,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.OPTIONS,
        ],
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
          STATITICS_TABLE_NAME: statiticsTable.tableName,
        },
      }
    );

    // allow read write access
    statiticsTable.grantReadWriteData(getEventsFn);

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
  }
}

export default API;
