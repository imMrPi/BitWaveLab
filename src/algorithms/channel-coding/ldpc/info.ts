import { createChannelCodingInfo } from "../shared/info";

export const info = createChannelCodingInfo({
  "id": "fec.ldpc",
  "name": "LDPC",
  "shortName": "LDPC",
  "category": "channel-coding",
  "summary": "کد بلوکی با ماتریس تنک",
  "theory": "Message Passing روی گراف تَنِر به کارایی نزدیک ظرفیت می‌رسد.",
  "input": "bits",
  "output": "bits",
  "operation": "fec-model",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
