import { createSamplingInfo } from "../shared/info";

export const info = createSamplingInfo({
  "id": "sampling.antialias",
  "name": "Anti-alias Filter",
  "shortName": "Anti-alias",
  "category": "sampling",
  "summary": "محدودکردن باند قبل از ADC",
  "theory": "فرکانس‌های بالاتر از نایکوئیست پیش از نمونه‌برداری حذف می‌شوند.",
  "input": "samples",
  "output": "samples",
  "operation": "recon-lowpass",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
