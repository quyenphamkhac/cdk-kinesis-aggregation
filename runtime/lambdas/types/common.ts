export enum TimeZone {
  VN_HCM = 7,
}

export type AttributeMap = { [key: string]: any };

export type YOBCounter = {
  [key: string]: number;
};

export type DiabetesStatusCounter = {
  [key: string]: number;
};

export type GenderCounter = {
  male: number;
  female: number;
  unknown: number;
};

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  UNKNOWN = "unknown",
}

export enum ReportType {
  USER = "USER_STATISTICS",
}

export enum TypeName {
  UserStatistics = "UserStatistics",
}

export const ModelKeys = ["pk", "sk", "typename"];
