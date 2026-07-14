import { createSynchronizationInfo } from "../shared/info";

export const info = createSynchronizationInfo({
  "id": "sync.agc",
  "name": "Automatic Gain Control",
  "shortName": "AGC",
  "category": "synchronization",
  "summary": "نرمال‌سازی توان دریافتی",
  "theory": "AGC بهره را طوری تنظیم می‌کند که آشکارساز در محدوده مناسب کار کند.",
  "input": "samples",
  "output": "samples",
  "operation": "sync-agc",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
