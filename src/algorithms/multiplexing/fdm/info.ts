import { createMultiplexingInfo } from "../shared/info";

export const info = createMultiplexingInfo({
  "id": "mux.fdm",
  "name": "Frequency Division Multiplexing",
  "shortName": "FDM",
  "category": "multiplexing",
  "summary": "جابجایی جریان‌ها به باندهای جدا",
  "theory": "هر جریان یک زیرحامل و پنجره فرکانسی اختصاصی می‌گیرد.",
  "input": "samples",
  "output": "samples",
  "operation": "mux-fdm",
  "params": [
    {
      "key": "offset",
      "label": "فاصله زیرحامل",
      "type": "range",
      "default": 800,
      "min": 100,
      "max": 3000,
      "step": 100,
      "unit": "Hz"
    }
  ],
  "fidelity": "exact",
  "tags": []
});
