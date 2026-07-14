import { createChannelInfo } from "../shared/info";

export const info = createChannelInfo({
  "id": "channel.rayleigh",
  "name": "Rayleigh Fading",
  "shortName": "Rayleigh",
  "category": "channel",
  "summary": "محو شدگی بدون مسیر مستقیم",
  "theory": "دامنه کانال از مجموع مؤلفه‌های پراکنده حاصل می‌شود.",
  "input": "samples",
  "output": "samples",
  "operation": "channel-rayleigh",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
