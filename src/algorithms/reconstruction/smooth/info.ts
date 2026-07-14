import { createReconstructionInfo } from "../shared/info";

export const info = createReconstructionInfo({
  "id": "recon.smooth",
  "name": "Signal Smoothing",
  "shortName": "Smooth",
  "category": "reconstruction",
  "summary": "میانگین متحرک برای کاهش نوسان",
  "theory": "میانگین‌گیری محلی نویز فرکانس بالا را کم می‌کند اما لبه‌ها را نیز نرم می‌کند.",
  "input": "samples",
  "output": "samples",
  "operation": "recon-lowpass",
  "params": [
    {
      "key": "window",
      "label": "پنجره",
      "type": "range",
      "default": 5,
      "min": 3,
      "max": 25,
      "step": 2
    }
  ],
  "fidelity": "exact",
  "tags": []
});
