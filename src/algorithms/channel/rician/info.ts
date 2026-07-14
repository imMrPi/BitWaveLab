import { createChannelInfo } from "../shared/info";

export const info = createChannelInfo({
  "id": "channel.rician",
  "name": "Rician Fading",
  "shortName": "Rician",
  "category": "channel",
  "summary": "محو شدگی با مسیر مستقیم",
  "theory": "پارامتر K قدرت مسیر مستقیم را نسبت به مسیرهای پراکنده مشخص می‌کند.",
  "input": "samples",
  "output": "samples",
  "operation": "channel-rician",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
