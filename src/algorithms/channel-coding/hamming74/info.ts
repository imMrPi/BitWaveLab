import { createChannelCodingInfo } from "../shared/info";

export const info = createChannelCodingInfo({
  "id": "fec.hamming74",
  "name": "Hamming (7,4)",
  "shortName": "Hamming",
  "category": "channel-coding",
  "summary": "تصحیح یک خطا در هر کلمه",
  "theory": "چهار بیت داده با سه بیت توازن به کدواژه هفت‌بیتی تبدیل می‌شوند.",
  "input": "bits",
  "output": "bits",
  "operation": "hamming74",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
