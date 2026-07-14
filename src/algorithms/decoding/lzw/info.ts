import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.lzw",
  "name": "LZW Decoder",
  "shortName": "LZW Decode",
  "category": "decoding",
  "summary": "بازسازی واژه‌نامه همگام",
  "theory": "کدهای دریافتی به عبارت‌ها تبدیل و واژه‌نامه Decoder همزمان ساخته می‌شود.",
  "input": "bits",
  "output": "bits",
  "operation": "passthrough",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
