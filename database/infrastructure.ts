import { Construct } from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

class Database extends Construct {
  private table: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const table = new dynamodb.Table(this, "AggregationTable", {
      tableName: `Abcs-AggregationTable-${process.env.STAGE ?? "Dev"}`,
      partitionKey: {
        name: "PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    table.addGlobalSecondaryIndex({
      indexName: "EventType-Index",
      partitionKey: {
        name: "EventType",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "CreatedAt",
        type: dynamodb.AttributeType.STRING,
      },
    });
    this.table = table;
  }

  getTable(): dynamodb.Table {
    return this.table;
  }
}

export default Database;
