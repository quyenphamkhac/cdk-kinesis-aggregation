import * as DynamoDB from "aws-sdk/clients/dynamodb";
import { User, UserListReponse } from "../entities/user.entity";
import { encodeNextToken, parseNextToken } from "../utils/helpers";

class UserRepository {
  ddb: DynamoDB.DocumentClient;
  tableName: string;

  constructor(ddb: DynamoDB.DocumentClient, tableName: string) {
    this.ddb = ddb;
    this.tableName = tableName;
  }

  async find(limit: number = 10, nextToken?: string): Promise<UserListReponse> {
    const resp = await this.ddb
      .scan({
        TableName: this.tableName,
        Limit: limit,
        ...(nextToken && { ExclusiveStartKey: parseNextToken(nextToken) }),
      })
      .promise();
    return {
      items: resp?.Items as User[],
      limit: limit,
      nextToken: encodeNextToken(resp?.LastEvaluatedKey),
    };
  }
}

export default UserRepository;
