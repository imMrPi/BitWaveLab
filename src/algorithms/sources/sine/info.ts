import { createSourcesInfo } from "../shared/info";

export const info = createSourcesInfo({
  "id": "source.sine",
  "name": "موج سینوسی",
  "shortName": "Sine",
  "category": "sources",
  "summary": "منبع پایه با دامنه و فرکانس مشخص",
  "theory": "سینوس آجر پایه تحلیل فوریه است و با دامنه، فرکانس و فاز تعریف می‌شود.",
  "input": "none",
  "output": "samples",
  "operation": "source-wave",
  "params": [
    {
      "key": "frequency",
      "label": "فرکانس",
      "type": "range",
      "default": 440,
      "min": 10,
      "max": 3000,
      "step": 10,
      "unit": "Hz"
    },
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
