import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.hamming",
  "name": "Hamming Decoder",
  "shortName": "Hamming Dec",
  "category": "decoding",
  "summary": "Syndrome و اصلاح تک‌بیت",
  "theory": "Syndrome مکان خطا را در کدواژه Hamming مشخص می‌کند.",
  "input": "bits",
  "output": "bits",
  "operation": "decode-hamming",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
