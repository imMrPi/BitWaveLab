import { createReceiverInfo } from "../shared/info";

export const info = createReceiverInfo({
  "id": "rx.equalizer",
  "name": "MMSE Equalizer",
  "shortName": "MMSE",
  "category": "receiver",
  "summary": "کاهش ISI با موازنه نویز",
  "theory": "MMSE هم اعوجاج کانال و هم تقویت نویز را در معیار خطا لحاظ می‌کند.",
  "input": "samples",
  "output": "samples",
  "operation": "rx-equalizer",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
