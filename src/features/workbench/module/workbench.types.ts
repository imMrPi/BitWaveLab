export type ScopeTab = "time" | "spectrum" | "constellation" | "bits" | "logs";

export type MobilePane = "library" | "canvas" | "inspector";

export const scopeTabs: Array<{ id: ScopeTab; label: string; english: string; short: string }> = [
  { id: "time", label: "حوزه زمان", english: "Time", short: "t" },
  { id: "spectrum", label: "طیف", english: "Spectrum", short: "f" },
  { id: "constellation", label: "صورت‌فلکی", english: "Constellation", short: "I/Q" },
  { id: "bits", label: "بیت و داده", english: "Bits & Data", short: "01" },
  { id: "logs", label: "کنسول اجرا", english: "Run Console", short: ">_" },
];

export const MOBILE_BREAKPOINT = 840;
export const MOBILE_INITIAL_ZOOM = 0.55;
