import { createReconstructionInfo } from "../shared/info";

export const info = createReconstructionInfo({
  "id": "recon.dac",
  "name": "DAC / Zero-Order Hold",
  "shortName": "DAC",
  "category": "reconstruction",
  "summary": "نگه‌داشتن مقدار هر نمونه",
  "theory": "DAC ایده‌آل به فیلتر بازسازی پایین‌گذر نیاز دارد تا تصاویر طیفی حذف شوند.",
  "input": "samples",
  "output": "samples",
  "operation": "recon-hold",
  "params": [
    {
      "key": "factor",
      "label": "ضریب Hold",
      "type": "range",
      "default": 4,
      "min": 1,
      "max": 12,
      "step": 1
    }
  ],
  "fidelity": "exact",
  "tags": []
});
