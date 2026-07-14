import { createChannelCodingInfo } from "../shared/info";

export const info = createChannelCodingInfo({
  "id": "fec.interleave",
  "name": "Block Interleaver",
  "shortName": "Interleave",
  "category": "channel-coding",
  "summary": "پخش خطای Burst در زمان",
  "theory": "ترتیب بیت‌ها را عوض می‌کند تا خطاهای متوالی برای دیکدر مستقل‌تر شوند.",
  "input": "bits",
  "output": "bits",
  "operation": "interleave",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
