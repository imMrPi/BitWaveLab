import { createChannelInfo } from "../shared/info";

export const info = createChannelInfo({
  "id": "channel.impulse",
  "name": "Impulsive Noise",
  "shortName": "Impulse",
  "category": "channel",
  "summary": "پالس‌های نویزی کوتاه و پرقدرت",
  "theory": "برخلاف AWGN، خطاها را به شکل Burst ایجاد می‌کند.",
  "input": "samples",
  "output": "samples",
  "operation": "channel-awgn",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
