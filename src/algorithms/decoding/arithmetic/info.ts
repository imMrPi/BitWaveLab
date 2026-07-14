import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.arithmetic",
  "name": "Arithmetic Decoder",
  "shortName": "Arithmetic Dec",
  "category": "decoding",
  "summary": "بازیابی پیام از بازه احتمالی",
  "theory": "مدل احتمال مشترک Encoder و Decoder بازه را نمادبه‌نماد محدود می‌کند.",
  "input": "bits",
  "output": "bits",
  "operation": "passthrough",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
