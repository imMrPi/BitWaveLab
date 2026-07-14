import { createScramblingInfo } from "../shared/info";

export const info = createScramblingInfo({
  "id": "scramble.hdb3",
  "name": "HDB3",
  "shortName": "HDB3",
  "category": "scrambling",
  "summary": "محدودکردن اجرای صفرها",
  "theory": "هر چهار صفر با الگویی وابسته به قطبیت و تعداد پالس‌ها جایگزین می‌شود.",
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
