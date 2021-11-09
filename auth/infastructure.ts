import { Construct, Duration } from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";

const { PROJECT_NAME: projectName, STAGE: stage } = process.env;

class Auth extends Construct {
  pool: cognito.UserPool;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const pool = new cognito.UserPool(this, `${projectName}ManagerUserPool`, {
      userPoolName: `${projectName}-UserPool-${stage}`,
      selfSignUpEnabled: false,
      userInvitation: {
        emailSubject: "Invite to join our awesome Abcs app!",
        emailBody:
          "Hello {username}, you have been invited to join our awesome app! Your temporary password is {####}",
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      signInAliases: {
        username: true,
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        fullname: {
          required: true,
          mutable: true,
        },
        address: {
          required: false,
          mutable: true,
        },
      },
      customAttributes: {
        employeeId: new cognito.StringAttribute({
          minLen: 5,
          maxLen: 15,
          mutable: false,
        }),
      },
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: Duration.days(3),
      },
    });

    this.pool = pool;
  }
}

export default Auth;
