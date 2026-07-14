import { defineAlgorithm } from "../../core/define-algorithm";
import { info } from "./info";
import { process } from "./process";

export const crc8 = defineAlgorithm({ info, process });
