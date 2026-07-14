import { createPulseShapingInfo } from "../shared/info";

export const info = createPulseShapingInfo({
  "id": "shape.rrc",
  "name": "Root Raised Cosine",
  "shortName": "RRC",
  "category": "pulse-shaping",
  "summary": "نصف فیلتر نایکوئیست در فرستنده",
  "theory": "قرار دادن RRC مشابه در گیرنده پاسخ کلی Raised Cosine می‌سازد.",
  "input": "samples",
  "output": "samples",
  "operation": "shape-rrc",
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
    },
    {
      "key": "rolloff",
      "label": "ضریب Roll-off",
      "type": "range",
      "default": 0.35,
      "min": 0.05,
      "max": 1,
      "step": 0.05
    }
  ],
  "fidelity": "exact",
  "tags": []
});
