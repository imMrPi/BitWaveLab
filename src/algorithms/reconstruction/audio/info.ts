import { createReconstructionInfo } from "../shared/info";

export const info = createReconstructionInfo({
  "id": "recon.audio",
  "name": "Analog Output",
  "shortName": "Analog Out",
  "category": "reconstruction",
  "summary": "خروجی قابل پخش یا مشاهده",
  "theory": "مقیاس، نرخ و محدوده سیگنال برای مبدل فیزیکی آماده می‌شود.",
  "input": "samples",
  "output": "samples",
  "operation": "passthrough",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
