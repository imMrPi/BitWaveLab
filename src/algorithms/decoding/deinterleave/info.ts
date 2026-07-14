import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.deinterleave",
  "name": "Block Deinterleaver",
  "shortName": "Deinterleave",
  "category": "decoding",
  "summary": "بازگرداندن ترتیب اصلی بیت‌ها",
  "theory": "در گیرنده جایگشت Interleaver پیش از Channel Decoder دقیقاً معکوس می‌شود.",
  "input": "bits",
  "output": "bits",
  "operation": "decode-deinterleave",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
