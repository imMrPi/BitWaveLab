import { createSourceCodingInfo } from "../shared/info";

export const info = createSourceCodingInfo({
  "id": "source.rle",
  "name": "Run-Length Encoding",
  "shortName": "RLE",
  "category": "source-coding",
  "summary": "فشرده‌سازی طول اجرا",
  "theory": "دنباله‌های متوالی یکسان با نماد و تعداد تکرار نمایش داده می‌شوند.",
  "input": "bits",
  "output": "bits",
  "operation": "rle",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
