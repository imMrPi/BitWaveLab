import { createAnalysisInfo } from "../shared/info";

export const info = createAnalysisInfo({
  "id": "analysis.hilbert",
  "name": "Hilbert Transform",
  "shortName": "Hilbert",
  "category": "analysis",
  "summary": "ساخت سیگنال تحلیلی",
  "theory": "مولفه موهومی متعامد برای استخراج پوش و فاز لحظه‌ای ساخته می‌شود.",
  "input": "samples",
  "output": "same",
  "operation": "passthrough",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
