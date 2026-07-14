import { createAnalysisInfo } from "../shared/info";

export const info = createAnalysisInfo({
  "id": "analysis.eyediagram",
  "name": "Eye Diagram Probe",
  "shortName": "Eye",
  "category": "analysis",
  "summary": "روی‌هم‌اندازی بازه‌های سمبل",
  "theory": "بازشدگی چشم حاشیه نویز و خطای زمان‌بندی را نشان می‌دهد.",
  "input": "samples",
  "output": "same",
  "operation": "analysis-metrics",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
