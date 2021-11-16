export interface User {
  userID: string;
  demographic?: string;
  setting?: string;
  screeningSurvey?: string;
  diagnosisSurvey?: string;
  goalSurvey?: string;
  activities?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  _lastChangedAt: Date;
  _deleted: boolean;
  _version: number;
}

export interface UserListReponse {
  items: User[];
  limit: number;
  nextToken: string | null;
}

export interface UserV1 {
  demographic: UserDemographic;
  setting: UserSetting;
  screeningSurvey: UserScreeningSurvey;
  diagnosisSurvey: UserDiagnosisSurvey;
  goalSurvey: UserGoalSurvey;
  activities: UserActivity[];
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  _lastChangedAt: Date;
  _deleted: boolean;
  _version: number;
}

export interface UserDemographic {}

export interface UserSetting {}

export interface UserScreeningSurvey {}

export interface UserDiagnosisSurvey {}

export interface UserGoalSurvey {}

export interface UserActivity {}

export type UserStatus =
  | "UNCONFIRMED"
  | "CONFIRMED"
  | "ARCHIVED"
  | "COMPROMISED"
  | "UNKNOWN"
  | "RESET_REQUIRED"
  | "FORCE_CHANGE_PASSWORD"
  | undefined;
