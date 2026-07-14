import { createMultiplexingInfo } from "../shared/info";

export const info = createMultiplexingInfo({
  "id": "mux.tdm",
  "name": "Time Division Multiplexing",
  "shortName": "TDM",
  "category": "multiplexing",
  "summary": "تقسیم زمان میان جریان‌ها",
  "theory": "هر جریان در شکاف زمانی مشخص از بستر مشترک استفاده می‌کند.",
  "input": "any",
  "output": "same",
  "operation": "mux-tdm",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
