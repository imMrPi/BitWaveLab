import { createModulationInfo } from "../shared/info";

export const info = createModulationInfo({
  scheme: "qam16",
  name: "16-QAM",
  summaryFa: "حمل چهار بیت با ترکیب دامنه و فاز حامل",
  theoryFa: "16-QAM از شبکه ۴×۴ با برچسب‌گذاری Gray و انرژی متوسط نرمال‌شده استفاده می‌کند. نسبت به PSK بهره طیفی بالاتری دارد اما به SNR و خطی‌بودن تقویت‌کننده حساس‌تر است.",
  summaryEn: "Carry four bits by jointly changing carrier amplitude and phase.",
  theoryEn: "16-QAM uses a normalized 4×4 Gray-labelled grid, improving spectral efficiency while requiring higher SNR and amplifier linearity.",
  inverse: "rx.ml",
  equations: { mapping: "I,Q∈{−3,−1,+1,+3}/√10", waveform: "s_k(t)=I_k cos(2πf_ct)−Q_k sin(2πf_ct)", efficiency: "4 bit/symbol" },
});
