import { createSynchronizationInfo } from "../shared/info";

export const info = createSynchronizationInfo({
  "id": "sync.carrier",
  "name": "Carrier Recovery",
  "shortName": "Carrier",
  "category": "synchronization",
  "summary": "تصحیح خطای فاز و فرکانس",
  "theory": "حلقه Costas یا PLL مرجع حامل گیرنده را با سیگنال هم‌راستا می‌کند.",
  "input": "samples",
  "output": "samples",
  "operation": "sync-carrier",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
