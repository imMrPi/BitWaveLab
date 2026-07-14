import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { renderFourierFrame } from "./fourier-canvas";
import type { FourierVector, Point2D } from "./fourier-epicycles";

export async function exportFourierGif({ coefficients, original, withEpicycles, onProgress }: { coefficients: FourierVector[]; original: Point2D[]; withEpicycles: boolean; onProgress?: (progress: number) => void }) {
  const width = 420;
  const height = 420;
  const frameCount = 60;
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas export is unavailable");
  const gif = GIFEncoder();

  // The renderer uses a stable, deliberately small color system. Building one
  // global palette avoids running an expensive color quantizer for every frame
  // and keeps colors consistent through the complete animation.
  renderFourierFrame(context, { width, height, progress: .72, coefficients, original, showCircles: withEpicycles, showVectors: withEpicycles, showTrace: true, showOriginal: false, exportMode: true });
  const palette = quantize(context.getImageData(0, 0, width, height).data, 128, { format: "rgb444" });

  for (let frame = 0; frame < frameCount; frame += 1) {
    renderFourierFrame(context, { width, height, progress: frame / (frameCount - 1), coefficients, original, showCircles: withEpicycles, showVectors: withEpicycles, showTrace: true, showOriginal: false, exportMode: true });
    const rgba = context.getImageData(0, 0, width, height).data;
    const index = applyPalette(rgba, palette, "rgb444");
    gif.writeFrame(index, width, height, { palette: frame === 0 ? palette : undefined, delay: 55, repeat: 0 });
    onProgress?.((frame + 1) / frameCount);
    if (frame % 6 === 0) await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
  }
  gif.finish();
  const output = gif.bytes();
  const bytes = new Uint8Array(output.length);
  bytes.set(output);
  const blob = new Blob([bytes.buffer], { type: "image/gif" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = withEpicycles ? "fourier-epicycles-with-circles.gif" : "fourier-epicycles-trace.gif";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  return { filename: anchor.download, size: blob.size };
}
