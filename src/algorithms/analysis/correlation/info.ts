import { createAnalysisInfo } from "../shared/info";

export const info = createAnalysisInfo({
  "id": "analysis.correlation",
  "name": "خودهمبستگی",
  "shortName": "ACF",
  "category": "analysis",
  "summary": "اندازه‌گیری شباهت با نسخه تأخیردار",
  "theory": "خودهمبستگی تناوب و حافظه آماری سیگنال را آشکار می‌کند.",
  "input": "samples",
  "output": "same",
  "operation": "analysis-correlation",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
