import { AttributeMap } from "../types/common";
export function parseJson(jsonstr: string): AttributeMap {
  try {
    const payload = JSON.parse(jsonstr);
    return payload;
  } catch (error) {
    return {};
  }
}
