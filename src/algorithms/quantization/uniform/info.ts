import { createQuantizationInfo } from "../shared/info";

export const info = createQuantizationInfo({
  "id": "quant.uniform",
  "name": "کوانتیزه‌سازی یکنواخت",
  "shortName": "Quantize",
  "category": "quantization",
  "summary": "نگاشت دامنه به سطوح محدود",
  "theory": "فاصله سطوح ثابت است و خطای کوانتیزه‌سازی به تفاضل مقدار واقعی و سطح انتخاب‌شده گفته می‌شود.",
  "input": "samples",
  "output": "samples",
  "operation": "quant-uniform",
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
