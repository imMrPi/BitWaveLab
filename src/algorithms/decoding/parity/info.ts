import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.parity",
  "name": "Parity Checker",
  "shortName": "Parity Check",
  "category": "decoding",
  "summary": "بررسی توازن و حذف بیت افزوده",
  "theory": "توازن خطاهای با تعداد فرد را کشف می‌کند اما تصحیح انجام نمی‌دهد.",
  "input": "bits",
  "output": "bits",
  "operation": "decode-parity",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
