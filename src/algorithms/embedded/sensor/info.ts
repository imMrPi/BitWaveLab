import { createEmbeddedInfo } from "../shared/info";

export const info = createEmbeddedInfo({
  "id": "embedded.sensor",
  "name": "Analog Sensor Source",
  "shortName": "Sensor",
  "category": "embedded",
  "summary": "مدل خروجی سنسور دما، فشار یا زیستی",
  "theory": "سنسور یک کمیت فیزیکی را به ولتاژ یا جریان تبدیل می‌کند؛ نویز، Offset و پهنای باند آن باید پیش از ADC در نظر گرفته شود.",
  "input": "none",
  "output": "samples",
  "operation": "embedded-sensor",
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
      "default": 2000,
      "min": 100,
      "max": 192000,
      "step": 100,
      "unit": "Hz"
    }
  ],
  "fidelity": "exact",
  "tags": []
});
