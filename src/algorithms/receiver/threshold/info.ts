import { createReceiverInfo } from "../shared/info";

export const info = createReceiverInfo({
  "id": "rx.threshold",
  "name": "Threshold Detector",
  "shortName": "Decision",
  "category": "receiver",
  "summary": "تصمیم سخت صفر یا یک",
  "theory": "میانگین هر بازه سمبل با آستانه مقایسه می‌شود و بیت تخمین‌زده‌شده تولید می‌گردد.",
  "input": "samples",
  "output": "bits",
  "operation": "rx-threshold",
  "params": [
    {
      "key": "threshold",
      "label": "آستانه تصمیم",
      "type": "range",
      "default": 0,
      "min": -1,
      "max": 1,
      "step": 0.05
    }
  ],
  "fidelity": "exact",
  "tags": []
});
