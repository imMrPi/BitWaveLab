import { createChannelCodingInfo } from "../shared/info";

export const info = createChannelCodingInfo({
  "id": "fec.checksum",
  "name": "Internet Checksum",
  "shortName": "Checksum",
  "category": "channel-coding",
  "summary": "جمع مکمل یک کلمات",
  "theory": "یک سازوکار ساده کشف خطا برای Header و Payload است.",
  "input": "bits",
  "output": "bits",
  "operation": "parity",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
