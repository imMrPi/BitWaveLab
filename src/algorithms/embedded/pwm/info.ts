import { createEmbeddedInfo } from "../shared/info";

export const info = createEmbeddedInfo({
  "id": "embedded.pwm",
  "name": "PWM Generator",
  "shortName": "PWM",
  "category": "embedded",
  "summary": "تبدیل مقدار به Duty Cycle پالس",
  "theory": "PWM با تغییر نسبت زمان روشن به کل دوره، مقدار میانگین قابل کنترل برای موتور، LED یا DAC ساده ایجاد می‌کند.",
  "input": "samples",
  "output": "samples",
  "operation": "embedded-pwm",
  "params": [
    {
      "key": "carrier",
      "label": "فرکانس PWM",
      "type": "range",
      "default": 500,
      "min": 50,
      "max": 5000,
      "step": 50,
      "unit": "Hz"
    }
  ],
  "fidelity": "exact",
  "tags": []
});
