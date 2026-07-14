import { createSamplingInfo } from "../shared/info";

export const info = createSamplingInfo({
  "id": "sampling.nonuniform",
  "name": "Non-uniform Sampling",
  "shortName": "Nonuniform",
  "category": "sampling",
  "summary": "نمونه‌برداری با فواصل متغیر",
  "theory": "برای سیگنال‌های خاص یا سامانه‌های رویدادمحور استفاده می‌شود.",
  "input": "samples",
  "output": "samples",
  "operation": "sampling-uniform",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
