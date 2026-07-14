import { createModulationInfo } from "../shared/info";

export const info = createModulationInfo({
  scheme: "fsk",
  name: "FSK",
  summaryFa: "نمایش بیت‌ها با دو فرکانس مجزا",
  theoryFa: "در BFSK هر بیت یکی از دو تون f₀ و f₁ را انتخاب می‌کند. جدایی مناسب تون‌ها آشکارسازی غیرهمدوس را ممکن می‌کند.",
  summaryEn: "Represent bits using two distinct carrier frequencies.",
  theoryEn: "Binary FSK selects one of two tones for each bit and supports non-coherent energy detection.",
  inverse: "rx.noncoherent",
  equations: { mapping: "0 → f₀, 1 → f₁", waveform: "s_k(t)=cos(2πf_kt)", orthogonality: "Δf≥1/(2T_s)" },
});
