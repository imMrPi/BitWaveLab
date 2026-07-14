import { createSamplingInfo } from "../shared/info";

export const info = createSamplingInfo({
  "id": "sampling.interpolate",
  "name": "افزایش نرخ نمونه",
  "shortName": "Interpolate",
  "category": "sampling",
  "summary": "افزودن و تخمین نمونه‌های میانی",
  "theory": "Interpolation نرخ نمایش گسسته را افزایش می‌دهد و باید با فیلتر بازسازی همراه شود.",
  "input": "samples",
  "output": "samples",
  "operation": "sampling-interpolate",
  "params": [
    {
      "key": "factor",
      "label": "ضریب افزایش",
      "type": "range",
      "default": 2,
      "min": 2,
      "max": 8,
      "step": 1
    }
  ],
  "fidelity": "exact",
  "tags": []
});
