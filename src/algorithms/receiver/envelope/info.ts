import { createReceiverInfo } from "../shared/info";

export const info = createReceiverInfo({
  "id": "rx.envelope",
  "name": "Envelope Detector",
  "shortName": "Envelope",
  "category": "receiver",
  "summary": "آشکارسازی غیرهمدوس دامنه",
  "theory": "پوش سیگنال بدون بازیابی فاز حامل استخراج می‌شود.",
  "input": "samples",
  "output": "samples",
  "operation": "envelope",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
