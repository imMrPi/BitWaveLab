import { createModulationInfo } from "../shared/info";

export const info = createModulationInfo({
  scheme: "gmsk",
  name: "GMSK",
  summaryFa: "مدولاسیون فاز پیوسته با پیش‌فیلتر گاوسی",
  theoryFa: "GMSK بیت‌ها را پیش از MSK با فیلتر گاوسی نرم می‌کند تا لوب‌های جانبی طیف کاهش یابند. مدل فعلی نمایش آموزشی دو تون را برای مشاهده زنده تولید می‌کند.",
  summaryEn: "Continuous-phase modulation with Gaussian pre-filtering.",
  theoryEn: "GMSK smooths data before MSK to suppress spectral sidelobes. The current educational model renders its binary tone basis for live inspection.",
  inverse: "rx.noncoherent",
  fidelity: "educational",
  equations: { index: "h=1/2", gaussian: "H(f)=exp(−(πf/(α√ln2))²)", bandwidth: "controlled by BT" },
});
