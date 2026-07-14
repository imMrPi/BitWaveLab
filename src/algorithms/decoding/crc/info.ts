import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.crc",
  "name": "CRC Checker",
  "shortName": "CRC Check",
  "category": "decoding",
  "summary": "بررسی باقی‌مانده فریم",
  "theory": "باقی‌مانده صفر به معنی عبور بررسی CRC است؛ تضمین مطلق نبود خطا نیست.",
  "input": "bits",
  "output": "bits",
  "operation": "decode-crc",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
