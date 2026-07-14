import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.huffman",
  "name": "Huffman Decoder",
  "shortName": "Huffman Dec",
  "category": "decoding",
  "summary": "پیمایش درخت کد پیشوندی",
  "theory": "بیت‌ها تا رسیدن به برگ درخت خوانده و نمادهای منبع بازسازی می‌شوند.",
  "input": "bits",
  "output": "bits",
  "operation": "passthrough",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
