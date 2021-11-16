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
  return Buffer.from(JSON.stringify(key)).toString("base64");
}

export function parseNextToken(nextToken: string): AttributeMap | undefined {
  try {
    return JSON.parse(Buffer.from(nextToken, "base64").toString("ascii"));
  } catch (error) {
    return undefined;
  }
}
