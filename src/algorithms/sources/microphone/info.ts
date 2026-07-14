import { createSourcesInfo } from "../shared/info";

export const info = createSourcesInfo({
  id: "source.microphone",
  name: "ورودی میکروفون",
  shortName: "Mic",
  category: "sources",
  summary: "ضبط صدا و تبدیل دقیق فایل ضبط‌شده به جریان بیت",
  theory: "بایت‌های فایل صوتی ضبط‌شده با ترتیب MSB-first به بیت تبدیل می‌شوند. نوع MIME و طول بایت همراه مسیر حمل می‌شود، اما خروجی فقط از بیت‌های دریافت‌شده بازسازی خواهد شد.",
  input: "none",
  output: "bits",
  operation: "media-source-audio",
  params: [
    { key: "payload", label: "Audio payload", type: "text", default: "", hidden: true },
    { key: "mimeType", label: "MIME type", type: "text", default: "audio/webm", hidden: true },
    { key: "fileName", label: "File name", type: "text", default: "bitwave-recording.webm", hidden: true },
    { key: "duration", label: "Duration", type: "number", default: 0, hidden: true },
  ],
  fidelity: "exact",
  tags: ["microphone", "audio", "recording", "media input"],
});
