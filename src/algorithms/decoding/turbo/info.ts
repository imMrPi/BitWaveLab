import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.turbo",
  "name": "Turbo Decoder",
  "shortName": "Turbo Dec",
  "category": "decoding",
  "summary": "رمزگشایی تکراری اطلاعات نرم",
  "theory": "دو دیکدر SISO اطلاعات Extrinsic را تا همگرایی مبادله می‌کنند.",
  "input": "bits",
  "output": "bits",
  "operation": "decode-fecmodel",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
