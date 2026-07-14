import { info } from "./info";
import { createEmbeddedProcess } from "../shared/process";

export const process = createEmbeddedProcess(info);
