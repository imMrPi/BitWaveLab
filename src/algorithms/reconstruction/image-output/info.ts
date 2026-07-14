import { createReconstructionInfo } from "../shared/info";

export const info = createReconstructionInfo({
  id: "output.image",
  name: "خروجی نمایش تصویر",
  shortName: "Image Out",
  category: "reconstruction",
  summary: "بازسازی تصویر فقط از بیت‌های رسیده به انتهای پایپ‌لاین",
  theory: "Sink تصویر، بایت‌های دریافتی را از نو می‌سازد و با MIME حمل‌شده نمایش می‌دهد. هر خطای باقی‌مانده در مسیر مستقیماً روی فایل خروجی اثر می‌گذارد.",
  input: "bits",
  output: "bits",
  operation: "media-sink-image",
  params: [],
  fidelity: "exact",
  tags: ["image", "viewer", "media output", "sink"],
});
