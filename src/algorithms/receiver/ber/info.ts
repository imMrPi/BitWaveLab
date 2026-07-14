import { createReceiverInfo } from "../shared/info";

export const info = createReceiverInfo({
  "id": "rx.ber",
  "name": "BER Analyzer",
  "shortName": "BER",
  "category": "receiver",
  "summary": "مقایسه بیت ارسالی و دریافتی",
  "theory": "نرخ خطای بیت برابر تعداد بیت‌های متفاوت تقسیم بر کل بیت‌های مقایسه‌شده است.",
  "input": "bits",
  "output": "metrics",
  "operation": "rx-ber",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
