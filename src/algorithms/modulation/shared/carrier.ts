import type { ComplexPoint } from "../../../domain/signal/signal.types";
import type { ModulationScheme } from "./bit-mapping";

export function carrierSample(point: ComplexPoint, bit: number, scheme: ModulationScheme, time: number, carrierFrequency: number) {
  if (scheme === "fsk" || scheme === "gmsk") {
    const frequency = carrierFrequency * (bit ? 1.25 : 0.75);
    return Math.cos(2 * Math.PI * frequency * time);
  }
  return point.re * Math.cos(2 * Math.PI * carrierFrequency * time) - point.im * Math.sin(2 * Math.PI * carrierFrequency * time);
}
