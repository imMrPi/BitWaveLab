import { createReconstructionInfo } from "../shared/info";

export const info = createReconstructionInfo({
  id: "output.audio",
  name: "خروجی پخش صوت",
  shortName: "Audio Out",
  category: "reconstruction",
  summary: "ساخت فایل صوتی قابل پخش از بیت‌های دریافت‌شده",
  theory: "این Sink هیچ دسترسی مستقیمی به ضبط اولیه ندارد. بایت‌های فایل صوتی فقط از جریان بیت ورودی همین نود ساخته و سپس به Player داده می‌شوند.",
  input: "bits",
  output: "bits",
  operation: "media-sink-audio",
  params: [],
  fidelity: "exact",
  tags: ["audio", "player", "media output", "sink"],
});
