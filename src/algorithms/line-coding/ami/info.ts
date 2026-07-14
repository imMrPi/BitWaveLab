import { createLineCodingInfo } from "../shared/info";

export const info = createLineCodingInfo({
  "id": "line.ami",
  "name": "AMI",
  "shortName": "AMI",
  "category": "line-coding",
  "summary": "نگاشت بیت با روش AMI",
  "theory": "کد خط شکل الکتریکی نمایش بیت را تعیین می‌کند و روی مؤلفه DC، هم‌زمانی و پهنای باند اثر دارد.",
  "input": "bits",
  "output": "samples",
  "operation": "line-ami",
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
