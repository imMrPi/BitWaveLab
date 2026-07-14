import { createEmbeddedInfo } from "../shared/info";

export const info = createEmbeddedInfo({
  "id": "embedded.spi",
  "name": "SPI Transfer",
  "shortName": "SPI",
  "category": "embedded",
  "summary": "انتقال همزمان MOSI با Clock",
  "theory": "SPI با خطوط Clock، Data و Chip Select ارتباط سریع تمام‌دوطرفه میان MCU و Peripheral ایجاد می‌کند.",
  "input": "bits",
  "output": "samples",
  "operation": "embedded-spi",
  "params": [
    {
      "key": "sps",
      "label": "نمونه در هر سمبل",
      "type": "range",
      "default": 16,
      "min": 4,
      "max": 48,
      "step": 1,
      "unit": "sps"
    }
  ],
  "fidelity": "exact",
  "tags": []
});
