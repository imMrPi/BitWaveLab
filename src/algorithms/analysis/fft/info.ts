import { createAnalysisInfo } from "../shared/info";

export const info = createAnalysisInfo({
  "id": "analysis.fft",
  "name": "FFT و طیف دامنه",
  "shortName": "FFT",
  "category": "analysis",
  "summary": "تبدیل سریع حوزه زمان به فرکانس",
  "theory": "FFT الگوریتم سریع محاسبه DFT است؛ خروجی آن دامنه و فاز مؤلفه‌های فرکانسی را آشکار می‌کند.",
  "input": "samples",
  "output": "same",
  "operation": "analysis-fft",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
