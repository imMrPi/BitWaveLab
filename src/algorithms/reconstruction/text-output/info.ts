import { createReconstructionInfo } from "../shared/info";

export const info = createReconstructionInfo({
  id: "output.text",
  name: "خروجی متن",
  shortName: "Text Out",
  category: "reconstruction",
  summary: "رمزگشایی UTF-8 از بیت‌های دریافتی و نمایش متن نهایی",
  theory: "بیت‌های ورودی به بایت تبدیل و با UTF-8 خوانده می‌شوند. نمایشگر هیچ متغیر مشترکی با Text Input ندارد و فقط نتیجه اجرای مسیر را نشان می‌دهد.",
  input: "bits",
  output: "bits",
  operation: "media-sink-text",
  params: [],
  fidelity: "exact",
  tags: ["text", "utf-8", "media output", "sink"],
});
