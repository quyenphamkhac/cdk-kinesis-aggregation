import * as cdk from "@aws-cdk/core";
import API from "../api/infrastructure";
import Database from "../database/infrastructure";

export class AbcsBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const databaseInfra = new Database(this, "AbcsDatabase");
    new API(this, "AbcsAPI", databaseInfra);
  }
}
