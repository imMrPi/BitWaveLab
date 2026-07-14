import { createSourcesInfo } from "../shared/info";

export const info = createSourcesInfo({
  id: "source.image",
  name: "ورودی تصویر",
  shortName: "Image",
  category: "sources",
  summary: "آپلود یا Drop تصویر و تبدیل بایت‌های آن به جریان بیت",
  theory: "تصویر در مرورگر به نسخه آزمایشگاهی کم‌حجم تبدیل و سپس بایت‌به‌بیت کد می‌شود. ابعاد و نوع فایل فقط مشخصات بازسازی هستند؛ محتوای خروجی از بیت‌های انتهای مسیر ساخته می‌شود.",
  input: "none",
  output: "bits",
  operation: "media-source-image",
  params: [
    { key: "payload", label: "Image payload", type: "text", default: "", hidden: true },
    { key: "mimeType", label: "MIME type", type: "text", default: "image/jpeg", hidden: true },
    { key: "fileName", label: "File name", type: "text", default: "bitwave-image.jpg", hidden: true },
    { key: "width", label: "Width", type: "number", default: 0, hidden: true },
    { key: "height", label: "Height", type: "number", default: 0, hidden: true },
  ],
  fidelity: "exact",
  tags: ["image", "upload", "drag drop", "media input"],
});
