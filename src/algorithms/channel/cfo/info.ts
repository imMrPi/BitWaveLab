import { createChannelInfo } from "../shared/info";

export const info = createChannelInfo({
  "id": "channel.cfo",
  "name": "Carrier Frequency Offset",
  "shortName": "CFO",
  "category": "channel",
  "summary": "خطای فرکانس نوسان‌ساز",
  "theory": "CFO موجب چرخش پیوسته صورت‌فلکی و از دست رفتن تعامد OFDM می‌شود.",
  "input": "samples",
  "output": "samples",
  "operation": "channel-cfo",
  "params": [
    {
      "key": "offset",
      "label": "خطای فرکانس",
      "type": "range",
      "default": 30,
      "min": -200,
      "max": 200,
      "step": 5,
      "unit": "Hz"
    }
  ],
  "fidelity": "exact",
  "tags": []
});
