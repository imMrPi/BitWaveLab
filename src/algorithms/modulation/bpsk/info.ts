import { createModulationInfo } from "../shared/info";

export const info = createModulationInfo({
  scheme: "bpsk",
  name: "BPSK",
  summaryFa: "نگاشت هر بیت به یکی از دو فاز متقابل",
  theoryFa: "BPSK یک بیت را در هر سمبل با نقاط −1 و +1 حمل می‌کند. فاصله اقلیدسی زیاد آن مقاومت خوبی در برابر نویز AWGN می‌دهد.",
  summaryEn: "Map each bit to one of two antipodal carrier phases.",
  theoryEn: "BPSK carries one bit per symbol using −1 and +1, giving strong Euclidean separation in AWGN.",
  inverse: "rx.ml",
  equations: { mapping: "0 → −1, 1 → +1", waveform: "s_k(t)=a_k cos(2πf_ct)", ber: "P_b=Q(√(2E_b/N₀))" },
});
