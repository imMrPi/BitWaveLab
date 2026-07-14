import { createAnalysisInfo } from "../shared/info";

export const info = createAnalysisInfo({
  "id": "analysis.scope",
  "name": "Live Signal Monitor",
  "shortName": "Scope",
  "category": "analysis",
  "summary": "نمایش مستقل و هم‌زمان خروجی یک Node",
  "theory": "Scope Monitor داده را تغییر نمی‌دهد؛ یک Probe مستقل می‌سازد تا چند نقطه از Pipeline هم‌زمان روی Canvas دیده شوند.",
  "input": "any",
  "output": "same",
  "operation": "analysis-metrics",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
