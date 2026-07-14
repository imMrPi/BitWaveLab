import { createDecodingInfo } from "../shared/info";

export const info = createDecodingInfo({
  "id": "decode.berlekamp",
  "name": "Berlekamp–Massey",
  "shortName": "B-M",
  "category": "decoding",
  "summary": "یافتن چندجمله‌ای مکان خطا",
  "theory": "برای دیکد کدهای BCH و Reed–Solomon به‌کار می‌رود.",
  "input": "bits",
  "output": "bits",
  "operation": "passthrough",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
