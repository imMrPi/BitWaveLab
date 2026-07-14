import { createAnalysisInfo } from "../shared/info";

export const info = createAnalysisInfo({
  id: "analysis.guide",
  name: "راهنمای پروژه",
  shortName: "Guide",
  category: "analysis",
  summary: "شرح هدف، مسیر و خروجی آموزشی پروژه روی خود گراف",
  theory: "این Node سیگنال را تغییر نمی‌دهد و به‌عنوان کارت آموزشی مستقل، هدف آزمایش و نتیجه مورد انتظار را کنار Pipeline نگه می‌دارد.",
  input: "none",
  output: "none",
  operation: "analysis-guide",
  params: [
    { key: "step", label: "شماره گام", type: "number", default: 1, min: 1, max: 99, step: 1 },
    { key: "level", label: "سطح", type: "number", default: 1, min: 1, max: 7, step: 1 },
    { key: "titleFa", label: "عنوان فارسی", type: "text", default: "راهنمای پروژه" },
    { key: "titleEn", label: "English title", type: "text", default: "Project guide" },
    { key: "bodyFa", label: "شرح فارسی", type: "text", default: "این مسیر را از چپ به راست اجرا و خروجی هر مرحله را مقایسه کن." },
    { key: "bodyEn", label: "English description", type: "text", default: "Run the workflow from left to right and compare every stage." },
    { key: "outcomeFa", label: "نتیجه مورد انتظار", type: "text", default: "در پایان باید بتوانی نقش هر بلوک را توضیح بدهی." },
    { key: "outcomeEn", label: "Expected outcome", type: "text", default: "By the end, you should be able to explain every block." },
    { key: "pipeline", label: "خلاصه مسیر", type: "text", default: "Source → Transform → Measurement" },
  ],
  fidelity: "exact",
  tags: ["guide", "learning", "annotation"],
});
