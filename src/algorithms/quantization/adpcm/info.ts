import { createQuantizationInfo } from "../shared/info";

export const info = createQuantizationInfo({
  "id": "quant.adpcm",
  "name": "Adaptive DPCM",
  "shortName": "ADPCM",
  "category": "quantization",
  "summary": "گام تطبیقی برای اختلاف نمونه",
  "theory": "اندازه گام بر اساس رفتار اخیر سیگنال تغییر می‌کند.",
  "input": "samples",
  "output": "samples",
  "operation": "dpcm",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
