import { createSamplingInfo } from "../shared/info";

export const info = createSamplingInfo({
  "id": "sampling.uniform",
  "name": "نمونه‌برداری یکنواخت",
  "shortName": "Sample",
  "category": "sampling",
  "summary": "برداشت نمونه با فاصله زمانی ثابت",
  "theory": "طبق قضیه نایکوئیست، نرخ نمونه باید بیش از دو برابر بیشترین فرکانس مؤثر باشد.",
  "input": "samples",
  "output": "samples",
  "operation": "sampling-uniform",
  "params": [
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
