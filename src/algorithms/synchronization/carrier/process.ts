import { info } from "./info";
import { createSynchronizationProcess } from "../shared/process";

export const process = createSynchronizationProcess(info);
