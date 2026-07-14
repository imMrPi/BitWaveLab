import { createModulationInfo } from "../shared/info";

export const info = createModulationInfo({
  scheme: "8psk",
  name: "8-PSK",
  summaryFa: "حمل سه بیت در هر سمبل با هشت فاز حامل",
  theoryFa: "8-PSK بهره طیفی را نسبت به QPSK بیشتر می‌کند، اما فاصله زاویه‌ای نقاط کمتر و حساسیت آن به نویز و خطای فاز بیشتر است.",
  summaryEn: "Carry three bits per symbol using eight carrier phases.",
  theoryEn: "8-PSK improves spectral efficiency over QPSK at the cost of smaller angular separation and greater phase sensitivity.",
  inverse: "rx.ml",
  equations: { mapping: "θ_k=π/8+2πk/8", waveform: "s_k(t)=cos(2πf_ct+θ_k)", efficiency: "3 bit/symbol" },
});
