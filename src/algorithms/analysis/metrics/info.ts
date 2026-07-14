import { createAnalysisInfo } from "../shared/info";

export const info = createAnalysisInfo({
  "id": "analysis.metrics",
  "name": "سنجش جامع سیگنال",
  "shortName": "Metrics",
  "category": "analysis",
  "summary": "RMS، Peak، DC، پهنای باند و Crest",
  "theory": "یک Probe غیرمخرب است که معیارهای زمانی و طیفی را به متادیتا اضافه می‌کند.",
  "input": "any",
  "output": "same",
  "operation": "analysis-metrics",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
