import { createLineCodingInfo } from "../shared/info";

export const info = createLineCodingInfo({
  "id": "line.unipolar",
  "name": "Unipolar NRZ",
  "shortName": "Uni NRZ",
  "category": "line-coding",
  "summary": "صفر بدون ولتاژ و یک سطح مثبت",
  "theory": "ساده است اما مؤلفه DC زیاد و هم‌زمانی ضعیف دارد.",
  "input": "bits",
  "output": "samples",
  "operation": "line-unipolar",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
