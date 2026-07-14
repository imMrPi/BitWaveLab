import { createSamplingInfo } from "../shared/info";

export const info = createSamplingInfo({
  "id": "sampling.decimate",
  "name": "کاهش نرخ نمونه",
  "shortName": "Decimate",
  "category": "sampling",
  "summary": "نگه‌داشتن هر M‌اُمین نمونه",
  "theory": "Decimation بدون فیلتر ضد Aliasing می‌تواند مؤلفه‌های فرکانسی را روی هم بیندازد.",
  "input": "samples",
  "output": "samples",
  "operation": "sampling-decimate",
  "params": [
    {
      "key": "factor",
      "label": "ضریب کاهش",
      "type": "range",
      "default": 2,
      "min": 2,
      "max": 12,
      "step": 1
    }
  ],
  "fidelity": "exact",
  "tags": []
});
