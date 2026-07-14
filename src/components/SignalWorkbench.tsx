"use client";

import { SignalWorkbenchView } from "./SignalWorkbenchView";
import { useSignalWorkbenchController } from "./useSignalWorkbenchController";

export default function SignalWorkbench() {
  const controller = useSignalWorkbenchController();
  return <SignalWorkbenchView controller={controller} />;
}