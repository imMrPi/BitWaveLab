import { createReceiverInfo } from "../shared/info";

export const info = createReceiverInfo({
  "id": "rx.map",
  "name": "MAP Detector",
  "shortName": "MAP",
  "category": "receiver",
  "summary": "تصمیم با احتمال پیشین",
  "theory": "MAP حاصل‌ضرب likelihood و prior را بیشینه می‌کند.",
  "input": "samples",
  "output": "bits",
  "operation": "rx-threshold",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
