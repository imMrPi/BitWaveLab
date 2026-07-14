import { createLineCodingInfo } from "../shared/info";

export const info = createLineCodingInfo({
  "id": "line.nrzi",
  "name": "NRZ-I",
  "shortName": "NRZ-I",
  "category": "line-coding",
  "summary": "نگاشت بیت با روش NRZ-I",
  "theory": "کد خط شکل الکتریکی نمایش بیت را تعیین می‌کند و روی مؤلفه DC، هم‌زمانی و پهنای باند اثر دارد.",
  "input": "bits",
  "output": "samples",
  "operation": "line-nrzi",
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
