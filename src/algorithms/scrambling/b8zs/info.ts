import { createScramblingInfo } from "../shared/info";

export const info = createScramblingInfo({
  "id": "scramble.b8zs",
  "name": "B8ZS",
  "shortName": "B8ZS",
  "category": "scrambling",
  "summary": "جایگزینی هشت صفر در AMI",
  "theory": "الگوی نقض دوقطبی کنترل‌شده، گذار لازم برای بازیابی کلاک را ایجاد می‌کند.",
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
  "fidelity": "educational",
  "tags": []
});
