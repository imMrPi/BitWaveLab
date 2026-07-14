import { info } from "./info";
import { createMultiplexingProcess } from "../shared/process";

export const process = createMultiplexingProcess(info);
