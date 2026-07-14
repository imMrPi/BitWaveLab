import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.rle",
  "name": "Run-Length Decoder",
  "shortName": "RLE Decode",
  "category": "decoding",
  "summary": "بازسازی اجراهای فشرده",
  "theory": "هر نماد همراه شمارنده‌اش دوباره به دنباله اصلی گسترش می‌یابد.",
  "input": "bits",
  "output": "bits",
  "operation": "decode-rle",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
