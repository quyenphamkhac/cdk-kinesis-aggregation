import { Construct } from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

const stage = process.env.STAGE || "Dev";
const projectName = process.env.PROJECT_NAME || "Abcs";

class Database extends Construct {
  private table: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const table = new dynamodb.Table(this, "StatisticsTable", {
      tableName: `${projectName}-StatisticsTable-${stage}`,
      partitionKey: {
        name: "pk",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    table.addGlobalSecondaryIndex({
      indexName: "RecordType-Index",
      partitionKey: {
        name: "typename",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "createdAt",
        type: dynamodb.AttributeType.STRING,
      },
    });
    this.table = table;
  }

  getStatisticsTable(): dynamodb.Table {
    return this.table;
  }
}

export default Database;
