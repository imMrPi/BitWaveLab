import { createLineCodingInfo } from "../shared/info";

export const info = createLineCodingInfo({
  "id": "line.diffmanchester",
  "name": "Differential Manchester",
  "shortName": "Diff. Man",
  "category": "line-coding",
  "summary": "نگاشت بیت با روش Differential Manchester",
  "theory": "کد خط شکل الکتریکی نمایش بیت را تعیین می‌کند و روی مؤلفه DC، هم‌زمانی و پهنای باند اثر دارد.",
  "input": "bits",
  "output": "samples",
  "operation": "line-diffmanchester",
  "params": [
    {
      "key": "sps",
      "label": "نمونه در هر سمبل",
      "type": "range",
      "default": 16,
      "min": 4,
      "max": 48,
      "step": 1,
      "unit": "sps"
    }
  ],
  "fidelity": "exact",
  "tags": []
});
