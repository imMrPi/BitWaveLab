import { createChannelCodingInfo } from "../shared/info";

export const info = createChannelCodingInfo({
  "id": "fec.reedsolomon",
  "name": "Reed–Solomon",
  "shortName": "RS",
  "category": "channel-coding",
  "summary": "اصلاح خطای نمادی و Burst",
  "theory": "کد روی نمادهای میدان متناهی کار می‌کند و در ذخیره‌سازی و DVB رایج است.",
  "input": "bits",
  "output": "bits",
  "operation": "fec-model",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
