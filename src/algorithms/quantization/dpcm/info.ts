import { createQuantizationInfo } from "../shared/info";

export const info = createQuantizationInfo({
  "id": "quant.dpcm",
  "name": "کدگذاری تفاضلی DPCM",
  "shortName": "DPCM",
  "category": "quantization",
  "summary": "کدگذاری اختلاف نمونه‌های متوالی",
  "theory": "با استفاده از همبستگی زمانی، به‌جای مقدار مطلق نمونه اختلاف آن ارسال می‌شود.",
  "input": "samples",
  "output": "samples",
  "operation": "dpcm",
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
