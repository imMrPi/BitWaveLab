import { createModulationInfo } from "../shared/info";

export const info = createModulationInfo({
  scheme: "qpsk",
  name: "QPSK",
  summaryFa: "حمل دو بیت در هر سمبل با چهار فاز حامل",
  theoryFa: "QPSK بیت‌ها را دوتایی گروه‌بندی و با نگاشت Gray روی چهار نقطه با انرژی واحد قرار می‌دهد تا خطای سمبل مجاور معمولاً فقط یک بیت را عوض کند.",
  summaryEn: "Carry two bits per symbol using four carrier phases.",
  theoryEn: "QPSK groups bits in pairs and uses a unit-energy Gray-labelled four-point constellation.",
  inverse: "rx.ml",
  equations: { mapping: "00,01,11,10 → four phases", waveform: "s_k(t)=I_k cos(2πf_ct)−Q_k sin(2πf_ct)", ber: "P_b=Q(√(2E_b/N₀))" },
});
