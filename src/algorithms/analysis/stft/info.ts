import { createAnalysisInfo } from "../shared/info";

export const info = createAnalysisInfo({
  "id": "analysis.stft",
  "name": "STFT و Spectrogram",
  "shortName": "STFT",
  "category": "analysis",
  "summary": "تحلیل زمان–فرکانس",
  "theory": "پنجره کوتاه روی سیگنال حرکت می‌کند تا تغییرات طیف در زمان دیده شود.",
  "input": "samples",
  "output": "same",
  "operation": "analysis-fft",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
