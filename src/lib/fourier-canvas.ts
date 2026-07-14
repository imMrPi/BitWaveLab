import { evaluateEpicycles, reconstructPath, type FourierVector, type Point2D } from "./fourier-epicycles";

export type FourierRenderOptions = {
  width: number;
  height: number;
  progress: number;
  coefficients: FourierVector[];
  original?: Point2D[];
  drawing?: Point2D[];
  showCircles: boolean;
  showVectors: boolean;
  showTrace: boolean;
  showOriginal?: boolean;
  exportMode?: boolean;
};

export const FOURIER_COLORS = {
  background: "#080b10",
  grid: "rgba(148,163,184,.07)",
  circle: "rgba(96,165,250,.34)",
  vector: "rgba(226,232,240,.78)",
  trace: "#fbbf24",
  tip: "#34d399",
  original: "rgba(148,163,184,.23)",
  drawing: "#fbbf24",
};

function mapper(width: number, height: number) {
  const size = Math.min(width, height) * 0.43;
  return (point: Point2D) => ({ x: width / 2 + point.x * size, y: height / 2 + point.y * size });
}

function drawPolyline(context: CanvasRenderingContext2D, points: Point2D[], map: (point: Point2D) => Point2D, color: string, width: number) {
  if (points.length < 2) return;
  context.beginPath();
  points.forEach((point, index) => { const mapped = map(point); if (index) context.lineTo(mapped.x, mapped.y); else context.moveTo(mapped.x, mapped.y); });
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.stroke();
}

export function renderFourierFrame(context: CanvasRenderingContext2D, options: FourierRenderOptions) {
  const { width, height, coefficients, progress, original = [], drawing = [], showCircles, showVectors, showTrace, showOriginal = true, exportMode = false } = options;
  const map = mapper(width, height);
  context.clearRect(0, 0, width, height);
  context.fillStyle = FOURIER_COLORS.background;
  context.fillRect(0, 0, width, height);

  if (!exportMode) {
    context.strokeStyle = FOURIER_COLORS.grid;
    context.lineWidth = 1;
    for (let x = 0; x <= width; x += 40) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke(); }
    for (let y = 0; y <= height; y += 40) { context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke(); }
  }

  if (showOriginal) drawPolyline(context, original, map, FOURIER_COLORS.original, 1.4);
  if (drawing.length) {
    const drawingMap = (point: Point2D) => ({ x: point.x * width, y: point.y * height });
    drawPolyline(context, drawing, drawingMap, FOURIER_COLORS.drawing, 3);
    return;
  }
  if (!coefficients.length) return;

  const { endpoint, segments } = evaluateEpicycles(coefficients, progress);
  const size = Math.min(width, height) * 0.43;
  for (const segment of segments) {
    const start = map(segment.start);
    const end = map(segment.end);
    if (showCircles && segment.amplitude * size > .7) {
      context.beginPath();
      context.arc(start.x, start.y, segment.amplitude * size, 0, Math.PI * 2);
      context.strokeStyle = FOURIER_COLORS.circle;
      context.lineWidth = 1;
      context.stroke();
    }
    if (showVectors) {
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.strokeStyle = FOURIER_COLORS.vector;
      context.lineWidth = 1.25;
      context.stroke();
    }
  }

  if (showTrace) drawPolyline(context, reconstructPath(coefficients, 520, progress), map, FOURIER_COLORS.trace, 2.7);
  const tip = map(endpoint);
  context.beginPath(); context.arc(tip.x, tip.y, 4.2, 0, Math.PI * 2); context.fillStyle = FOURIER_COLORS.tip; context.fill();
}

export function downloadCanvasPng(canvas: HTMLCanvasElement, name = "fourier-epicycles.png") {
  const anchor = document.createElement("a");
  anchor.download = name;
  anchor.href = canvas.toDataURL("image/png");
  anchor.click();
}
