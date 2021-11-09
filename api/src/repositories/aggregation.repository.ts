import * as DynamoDB from "aws-sdk/clients/dynamodb";

class AggregationRepository {
  dbClient: DynamoDB;
  tableName: string;

  constructor(dbClient: DynamoDB, tableName: string) {
    this.dbClient = dbClient;
    this.tableName = tableName;
  }
  async findOne(): Promise<any> {
    const response = await this.dbClient
      .getItem({
        TableName: this.tableName,
        Key: {
          PK: {
            S: "test",
          },
          SK: {
            S: "test",
          },
        },
      })
      .promise();
    return response.Item;
  }
}

export default AggregationRepository;
