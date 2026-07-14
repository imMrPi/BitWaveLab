import { createScramblingInfo } from "../shared/info";

export const info = createScramblingInfo({
  "id": "scramble.lfsr",
  "name": "Polynomial Scrambler",
  "shortName": "LFSR",
  "category": "scrambling",
  "summary": "سفیدسازی آماری بیت‌ها",
  "theory": "اسکرامبلر با یک توالی شبه‌تصادفی XOR می‌کند؛ رمزنگاری نیست و هدف آن بهبود ویژگی طیفی است.",
  "input": "bits",
  "output": "bits",
  "operation": "lfsr",
  "params": [],
  "fidelity": "exact",
  "tags": []
});
