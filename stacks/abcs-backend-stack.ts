import * as cdk from "@aws-cdk/core";
import API from "../api/infrastructure";
import Auth from "../auth/infastructure";
import Database from "../database/infrastructure";
import LambdaRuntime from "../runtime/infastructure";

export class AbcsBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const databaseInfra = new Database(this, "AbcsDatabase");
    const authInfra = new Auth(this, "AbcsAuth");
    new API(this, "AbcsAPI", databaseInfra, authInfra);
    new LambdaRuntime(this, "AbcsRuntime", databaseInfra);
  }
}
