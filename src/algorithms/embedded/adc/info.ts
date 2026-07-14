import { createEmbeddedInfo } from "../shared/info";

export const info = createEmbeddedInfo({
  "id": "embedded.adc",
  "name": "MCU ADC",
  "shortName": "ADC",
  "category": "embedded",
  "summary": "نمونه‌برداری و کوانتیزه با تفکیک‌پذیری MCU",
  "theory": "ADC میکروکنترلر ولتاژ ورودی را با نرخ نمونه و تعداد بیت محدود به کد دیجیتال تبدیل می‌کند.",
  "input": "samples",
  "output": "samples",
  "operation": "embedded-adc",
  "params": [
    {
      "key": "resolution",
      "label": "تفکیک‌پذیری ADC",
      "type": "select",
      "default": "12",
      "options": [
        {
          "label": "8-bit",
          "value": "8"
        },
        {
          "label": "10-bit",
          "value": "10"
        },
        {
          "label": "12-bit",
          "value": "12"
        },
        {
          "label": "16-bit",
          "value": "16"
        }
      ]
    },
    {
      "key": "sampleRate",
      "label": "نرخ نمونه‌برداری",
      "type": "number",
      "default": 1000,
      "min": 100,
      "max": 192000,
      "step": 100,
      "unit": "Hz"
    }
  ],
  "fidelity": "exact",
  "tags": []
});
