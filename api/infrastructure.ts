import { CorsHttpMethod, HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2";
import { LambdaProxyIntegration } from "@aws-cdk/aws-apigatewayv2-integrations";
import { Construct, Duration } from "@aws-cdk/core";
import * as path from "path";
import * as lambdaNode from "@aws-cdk/aws-lambda-nodejs";
import * as lambda from "@aws-cdk/aws-lambda";

const stage = process.env.STAGE;
const projectName = process.env.PROJECT;

class API extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

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
      }
    );

    const getEventsIntegration = new LambdaProxyIntegration({
      handler: getEventsFn,
    });

    httpApiV2.addRoutes({
      path: "/events",
      methods: [HttpMethod.GET],
      integration: getEventsIntegration,
    });
  }
}

export default API;
