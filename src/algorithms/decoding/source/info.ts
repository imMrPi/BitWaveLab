import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.source",
  "name": "Source Decoder",
  "shortName": "Decompress",
  "category": "decoding",
  "summary": "بازسازی داده فشرده",
  "theory": "دیکدر باید همان مدل و واژه‌نامه فرستنده را برای بازیابی محتوا استفاده کند.",
  "input": "bits",
  "output": "bits",
  "operation": "passthrough",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
