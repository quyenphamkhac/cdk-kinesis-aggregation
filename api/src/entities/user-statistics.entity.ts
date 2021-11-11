export interface UserStatistics {
  pk: string; // partition key
  sk: string; // sort key
  byGender: GenderCount;
  byBirthYear: BirthYearCount;
  byDiabetesType: DiabetesTypesCount;
  timestamp: Date;
}

export interface GenderCount {
  male: Number;
  female: Number;
}

export interface BirthYearCount {
  ">2000": Number;
  "1990-2000": Number;
  "1980-1990": Number;
  "1970-1980": Number;
  "1960-1970": Number;
  "<1960": Number;
}

export interface DiabetesTypesCount {
  healthy: Number;
  preDiabetes: Number;
  type1: Number;
  type2: Number;
}
