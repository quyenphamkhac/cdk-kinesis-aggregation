import * as DynamoDB from "aws-sdk/clients/dynamodb";
import { UpdateUserStatus } from "../dto/user.dto";
import { User, UserListReponse } from "../entities/user.entity";
import { GetItemReponse } from "../interfaces/http-response";
import { encodeNextToken, parseNextToken } from "../utils/helpers";

class UserRepository {
  ddb: DynamoDB.DocumentClient;
  tableName: string;

  constructor(ddb: DynamoDB.DocumentClient, tableName: string) {
    this.ddb = ddb;
    this.tableName = tableName;
  }

  async updateUserStatus(
    userID: string,
    payload: UpdateUserStatus
  ): Promise<GetItemReponse<User>> {
    const resp = await this.ddb
      .update({
        TableName: this.tableName,
        Key: {
          userID: userID,
        },
        UpdateExpression: "SET #status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": payload.status,
        },
        ReturnValues: "ALL_NEW",
      })
      .promise();
    return {
      data: resp.Attributes as User,
    };
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
