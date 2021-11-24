import * as AWS from "aws-sdk";
import DynamoDB = require("aws-sdk/clients/dynamodb");
import * as uuid from "uuid";
import * as faker from "faker";

AWS.config.update({
  region: "us-east-1",
});

const ddb = new DynamoDB.DocumentClient();
seed();
async function seed() {
  for (let i = 0; i <= 10; i++) {
    await ddb
      .put({
        TableName: "UserModel-rb6txpzx2fertjokgntdmthpqi-dev",
        Item: {
          userID: uuid.v4(),
          demographic: JSON.stringify({
            name: faker.name.findName(),
            yob: Math.round(Math.random() * 100 + 1950),
            gender: faker.random.arrayElement(["male", "female"]),
            avatar: faker.random.image(),
            weight: Math.round(Math.random() * 10 + 50),
            height: Math.round(Math.random() * 100 + 100),
            diabetesStatus: faker.random.arrayElement([
              "healthy",
              "preDiabetes",
              "juniorDiabetes",
              "seniorDiabetes",
            ]),
          }),
          status: faker.random.arrayElement(["CONFIRMED", "UNCONFIRMED"]),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _lastChangedAt: new Date().toISOString(),
          _deleted: false,
          _version: 1,
        },
      })
      .promise();
  }
}
