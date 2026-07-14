import { createAnalysisInfo } from "../shared/info";

export const info = createAnalysisInfo({
  "id": "analysis.psd",
  "name": "چگالی طیفی توان",
  "shortName": "PSD",
  "category": "analysis",
  "summary": "توزیع توان در فرکانس",
  "theory": "PSD نشان می‌دهد توان متوسط سیگنال در هر ناحیه فرکانسی چگونه توزیع شده است.",
  "input": "samples",
  "output": "same",
  "operation": "analysis-psd",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
