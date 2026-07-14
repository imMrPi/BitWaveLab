import { createChannelInfo } from "../shared/info";

export const info = createChannelInfo({
  "id": "channel.awgn",
  "name": "کانال AWGN",
  "shortName": "AWGN",
  "category": "channel",
  "summary": "افزودن نویز سفید گاوسی",
  "theory": "مدل پایه کانال، نویز مستقل با PSD ثابت را به سیگنال اضافه می‌کند.",
  "input": "samples",
  "output": "samples",
  "operation": "channel-awgn",
  "params": [
    {
      "key": "snr",
      "label": "نسبت سیگنال به نویز",
      "type": "range",
      "default": 12,
      "min": -4,
      "max": 36,
      "step": 1,
      "unit": "dB"
    }
  ],
  "fidelity": "exact",
  "tags": []
});
