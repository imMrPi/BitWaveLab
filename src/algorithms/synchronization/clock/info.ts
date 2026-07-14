import { createSynchronizationInfo } from "../shared/info";

export const info = createSynchronizationInfo({
  "id": "sync.clock",
  "name": "Clock Recovery",
  "shortName": "Clock",
  "category": "synchronization",
  "summary": "تخمین لحظه مناسب نمونه‌برداری",
  "theory": "بازیابی کلاک زمان مرکز هر سمبل را از گذارها یا معیار خطا تخمین می‌زند.",
  "input": "samples",
  "output": "samples",
  "operation": "sync-clock",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
