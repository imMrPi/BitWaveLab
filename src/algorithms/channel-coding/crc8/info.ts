import { createChannelCodingInfo } from "../shared/info";

export const info = createChannelCodingInfo({
  "id": "fec.crc8",
  "name": "CRC-8",
  "shortName": "CRC",
  "category": "channel-coding",
  "summary": "باقی‌مانده تقسیم چندجمله‌ای",
  "theory": "CRC برای کشف خطاهای Burst قدرت بالایی دارد و معمولاً درخواست ارسال مجدد را فعال می‌کند.",
  "input": "bits",
  "output": "bits",
  "operation": "crc8",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
