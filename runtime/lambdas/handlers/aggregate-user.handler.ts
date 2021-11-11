import {
  Callback,
  Context,
  DynamoDBRecord,
  DynamoDBStreamEvent,
} from "aws-lambda";
import DynamoDB = require("aws-sdk/clients/dynamodb");

type AttributeMap = { [key: string]: any };

type YOBCounter = {
  [key: string]: number;
};

type DiabetesStatusCounter = {
  [key: string]: number;
};

type GenderCounter = {
  male: number;
  female: number;
  unknown: number;
};

enum Gender {
  MALE = "male",
  FEMALE = "female",
  UNKNOWN = "unknown",
}

enum ReportType {
  USER = "USER_STATISTICS",
}

enum TypeName {
  UserStatistics = "UserStatistics",
}

const restrictKeys = ["pk", "sk", "typename"];

const ddb = new DynamoDB.DocumentClient();

export async function main(
  event: DynamoDBStreamEvent,
  context: Context,
  callback: Callback
): Promise<void> {
  try {
    let newUser = 0;
    let byGender: GenderCounter = { male: 0, female: 0, unknown: 0 };
    let byYOB: YOBCounter = {};
    let byDiabetesStatus: DiabetesStatusCounter = {};

    // begin of day
    const today = getBeginOfDay();
    const userDailyReport = await getDailyReport(ReportType.USER, today);
    const userTotallyReport = await getTotallyReport(ReportType.USER);

    event.Records.forEach((record: DynamoDBRecord) => {
      if (record.eventName === "INSERT") {
        const yob = record.dynamodb?.NewImage?.demographic?.M?.yob.N;
        const gender = record.dynamodb?.NewImage?.demographic?.M?.gender.S;
        const diabetesStatus =
          record.dynamodb?.NewImage?.demographic?.M?.diabetesStatus.S;
        // new user
        newUser = newUser + 1;

        // by yob
        if (yob) {
          byYOB[yob] = byYOB[yob] ? byYOB[yob] + 1 : 1;
        }

        // by gender
        if (gender === Gender.MALE) {
          byGender.male = byGender.male + 1;
        } else if (gender === Gender.FEMALE) {
          byGender.female = byGender.female + 1;
        } else {
          byGender.unknown = byGender.unknown + 1;
        }

        // by diabetes status
        if (diabetesStatus) {
          byDiabetesStatus[diabetesStatus] = byDiabetesStatus[diabetesStatus]
            ? byDiabetesStatus[diabetesStatus] + 1
            : 1;
        }
      }
    });
    const transactItems: DynamoDB.TransactWriteItemList = [];
    if (userDailyReport.Item) {
      const updateItem = buildAttributeMap(
        userDailyReport.Item,
        newUser,
        byGender,
        byYOB,
        byDiabetesStatus
      );
      transactItems.push({
        Update: {
          TableName: process.env.STATISTICS_TABLE_NAME as string,
          Key: { pk: updateItem.pk, sk: updateItem.sk },
          UpdateExpression: buildUpdateExpression(updateItem),
          ExpressionAttributeNames: buildExpressionAttributeNames(updateItem),
          ExpressionAttributeValues: buildExpressionAttributeValues(updateItem),
          ConditionExpression:
            "attribute_exists(#version) AND #version = :version",
          ReturnValuesOnConditionCheckFailure: "NONE",
        },
      });
    } else {
      const putItem = buildAttributeMap(
        {
          pk: ReportType.USER,
          sk: `DAILY#${today}`,
          typename: TypeName.UserStatistics,
          version: 1,
        },
        newUser,
        byGender,
        byYOB,
        byDiabetesStatus
      );
      transactItems.push({
        Put: {
          TableName: process.env.STATISTICS_TABLE_NAME as string,
          Item: putItem,
          ReturnValuesOnConditionCheckFailure: "NONE",
        },
      });
    }

    if (userTotallyReport.Item) {
      const updateItem = buildAttributeMap(
        userTotallyReport.Item,
        newUser,
        byGender,
        byYOB,
        byDiabetesStatus
      );
      transactItems.push({
        Update: {
          TableName: process.env.STATISTICS_TABLE_NAME as string,
          Key: { pk: updateItem.pk, sk: updateItem.sk },
          UpdateExpression: buildUpdateExpression(updateItem),
          ExpressionAttributeNames: buildExpressionAttributeNames(updateItem),
          ExpressionAttributeValues: buildExpressionAttributeValues(updateItem),
          ConditionExpression:
            "attribute_exists(#version) AND #version = :version",
          ReturnValuesOnConditionCheckFailure: "NONE",
        },
      });
    } else {
      const putItem = buildAttributeMap(
        {
          pk: ReportType.USER,
          sk: `TOTAL`,
          typename: TypeName.UserStatistics,
          version: 1,
        },
        newUser,
        byGender,
        byYOB,
        byDiabetesStatus
      );
      transactItems.push({
        Put: {
          TableName: process.env.STATISTICS_TABLE_NAME as string,
          Item: putItem,
          ReturnValuesOnConditionCheckFailure: "NONE",
        },
      });
    }
    const transactResponse = await ddb
      .transactWrite({
        TransactItems: transactItems,
        ReturnConsumedCapacity: "TOTAL",
      })
      .promise();
    callback(
      null,
      `Successfully processed ${
        event.Records.length
      } records. Comsumed: ${JSON.stringify(transactResponse.ConsumedCapacity)}`
    );
  } catch (error) {
    console.error(
      `Error processing records. Event was [${JSON.stringify(event)}`
    );
    console.log(error);
    callback(null, `Swallowed the error ${JSON.stringify(error)}`);
  }
}

const getBeginOfDay = (): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const today = d.toISOString();
  return today;
};

const getDailyReport = async (
  reportType: string,
  day: string
): Promise<DynamoDB.DocumentClient.GetItemOutput> => {
  const report = await ddb
    .get({
      TableName: process.env.STATISTICS_TABLE_NAME as string,
      Key: {
        pk: reportType,
        sk: `DAILY#${day}`,
      },
    })
    .promise();
  return report;
};

const getTotallyReport = async (
  reportType: string
): Promise<DynamoDB.DocumentClient.GetItemOutput> => {
  const report = await ddb
    .get({
      TableName: process.env.STATISTICS_TABLE_NAME as string,
      Key: {
        pk: reportType,
        sk: "TOTAL",
      },
    })
    .promise();
  return report;
};

const buildAttributeMap = (
  item: AttributeMap,
  newUser: number,
  byGender: GenderCounter,
  byYOB: YOBCounter,
  byDiabetesStatus: DiabetesStatusCounter
): DynamoDB.DocumentClient.AttributeMap => {
  // update diabetes value
  if (item?.byDiabetesStatus) {
    Object.keys(byDiabetesStatus).forEach((key: string) => {
      item.byDiabetesStatus[key] = item.byDiabetesStatus[key]
        ? item.byDiabetesStatus[key] + byDiabetesStatus[key]
        : byDiabetesStatus[key];
    });
  } else {
    item.byDiabetesStatus = byDiabetesStatus;
  }
  // update new user value
  if (item?.newUser) {
    item.newUser = item.newUser + newUser;
  } else {
    item.newUser = newUser;
  }
  // update gender value
  if (item?.byGender) {
    item.byGender.male = item.byGender.male
      ? item.byGender.male + byGender.male
      : byGender.male;
    item.byGender.female = item.byGender.female
      ? item.byGender.female + byGender.female
      : byGender.female;
    item.byGender.unknown = item.byGender.unknown
      ? item.byGender.unknown + byGender.unknown
      : byGender.unknown;
  } else {
    item.byGender = byGender;
  }
  // update yob value
  if (item?.byYOB) {
    Object.keys(byYOB).forEach((key: string) => {
      item.byYOB[key] = item.byYOB[key]
        ? item.byYOB[key] + byYOB[key]
        : byYOB[key];
    });
  } else {
    item.byYOB = byYOB;
  }
  return item;
};

const buildUpdateExpression = (
  item: DynamoDB.DocumentClient.AttributeMap
): string => {
  let expressionSets: any[] = [];

  Object.keys(item).forEach((key) => {
    if (!restrictKeys.includes(key)) {
      expressionSets =
        key === "version"
          ? [...expressionSets, `#newVersion = :newVersion`]
          : [...expressionSets, `#${key} = :${key}`];
    }
  });

  const updateExpression = `SET ${expressionSets.join(", ")}`;
  return updateExpression;
};

const buildExpressionAttributeNames = (
  item: DynamoDB.DocumentClient.AttributeMap
): AttributeMap => {
  const expressionNames: AttributeMap = {};

  Object.keys(item).forEach((key) => {
    if (!restrictKeys.includes(key)) {
      if (key === "version") {
        expressionNames[`#${key}`] = key;
        expressionNames["#newVersion"] = key;
      } else {
        expressionNames[`#${key}`] = key;
      }
    }
  });

  return expressionNames;
};

const buildExpressionAttributeValues = (
  item: DynamoDB.DocumentClient.AttributeMap
): AttributeMap => {
  const expressionValues: AttributeMap = {};

  Object.keys(item).forEach((key) => {
    if (!restrictKeys.includes(key)) {
      if (key === "version") {
        expressionValues[`:${key}`] = item[key];
        expressionValues[":newVersion"] = item[key] + 1;
      } else {
        expressionValues[`:${key}`] = item[key];
      }
    }
  });

  return expressionValues;
};
