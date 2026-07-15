"use client";

import { SignalWorkbenchView } from "./SignalWorkbenchView";
import { useSignalWorkbenchController } from "../hooks/use-signal-workbench-controller";

export default function SignalWorkbench() {
  const controller = useSignalWorkbenchController();
  return <SignalWorkbenchView controller={controller} />;
}
