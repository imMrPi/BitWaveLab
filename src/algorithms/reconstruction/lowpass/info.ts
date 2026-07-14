import { createReconstructionInfo } from "../shared/info";

export const info = createReconstructionInfo({
  "id": "recon.lowpass",
  "name": "Low-pass Reconstruction",
  "shortName": "LPF",
  "category": "reconstruction",
  "summary": "هموارسازی خروجی DAC",
  "theory": "فیلتر پایین‌گذر مؤلفه‌های تصویری ناشی از نمونه‌برداری را تضعیف می‌کند.",
  "input": "samples",
  "output": "samples",
  "operation": "recon-lowpass",
  "params": [
    {
      "key": "window",
      "label": "طول فیلتر",
      "type": "range",
      "default": 7,
      "min": 3,
      "max": 31,
      "step": 2
    }
  ],
  "fidelity": "exact",
  "tags": []
});
