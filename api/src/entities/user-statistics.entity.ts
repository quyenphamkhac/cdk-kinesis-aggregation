export interface UserStatistics {
  pk: string; // partition key
  sk: string; // sort key
  byGender: GenderStatistics;
  byYOB: YOBStatistics;
  byDiabetesStatus: DiabetesStatusStatistics;
  typename: string;
  version: number;
}

export interface GenderStatistics {
  male: number;
  female: number;
  unknown: number;
}

export interface YOBStatistics {
  [key: string]: number;
}

export interface DiabetesStatusStatistics {
  [key: string]: number;
}
