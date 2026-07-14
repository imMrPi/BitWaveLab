import { createEmbeddedInfo } from "../shared/info";

export const info = createEmbeddedInfo({
  "id": "embedded.uart",
  "name": "UART Framing",
  "shortName": "UART",
  "category": "embedded",
  "summary": "افزودن Start، Data، Parity و Stop",
  "theory": "UART یک لینک سریال ناهمزمان است که هر بایت را بین Start Bit و Stop Bit قاب‌بندی می‌کند.",
  "input": "bits",
  "output": "samples",
  "operation": "embedded-uart",
  "params": [
    {
      "key": "baud",
      "label": "Baud Rate",
      "type": "select",
      "default": "9600",
      "options": [
        {
          "label": "9600",
          "value": "9600"
        },
        {
          "label": "57600",
          "value": "57600"
        },
        {
          "label": "115200",
          "value": "115200"
        }
      ]
    },
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
