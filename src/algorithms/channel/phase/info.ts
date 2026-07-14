import { createChannelInfo } from "../shared/info";

export const info = createChannelInfo({
  "id": "channel.phase",
  "name": "Phase Noise",
  "shortName": "Phase Noise",
  "category": "channel",
  "summary": "رانش تصادفی فاز حامل",
  "theory": "پراکندگی زاویه‌ای صورت‌فلکی ایجاد می‌کند.",
  "input": "samples",
  "output": "samples",
  "operation": "channel-cfo",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
