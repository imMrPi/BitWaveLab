import { createEmbeddedInfo } from "../shared/info";

export const info = createEmbeddedInfo({
  "id": "embedded.dma",
  "name": "DMA Stream Buffer",
  "shortName": "DMA",
  "category": "embedded",
  "summary": "انتقال بلوکی ADC بدون درگیری CPU",
  "theory": "DMA نمونه‌ها را میان Peripheral و حافظه جابه‌جا می‌کند و برای Streaming پیوسته، Double Buffer و جلوگیری از Overrun مهم است.",
  "input": "any",
  "output": "same",
  "operation": "embedded-dma",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
