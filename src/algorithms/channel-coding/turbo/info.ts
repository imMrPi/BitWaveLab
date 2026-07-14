import { createChannelCodingInfo } from "../shared/info";

export const info = createChannelCodingInfo({
  "id": "fec.turbo",
  "name": "Turbo Code",
  "shortName": "Turbo",
  "category": "channel-coding",
  "summary": "دو کد کانولوشنال و Interleaver",
  "theory": "دیکدرهای تکراری اطلاعات نرم را مبادله می‌کنند.",
  "input": "bits",
  "output": "bits",
  "operation": "fec-model",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
