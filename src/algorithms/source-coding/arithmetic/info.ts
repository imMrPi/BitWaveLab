import { createSourceCodingInfo } from "../shared/info";

export const info = createSourceCodingInfo({
  "id": "source.arithmetic",
  "name": "Arithmetic Coding",
  "shortName": "Arithmetic",
  "category": "source-coding",
  "summary": "نگاشت کل پیام به یک بازه احتمالی",
  "theory": "بازده آن می‌تواند به آنتروپی نزدیک‌تر از کدهای با طول صحیح شود.",
  "input": "bits",
  "output": "bits",
  "operation": "compression-model",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
