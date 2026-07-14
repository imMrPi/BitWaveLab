import { createChannelInfo } from "../shared/info";

export const info = createChannelInfo({
  "id": "channel.attenuation",
  "name": "تضعیف",
  "shortName": "Attenuate",
  "category": "channel",
  "summary": "کاهش دامنه در مسیر",
  "theory": "افت توان دریافتی نسبت به ارسالی با dB بیان می‌شود.",
  "input": "samples",
  "output": "samples",
  "operation": "channel-attenuation",
  "params": [
    {
      "key": "loss",
      "label": "افت",
      "type": "range",
      "default": 6,
      "min": 0,
      "max": 30,
      "step": 1,
      "unit": "dB"
    }
  ],
  "fidelity": "exact",
  "tags": []
});
