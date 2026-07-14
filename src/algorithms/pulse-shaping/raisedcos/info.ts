import { createPulseShapingInfo } from "../shared/info";

export const info = createPulseShapingInfo({
  "id": "shape.raisedcos",
  "name": "Raised Cosine",
  "shortName": "RC",
  "category": "pulse-shaping",
  "summary": "پالس نایکوئیست با ISI صفر نظری",
  "theory": "Roll-off مصالحه میان پهنای باند و کوتاهی پاسخ ضربه را کنترل می‌کند.",
  "input": "samples",
  "output": "samples",
  "operation": "shape-rc",
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
