import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.viterbi",
  "name": "Viterbi Algorithm",
  "shortName": "Viterbi",
  "category": "decoding",
  "summary": "کوتاه‌ترین مسیر در Trellis",
  "theory": "Viterbi محتمل‌ترین دنباله وضعیت را از معیار فاصله انتخاب می‌کند.",
  "input": "bits",
  "output": "bits",
  "operation": "decode-viterbi",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
