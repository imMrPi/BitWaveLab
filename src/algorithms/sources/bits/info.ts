import { createSourcesInfo } from "../shared/info";

export const info = createSourcesInfo({
  "id": "source.bits",
  "name": "مولد دنباله بیت",
  "shortName": "Bits",
  "category": "sources",
  "summary": "تولید ورودی باینری قابل ویرایش",
  "theory": "یک دنباله منطقی از صفر و یک می‌سازد و مرجع بیت‌های اصلی را برای محاسبه BER نگه می‌دارد.",
  "input": "none",
  "output": "bits",
  "operation": "source-bits",
  "params": [
    {
      "key": "bits",
      "label": "دنباله بیت",
      "type": "text",
      "default": "1011001010110010"
    }
  ],
  "fidelity": "exact",
  "tags": []
});
