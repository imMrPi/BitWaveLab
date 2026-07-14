import { createSynchronizationInfo } from "../shared/info";

export const info = createSynchronizationInfo({
  "id": "sync.frame",
  "name": "Frame Synchronization",
  "shortName": "Frame Sync",
  "category": "synchronization",
  "summary": "یافتن الگوی آغاز فریم",
  "theory": "همبستگی با Preamble مرز فریم را در جریان نمونه یا بیت پیدا می‌کند.",
  "input": "any",
  "output": "same",
  "operation": "sync-frame",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
