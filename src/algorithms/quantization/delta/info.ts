import { createQuantizationInfo } from "../shared/info";

export const info = createQuantizationInfo({
  "id": "quant.delta",
  "name": "Delta Modulation",
  "shortName": "Delta",
  "category": "quantization",
  "summary": "ارسال جهت تغییر نمونه",
  "theory": "هر بیت افزایش یا کاهش تخمین بازسازی‌شده را مشخص می‌کند.",
  "input": "samples",
  "output": "bits",
  "operation": "pcm",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
