import { createSourcesInfo } from "../shared/info";

export const info = createSourcesInfo({
  id: "source.text",
  name: "ورودی متن",
  shortName: "Text",
  category: "sources",
  summary: "نوشتن متن UTF-8 و تبدیل بایت‌های آن به جریان بیت",
  theory: "متن با UTF-8 به بایت و سپس به بیت تبدیل می‌شود. در گیرنده، نود خروجی متن فقط بیت‌های رسیده را دوباره به UTF-8 برمی‌گرداند.",
  input: "none",
  output: "bits",
  operation: "media-source-text",
  params: [{ key: "text", label: "Text", type: "text", default: "سلام BitWaveLab!", hidden: true }],
  fidelity: "exact",
  tags: ["text", "utf-8", "textarea", "media input"],
});
