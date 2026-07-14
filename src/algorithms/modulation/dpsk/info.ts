import { createModulationInfo } from "../shared/info";

export const info = createModulationInfo({
  scheme: "dpsk",
  name: "DPSK",
  summaryFa: "نمایش بیت با تغییر فاز نسبت به سمبل قبلی",
  theoryFa: "در DBPSK بیت یک فاز را π رادیان تغییر می‌دهد و بیت صفر فاز قبلی را نگه می‌دارد؛ بنابراین گیرنده به مرجع فاز مطلق نیاز ندارد.",
  summaryEn: "Represent each bit by the phase change from the previous symbol.",
  theoryEn: "DBPSK rotates phase by π for one and retains it for zero, avoiding the need for an absolute carrier-phase reference.",
  inverse: "rx.noncoherent",
  fidelity: "educational",
  equations: { recursion: "θ_k=θ_{k−1}+πb_k", mapping: "a_k=e^{jθ_k}", tradeoff: "noncoherent penalty≈3 dB" },
});
