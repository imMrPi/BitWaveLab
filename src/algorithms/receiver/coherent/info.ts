import { createReceiverInfo } from "../shared/info";

export const info = createReceiverInfo({
  "id": "rx.coherent",
  "name": "Coherent Demodulator",
  "shortName": "Coherent",
  "category": "receiver",
  "summary": "دمدولاسیون با مرجع حامل بازیابی‌شده",
  "theory": "سمبل دریافتی با مرجع فاز هم‌زمان مقایسه و به بیت تبدیل می‌شود.",
  "input": "samples",
  "output": "bits",
  "operation": "rx-threshold",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
