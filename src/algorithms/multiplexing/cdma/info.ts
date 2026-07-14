import { createMultiplexingInfo } from "../shared/info";

export const info = createMultiplexingInfo({
  "id": "mux.cdma",
  "name": "CDMA / Spreading",
  "shortName": "CDMA",
  "category": "multiplexing",
  "summary": "پخش بیت با Chip Sequence",
  "theory": "کدهای متعامد امکان جداسازی چند کاربر هم‌زمان را فراهم می‌کنند.",
  "input": "bits",
  "output": "bits",
  "operation": "cdma",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
