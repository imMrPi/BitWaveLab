import { createScramblingInfo } from "../shared/info";

export const info = createScramblingInfo({
  "id": "scramble.selfsync",
  "name": "Self-synchronizing Scrambler",
  "shortName": "Self Sync",
  "category": "scrambling",
  "summary": "خروجی تابع ورودی و بیت‌های قبلی",
  "theory": "پس از چند بیت، خطای هم‌زمانی به‌طور خودکار از شیفت‌رجیستر خارج می‌شود.",
  "input": "bits",
  "output": "bits",
  "operation": "lfsr",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
