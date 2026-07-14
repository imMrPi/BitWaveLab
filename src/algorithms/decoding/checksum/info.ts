import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.checksum",
  "name": "Checksum Verifier",
  "shortName": "Checksum",
  "category": "decoding",
  "summary": "بررسی افزونگی Checksum",
  "theory": "گیرنده Checksum محاسبه‌شده را با مقدار دریافتی مقایسه می‌کند.",
  "input": "bits",
  "output": "bits",
  "operation": "decode-parity",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
