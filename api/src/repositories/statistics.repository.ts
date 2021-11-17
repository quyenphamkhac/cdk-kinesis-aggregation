import * as DynamoDB from "aws-sdk/clients/dynamodb";
import { UserStatistics } from "../entities/user-statistics.entity";
import { GetItemReponse, ListItemReponse } from "../interfaces/http-response";
import { UserStatisticsQuery } from "../interfaces/query";
import { StatisticsRange, StatisticsType } from "../types/common";
import { encodeNextToken, parseNextToken } from "../utils/helpers";

class StatisticsRepository {
  ddb: DynamoDB.DocumentClient;
  tableName: string;

  constructor(dbClient: DynamoDB.DocumentClient, tableName: string) {
    this.ddb = dbClient;
    this.tableName = tableName;
  }
  async findOne(key: DynamoDB.DocumentClient.Key): Promise<UserStatistics> {
    const response = await this.ddb
      .get({
        TableName: this.tableName,
        Key: key,
      })
      .promise();
    return response.Item as UserStatistics;
  }

  async findById(
    partitonKey: string,
    sortKey?: string
  ): Promise<GetItemReponse<UserStatistics>> {
    const resp = await this.ddb
      .get({
        TableName: this.tableName,
        Key: {
          pk: partitonKey,
          ...(sortKey && { sk: sortKey }),
        },
        ConsistentRead: false,
      })
      .promise();

    return {
      data: resp.Item as UserStatistics,
    };
  }

  async find(
    query: UserStatisticsQuery,
    nextToken?: string
  ): Promise<ListItemReponse<UserStatistics>> {
    const resp = await this.ddb
      .query({
        TableName: this.tableName,
        KeyConditionExpression: "pk = :pk AND begins_with(sk,:sk)",
        ExpressionAttributeValues: {
          ":pk": StatisticsType.USER,
          ":sk": StatisticsRange.DAILY,
        },
        Limit: query.limit,
        ...(nextToken && { ExclusiveStartKey: parseNextToken(nextToken) }),
      })
      .promise();
    return {
      items: resp?.Items as UserStatistics[],
      limit: query.limit,
      nextToken: encodeNextToken(resp?.LastEvaluatedKey),
    };
  }
}

export default StatisticsRepository;
