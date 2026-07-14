import { createEmbeddedInfo } from "../shared/info";

export const info = createEmbeddedInfo({
  "id": "embedded.i2c",
  "name": "I²C Transfer",
  "shortName": "I²C",
  "category": "embedded",
  "summary": "مدل Start، Address، ACK و Stop",
  "theory": "I²C یک گذرگاه دوسیمی Open-drain است که چند وسیله را با آدرس روی SDA و SCL متصل می‌کند.",
  "input": "bits",
  "output": "samples",
  "operation": "embedded-i2c",
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
