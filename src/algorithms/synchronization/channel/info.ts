import { createSynchronizationInfo } from "../shared/info";

export const info = createSynchronizationInfo({
  "id": "sync.channel",
  "name": "Channel Estimation",
  "shortName": "Channel Est.",
  "category": "synchronization",
  "summary": "تخمین پاسخ کانال از Pilot",
  "theory": "ضرایب کانال برای Equalizer یا آشکارسازی همدوس تخمین زده می‌شوند.",
  "input": "samples",
  "output": "samples",
  "operation": "analysis-metrics",
  "params": [],
  "fidelity": "educational",
  "tags": []
});
