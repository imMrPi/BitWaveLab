import { createModulationInfo } from "../shared/info";

export const info = createModulationInfo({
  scheme: "ask",
  name: "ASK",
  summaryFa: "نمایش بیت با تغییر دامنه حامل",
  theoryFa: "در ASK دودویی، دامنه حامل میان دو سطح جابه‌جا می‌شود. پیاده‌سازی حاضر OOK است: صفر حامل را خاموش و یک آن را روشن می‌کند.",
  summaryEn: "Represent bits by changing the carrier amplitude.",
  theoryEn: "This binary ASK implementation uses on-off keying: zero suppresses the carrier and one transmits it.",
  inverse: "rx.envelope",
  equations: { mapping: "0 → 0, 1 → 1", waveform: "s(t)=A_k cos(2πf_ct)", bandwidth: "B≈2R_s" },
});
