import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.descramble",
  "name": "Polynomial Descrambler",
  "shortName": "Descramble",
  "category": "decoding",
  "summary": "معکوس‌کردن سفیدسازی بیت",
  "theory": "با همان چندجمله‌ای و حالت اولیه، XOR دوباره داده اصلی را بازیابی می‌کند.",
  "input": "bits",
  "output": "bits",
  "operation": "decode-descramble",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
