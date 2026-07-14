import { createChannelCodingInfo } from "../shared/info";

export const info = createChannelCodingInfo({
  "id": "fec.parity",
  "name": "Parity Bit",
  "shortName": "Parity",
  "category": "channel-coding",
  "summary": "افزودن بیت توازن زوج",
  "theory": "Parity برخی خطاهای با تعداد فرد را کشف می‌کند اما محل خطا را مشخص نمی‌کند.",
  "input": "bits",
  "output": "bits",
  "operation": "parity",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
