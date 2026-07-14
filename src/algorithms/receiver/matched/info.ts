import { createReceiverInfo } from "../shared/info";

export const info = createReceiverInfo({
  "id": "rx.matched",
  "name": "Matched Filter",
  "shortName": "Matched",
  "category": "receiver",
  "summary": "بیشینه‌کردن SNR در لحظه تصمیم",
  "theory": "پاسخ ضربه فیلتر با نسخه زمان‌معکوس مزدوج پالس فرستنده متناسب است.",
  "input": "samples",
  "output": "samples",
  "operation": "rx-matched",
  "params": [
    {
      "key": "sps",
      "label": "نمونه در هر سمبل",
      "type": "range",
      "default": 16,
      "min": 4,
      "max": 48,
      "step": 1,
      "unit": "sps"
    }
  ],
  "fidelity": "exact",
  "tags": []
});
