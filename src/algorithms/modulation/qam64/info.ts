import { createModulationInfo } from "../shared/info";

export const info = createModulationInfo({
  scheme: "qam64",
  name: "64-QAM",
  summaryFa: "حمل شش بیت با صورت‌فلکی ۸×۸ دامنه–فاز",
  theoryFa: "64-QAM شش بیت را در هر سمبل روی شبکه Gray نرمال‌شده قرار می‌دهد. کارایی طیفی زیاد آن با فاصله کمتر نقاط و نیاز به SNR بالاتر همراه است.",
  summaryEn: "Carry six bits on an 8×8 amplitude-phase constellation.",
  theoryEn: "64-QAM maps six bits to a normalized Gray-labelled 8×8 grid, trading noise margin for high spectral efficiency.",
  inverse: "rx.ml",
  equations: { mapping: "I,Q∈{±1,±3,±5,±7}/√42", waveform: "s_k(t)=I_k cos(2πf_ct)−Q_k sin(2πf_ct)", efficiency: "6 bit/symbol" },
});
