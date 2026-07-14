import { createQuantizationInfo } from "../shared/info";

export const info = createQuantizationInfo({
  "id": "quant.pcm",
  "name": "کدگذاری PCM",
  "shortName": "PCM",
  "category": "quantization",
  "summary": "تبدیل سطوح کوانتیزه به کلمات باینری",
  "theory": "PCM زنجیره نمونه‌برداری، کوانتیزه‌سازی و نمایش دودویی نمونه‌ها را کامل می‌کند.",
  "input": "samples",
  "output": "bits",
  "operation": "pcm",
  "params": [
    {
      "key": "bitsPerSample",
      "label": "بیت در هر نمونه",
      "type": "range",
      "default": 8,
      "min": 3,
      "max": 16,
      "step": 1,
      "unit": "bit"
    }
  ],
  "fidelity": "exact",
  "tags": []
});
