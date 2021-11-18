import { UserStatistics } from "../entities/user-statistics.entity";
import { SortDirection } from "../types/common";

export interface UserStatisticsListResponse {
  items: UserStatistics[];
  limit: number;
  nextToken: string | null;
}

export interface UserStatisticsQuery {
  from: string;
  to: string;
  search?: string;
  limit: number;
  sort: SortDirection;
}
