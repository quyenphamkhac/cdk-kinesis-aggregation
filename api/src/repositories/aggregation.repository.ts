import * as DynamoDB from "aws-sdk/clients/dynamodb";

class AggregationRepository {
  dbClient: DynamoDB.DocumentClient;
  tableName: string;

  constructor(dbClient: DynamoDB.DocumentClient, tableName: string) {
    this.dbClient = dbClient;
    this.tableName = tableName;
  }
  async findOne(key: DynamoDB.DocumentClient.Key): Promise<any> {
    const response = await this.dbClient
      .get({
        TableName: this.tableName,
        Key: key,
      })
      .promise();
    return response.Item;
  }
}

export default AggregationRepository;
