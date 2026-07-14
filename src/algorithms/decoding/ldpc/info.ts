import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.ldpc",
  "name": "LDPC Decoder",
  "shortName": "LDPC Dec",
  "category": "decoding",
  "summary": "Message Passing روی Tanner Graph",
  "theory": "پیام‌های LLR میان Nodeهای متغیر و بررسی تا برآورده‌شدن Parity Check تکرار می‌شوند.",
  "input": "bits",
  "output": "bits",
  "operation": "decode-fecmodel",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
