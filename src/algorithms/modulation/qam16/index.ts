import { defineAlgorithm } from "../../core/define-algorithm";
import { info } from "./info";
import { process } from "./process";

export const qam16 = defineAlgorithm({ info, process });
