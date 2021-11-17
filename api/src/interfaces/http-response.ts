export interface GetItemReponse<T> {
  data: T;
}

export interface ListItemReponse<T> {
  items: T[];
  limit: number;
  nextToken: string | null;
}
