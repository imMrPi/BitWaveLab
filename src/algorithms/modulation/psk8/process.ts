import { info } from "./info";
import { createModulationProcess } from "../shared/process";

export const process = createModulationProcess(info, "8psk");
