import { createPulseShapingInfo } from "../shared/info";

export const info = createPulseShapingInfo({
  "id": "shape.rect",
  "name": "Rectangular Pulse",
  "shortName": "Rect",
  "category": "pulse-shaping",
  "summary": "پالس بدون نرم‌سازی",
  "theory": "لبه‌های تیز طیف پهنی ایجاد می‌کنند و نسبت به محدودیت کانال حساس‌اند.",
  "input": "samples",
  "output": "samples",
  "operation": "shape-rect",
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
