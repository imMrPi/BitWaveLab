import { createQuantizationInfo } from "../shared/info";

export const info = createQuantizationInfo({
  "id": "quant.mulaw",
  "name": "فشرده‌سازی μ-law",
  "shortName": "μ-law",
  "category": "quantization",
  "summary": "کوانتیزه غیرخطی برای دامنه‌های ضعیف",
  "theory": "μ-law دامنه‌های کوچک را با دقت بیشتری نگه می‌دارد و در PCM صوتی رایج است.",
  "input": "samples",
  "output": "samples",
  "operation": "quant-mulaw",
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
