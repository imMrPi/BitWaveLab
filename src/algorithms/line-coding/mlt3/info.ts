import { createLineCodingInfo } from "../shared/info";

export const info = createLineCodingInfo({
  "id": "line.mlt3",
  "name": "MLT-3",
  "shortName": "MLT-3",
  "category": "line-coding",
  "summary": "نگاشت بیت با روش MLT-3",
  "theory": "کد خط شکل الکتریکی نمایش بیت را تعیین می‌کند و روی مؤلفه DC، هم‌زمانی و پهنای باند اثر دارد.",
  "input": "bits",
  "output": "samples",
  "operation": "line-mlt3",
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
