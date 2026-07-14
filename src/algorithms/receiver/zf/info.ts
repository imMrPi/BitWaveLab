import { createReceiverInfo } from "../shared/info";

export const info = createReceiverInfo({
  "id": "rx.zf",
  "name": "Zero-Forcing Equalizer",
  "shortName": "ZF",
  "category": "receiver",
  "summary": "معکوس‌کردن پاسخ کانال",
  "theory": "ISI را حذف می‌کند اما ممکن است نویز را در Nullهای کانال تقویت کند.",
  "input": "samples",
  "output": "samples",
  "operation": "rx-equalizer",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
