import { Construct } from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

class Database extends Construct {
  private table: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const table = new dynamodb.Table(this, "Table", {
      tableName: "Hello",
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
      indexName: "gsi1",
      partitionKey: {
        name: "typename",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
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
