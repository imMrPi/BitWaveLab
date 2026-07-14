import { createChannelCodingInfo } from "../shared/info";

export const info = createChannelCodingInfo({
  "id": "fec.convolutional",
  "name": "Convolutional Code",
  "shortName": "Conv. 1/2",
  "category": "channel-coding",
  "summary": "کد جریانی با حافظه",
  "theory": "خروجی هر لحظه تابع بیت جدید و وضعیت شیفت‌رجیستر است و با Viterbi بازیابی می‌شود.",
  "input": "bits",
  "output": "bits",
  "operation": "convolutional",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
