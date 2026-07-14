import { createChannelInfo } from "../shared/info";

export const info = createChannelInfo({
  "id": "channel.clipping",
  "name": "Clipping / Saturation",
  "shortName": "Clip",
  "category": "channel",
  "summary": "محدودیت غیرخطی دامنه",
  "theory": "بریده شدن قله‌ها هارمونیک و اعوجاج درون‌باند ایجاد می‌کند.",
  "input": "samples",
  "output": "samples",
  "operation": "channel-clipping",
  "params": [
    {
      "key": "limit",
      "label": "حد اشباع",
      "type": "range",
      "default": 0.8,
      "min": 0.1,
      "max": 2,
      "step": 0.05
    }
  ],
  "fidelity": "exact",
  "tags": []
});
