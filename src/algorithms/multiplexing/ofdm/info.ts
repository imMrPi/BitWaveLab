import { createMultiplexingInfo } from "../shared/info";

export const info = createMultiplexingInfo({
  "id": "mux.ofdm",
  "name": "OFDM",
  "shortName": "OFDM",
  "category": "multiplexing",
  "summary": "مدولاسیون چندحاملی متعامد",
  "theory": "سمبل‌ها روی زیرحامل‌های متعامد قرار می‌گیرند و با IFFT و Cyclic Prefix به موج زمانی تبدیل می‌شوند.",
  "input": "bits",
  "output": "samples",
  "operation": "mod-qpsk",
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
  "fidelity": "educational",
  "tags": []
});
