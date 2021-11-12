import { AttributeMap } from "../types/common";
export function parseJson(jsonstr: string): AttributeMap {
  try {
    const payload = JSON.parse(jsonstr);
    return payload;
  } catch (error) {
    return {};
  }
}

export function encodeNextToken(key: AttributeMap | undefined): string | null {
  if (!key) return null;
  return JSON.stringify(key);
}

export function parseNextToken(nextToken: string): AttributeMap | undefined {
  try {
    const key = JSON.parse(nextToken);
    return key;
  } catch (error) {
    return undefined;
  }
}
