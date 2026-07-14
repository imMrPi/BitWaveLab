import { createSynchronizationInfo } from "../shared/info";

export const info = createSynchronizationInfo({
  "id": "sync.symbol",
  "name": "Symbol Synchronization",
  "shortName": "Symbol Sync",
  "category": "synchronization",
  "summary": "یافتن مرکز سمبل",
  "theory": "الگوریتم‌هایی مانند Gardner خطای زمان‌بندی را از نمونه‌های میانی استخراج می‌کنند.",
  "input": "samples",
  "output": "samples",
  "operation": "sync-clock",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
