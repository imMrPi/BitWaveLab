import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.iterative",
  "name": "Iterative Decoding",
  "shortName": "Iterative",
  "category": "decoding",
  "summary": "تبادل پیام نرم",
  "theory": "Turbo و LDPC با تکرار پیام‌های احتمال به جواب همگرا می‌شوند.",
  "input": "bits",
  "output": "bits",
  "operation": "passthrough",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
