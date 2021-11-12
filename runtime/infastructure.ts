import { Construct, Duration } from "@aws-cdk/core";
import * as lambdanodejs from "@aws-cdk/aws-lambda-nodejs";
import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";
import * as iam from "@aws-cdk/aws-iam";
import Database from "../database/infrastructure";

const { PROJECT_NAME: projectName, STAGE: stage } = process.env;

class LambdaRuntime extends Construct {
  constructor(scope: Construct, id: string, database: Database) {
    super(scope, id);

    const userModelTable = database.getUserModelTable();
    const statisticsTable = database.getStatisticsTable();

    const aggregateUsersFn = new lambdanodejs.NodejsFunction(
      this,
      `${projectName}AggregateUsersFn`,
      {
        memorySize: 512,
        functionName: `${projectName}-AggregateUsersFn-${stage}`,
        description: `${projectName} AggregateUsersFn for ${stage} environment.`,
        timeout: Duration.seconds(6),
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "main",
        entry: path.join(
          __dirname,
          "/lambdas/handlers/aggregate-user.handler.ts"
        ),
        bundling: {
          minify: true,
          externalModules: ["aws-sdk"],
        },
        environment: {
          USER_TABLE_NAME: userModelTable.tableName,
          STATISTICS_TABLE_NAME: statisticsTable.tableName,
        },
      }
    );

    // grant write data to statistics table
    statisticsTable.grantReadWriteData(aggregateUsersFn);

    aggregateUsersFn.addEventSourceMapping("UserTableStreamEventSource", {
      eventSourceArn: process.env.USER_STREAM_ARN as string,
      batchSize: 10,
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      bisectBatchOnError: true,
      retryAttempts: 5,
    });
    aggregateUsersFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams",
        ],
        resources: [process.env.USER_STREAM_ARN as string],
      })
    );
  }
}

export default LambdaRuntime;
