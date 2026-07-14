import { createPulseShapingInfo } from "../shared/info";

export const info = createPulseShapingInfo({
  "id": "shape.gaussian",
  "name": "Gaussian Shaping",
  "shortName": "Gaussian",
  "category": "pulse-shaping",
  "summary": "نرم‌سازی پالس با پاسخ گاوسی",
  "theory": "در GMSK برای کاهش لوب‌های طیفی و تغییر فاز پیوسته استفاده می‌شود.",
  "input": "samples",
  "output": "samples",
  "operation": "shape-gaussian",
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
