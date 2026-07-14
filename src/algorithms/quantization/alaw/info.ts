import { createQuantizationInfo } from "../shared/info";

export const info = createQuantizationInfo({
  "id": "quant.alaw",
  "name": "فشرده‌سازی A-law",
  "shortName": "A-law",
  "category": "quantization",
  "summary": "Companding استاندارد صوت",
  "theory": "A-law نسخه‌ای از کوانتیزه‌سازی لگاریتمی است که در سامانه‌های تلفنی کاربرد دارد.",
  "input": "samples",
  "output": "samples",
  "operation": "quant-alaw",
  "params": [
    {
      "key": "levels",
      "label": "تعداد سطوح",
      "type": "select",
      "default": "16",
      "options": [
        {
          "label": "8 سطح",
          "value": "8"
        },
        {
          "label": "16 سطح",
          "value": "16"
        },
        {
          "label": "32 سطح",
          "value": "32"
        },
        {
          "label": "256 سطح",
          "value": "256"
        }
      ]
    }
  ],
  "fidelity": "exact",
  "tags": []
});
