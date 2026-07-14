import { createSourcesInfo } from "../shared/info";

export const info = createSourcesInfo({
  "id": "source.noise",
  "name": "نویز گاوسی",
  "shortName": "Noise",
  "category": "sources",
  "summary": "منبع تصادفی با Seed ثابت",
  "theory": "نویز سفید گاوسی نمونه‌هایی با توزیع نرمال و طیف توان تقریباً تخت تولید می‌کند.",
  "input": "none",
  "output": "samples",
  "operation": "source-noise",
  "params": [
    {
      "key": "amplitude",
      "label": "دامنه",
      "type": "range",
      "default": 1,
      "min": 0,
      "max": 2,
      "step": 0.05
    },
    {
      "key": "sampleRate",
      "label": "نرخ نمونه‌برداری",
      "type": "number",
      "default": 8000,
      "min": 100,
      "max": 192000,
      "step": 100,
      "unit": "Hz"
    }
  ],
  "fidelity": "exact",
  "tags": []
});
