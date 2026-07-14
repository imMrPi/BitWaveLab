import { createMultiplexingInfo } from "../shared/info";

export const info = createMultiplexingInfo({
  "id": "mux.wdm",
  "name": "Wavelength Division Multiplexing",
  "shortName": "WDM",
  "category": "multiplexing",
  "summary": "تقسیم طول موج در فیبر",
  "theory": "هر کانال نوری روی طول موج متفاوت حمل می‌شود.",
  "input": "samples",
  "output": "samples",
  "operation": "mux-fdm",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
