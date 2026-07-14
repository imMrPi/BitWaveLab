import { createReceiverInfo } from "../shared/info";

export const info = createReceiverInfo({
  "id": "rx.ml",
  "name": "Maximum Likelihood",
  "shortName": "ML",
  "category": "receiver",
  "summary": "انتخاب نزدیک‌ترین سمبل",
  "theory": "در نویز گاوسی، تصمیم ML معادل انتخاب نزدیک‌ترین نقطه صورت‌فلکی است.",
  "input": "samples",
  "output": "bits",
  "operation": "rx-threshold",
  "params": [
    {
      "key": "threshold",
      "label": "آستانه",
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
