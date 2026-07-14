import { createChannelInfo } from "../shared/info";

export const info = createChannelInfo({
  "id": "channel.multipath",
  "name": "کانال چندمسیری",
  "shortName": "Multipath",
  "category": "channel",
  "summary": "جمع نسخه‌های تأخیردار سیگنال",
  "theory": "بازتاب‌ها پاسخ ضربه چندشاخه می‌سازند و می‌توانند ISI ایجاد کنند.",
  "input": "samples",
  "output": "samples",
  "operation": "channel-multipath",
  "params": [
    {
      "key": "echo",
      "label": "ضریب مسیر دوم",
      "type": "range",
      "default": 0.45,
      "min": 0,
      "max": 0.9,
      "step": 0.05
    }
  ],
  "fidelity": "exact",
  "tags": []
});
