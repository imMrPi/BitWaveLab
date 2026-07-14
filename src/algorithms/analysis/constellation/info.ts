import { createAnalysisInfo } from "../shared/info";

export const info = createAnalysisInfo({
  "id": "analysis.constellation",
  "name": "Constellation Probe",
  "shortName": "I/Q",
  "category": "analysis",
  "summary": "نمایش هندسی سمبل‌ها",
  "theory": "فاصله نقاط و پراکندگی آن‌ها کیفیت تصمیم را نشان می‌دهد.",
  "input": "symbols",
  "output": "same",
  "operation": "analysis-metrics",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
