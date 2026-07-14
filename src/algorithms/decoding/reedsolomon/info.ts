import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.reedsolomon",
  "name": "Reed–Solomon Decoder",
  "shortName": "RS Decode",
  "category": "decoding",
  "summary": "تصحیح خطای نمادی و Burst",
  "theory": "Syndrome، مکان‌یابی و ارزیابی خطا کدواژه را در میدان متناهی بازسازی می‌کنند.",
  "input": "bits",
  "output": "bits",
  "operation": "decode-fecmodel",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
