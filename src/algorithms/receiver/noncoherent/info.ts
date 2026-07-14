import { createReceiverInfo } from "../shared/info";

export const info = createReceiverInfo({
  "id": "rx.noncoherent",
  "name": "Non-coherent Demodulator",
  "shortName": "Non-coh.",
  "category": "receiver",
  "summary": "بازیابی داده بدون فاز مطلق حامل",
  "theory": "برای ASK، FSK و DPSK می‌توان از انرژی، پوش یا اختلاف فاز تصمیم گرفت.",
  "input": "samples",
  "output": "bits",
  "operation": "rx-threshold",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
