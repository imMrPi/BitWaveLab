"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { tr, useLocale } from "../lib/i18n";
import { downloadCanvasPng, renderFourierFrame } from "../lib/fourier-canvas";
import {
  computeComplexDFT,
  pathLength,
  prepareFourierPath,
  reconstructionError,
  selectHarmonics,
  type Point2D,
} from "../lib/fourier-epicycles";
import { exportFourierGif } from "../lib/fourier-gif";
import CompactLabNav from "./CompactLabNav";

const SAMPLE_COUNT = 512;

function heartPreset() {
  return Array.from({ length: 360 }, (_, index) => {
    const t = (index / 359) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    );
    return { x: 0.5 + x / 38, y: 0.49 + y / 38 };
  });
}

function starPreset() {
  const vertices = Array.from({ length: 11 }, (_, index) => {
    const spoke = index % 2 ? 0.19 : 0.42;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    return {
      x: 0.5 + Math.cos(angle) * spoke,
      y: 0.5 + Math.sin(angle) * spoke,
    };
  });
  const points: Point2D[] = [];
  for (let index = 1; index < vertices.length; index += 1) {
    for (let step = 0; step < 32; step += 1) {
      const ratio = step / 32;
      points.push({
        x:
          vertices[index - 1].x +
          (vertices[index].x - vertices[index - 1].x) * ratio,
        y:
          vertices[index - 1].y +
          (vertices[index].y - vertices[index - 1].y) * ratio,
      });
    }
  }
  return points;
}

function facePreset() {
  const points: Point2D[] = [];
  for (let index = 0; index < 240; index += 1) {
    const t = (index / 239) * Math.PI * 2;
    points.push({ x: 0.5 + 0.28 * Math.cos(t), y: 0.49 + 0.39 * Math.sin(t) });
  }
  return points;
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 rounded-lg border border-white/[.07] bg-white/[.018] p-2 text-start transition hover:bg-white/[.04]"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <i className={`relative h-5 w-9 rounded-full border not-italic transition ${checked ? "border-violet-400/30 bg-violet-400/20" : "border-white/10 bg-black/25"}`}>
        <span className={`absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full transition ${checked ? "left-1 bg-violet-300" : "left-[18px] bg-slate-500"}`} />
      </i>
      <b className={`text-[8px] ${checked ? "text-slate-200" : "text-slate-500"}`}>{label}</b>
    </button>
  );
}

export default function FourierEpicycleLab() {
  const { locale, setLocale } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const strokeRef = useRef<Point2D[]>([]);
  const frameRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const [rawPoints, setRawPoints] = useState<Point2D[]>(() => heartPreset());
  const [drawingPoints, setDrawingPoints] = useState<Point2D[]>([]);
  const [harmonics, setHarmonics] = useState(72);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showCircles, setShowCircles] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [showTrace, setShowTrace] = useState(true);
  const [exporting, setExporting] = useState<"circles" | "trace" | undefined>();
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState("");
  const [exportSucceeded, setExportSucceeded] = useState(false);

  const normalizedPath = useMemo(
    () => prepareFourierPath(rawPoints, SAMPLE_COUNT),
    [rawPoints],
  );
  const allCoefficients = useMemo(
    () => computeComplexDFT(normalizedPath),
    [normalizedPath],
  );
  const activeCoefficients = useMemo(
    () => selectHarmonics(allCoefficients, harmonics),
    [allCoefficients, harmonics],
  );
  const mse = useMemo(
    () => reconstructionError(normalizedPath, activeCoefficients),
    [normalizedPath, activeCoefficients],
  );
  const activeEnergy = useMemo(() => {
    const total = allCoefficients.reduce(
      (sum, item) => sum + item.amplitude ** 2,
      0,
    );
    return total
      ? activeCoefficients.reduce((sum, item) => sum + item.amplitude ** 2, 0) /
          total
      : 0;
  }, [activeCoefficients, allCoefficients]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const context = canvas.getContext("2d");
    if (!context) return;
    renderFourierFrame(context, {
      width,
      height,
      progress,
      coefficients: activeCoefficients,
      original: normalizedPath,
      drawing: drawingPoints,
      showCircles,
      showVectors,
      showTrace,
    });
  }, [
    activeCoefficients,
    drawingPoints,
    normalizedPath,
    progress,
    showCircles,
    showTrace,
    showVectors,
  ]);

  useEffect(() => {
    render();
    const observer = new ResizeObserver(render);
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [render]);

  useEffect(() => {
    if (!playing || !activeCoefficients.length || drawingPoints.length) return;
    const tick = (time: number) => {
      const previous = previousTimeRef.current ?? time;
      previousTimeRef.current = time;
      setProgress((current) => {
        const next = current + ((time - previous) / 7800) * speed;
        if (next >= 1) {
          window.setTimeout(() => setPlaying(false), 0);
          return 1;
        }
        return next;
      });
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== undefined)
        window.cancelAnimationFrame(frameRef.current);
      frameRef.current = undefined;
      previousTimeRef.current = undefined;
    };
  }, [activeCoefficients.length, drawingPoints.length, playing, speed]);

  function pointFromEvent(event: ReactPointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    };
  }

  function startDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    event.preventDefault();
    drawingRef.current = true;
    strokeRef.current = [pointFromEvent(event)];
    setDrawingPoints(strokeRef.current);
    setPlaying(false);
    setProgress(0);
    setExportError("");
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function continueDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const point = pointFromEvent(event);
    const previous = strokeRef.current.at(-1);
    if (
      previous &&
      Math.hypot(point.x - previous.x, point.y - previous.y) < 0.0025
    )
      return;
    strokeRef.current = [...strokeRef.current, point];
    setDrawingPoints(strokeRef.current);
  }

  function finishDrawing() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (strokeRef.current.length >= 4 && pathLength(strokeRef.current) > 0.03) {
      setRawPoints(strokeRef.current);
      setProgress(0);
      setPlaying(true);
    }
    setDrawingPoints([]);
  }

  function restart(play = true) {
    setProgress(0);
    previousTimeRef.current = undefined;
    setPlaying(play);
  }
  function choosePreset(points: Point2D[]) {
    setRawPoints(points);
    setProgress(0);
    setPlaying(true);
  }
  function clear() {
    setRawPoints([]);
    setDrawingPoints([]);
    setProgress(0);
    setPlaying(false);
    setExportError("");
  }

  async function makeGif(withEpicycles: boolean) {
    if (!activeCoefficients.length || exporting) return;
    setExporting(withEpicycles ? "circles" : "trace");
    setExportProgress(0);
    setExportError("");
    setExportSucceeded(false);
    try {
      const result = await exportFourierGif({
        coefficients: activeCoefficients,
        original: normalizedPath,
        withEpicycles,
        onProgress: setExportProgress,
      });
      setExportError(
        tr(
          locale,
          `GIF آماده و دانلود شد · ${Math.max(1, Math.round(result.size / 1024))} KB`,
          `GIF ready and downloaded · ${Math.max(1, Math.round(result.size / 1024))} KB`,
        ),
      );
      setExportSucceeded(true);
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : tr(locale, "ساخت GIF ناموفق بود.", "GIF export failed."),
      );
    } finally {
      setExporting(undefined);
    }
  }

  function exportPng() {
    if (!activeCoefficients.length) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 1400;
    const context = canvas.getContext("2d");
    if (!context) return;
    renderFourierFrame(context, {
      width: canvas.width,
      height: canvas.height,
      progress: 1,
      coefficients: activeCoefficients,
      original: normalizedPath,
      showCircles: false,
      showVectors: false,
      showTrace: true,
      showOriginal: false,
      exportMode: true,
    });
    downloadCanvasPng(canvas);
  }

  const education = [
    {
      done: rawPoints.length > 3,
      title: tr(locale, "مسیر دوبعدی ثبت شد", "2D path captured"),
      text: tr(
        locale,
        `${rawPoints.length} نقطه خام با فاصله‌های زمانی نامنظم ذخیره شده است.`,
        `${rawPoints.length} raw points with irregular timing were captured.`,
      ),
    },
    {
      done: normalizedPath.length > 0,
      title: tr(
        locale,
        "بازنمونه‌برداری و نرمال‌سازی",
        "Resampled and normalized",
      ),
      text: tr(
        locale,
        `مسیر به ${SAMPLE_COUNT} نمونه تقریباً هم‌فاصله تبدیل و حول مبدأ پایدار شد.`,
        `The path became ${SAMPLE_COUNT} near-equidistant samples centered around the origin.`,
      ),
    },
    {
      done: allCoefficients.length > 0,
      title: tr(locale, "DFT مختلط محاسبه شد", "Complex DFT computed"),
      text: tr(
        locale,
        "برای هر فرکانس، دامنه و فاز از z(t)=x(t)+iy(t) استخراج شده است.",
        "Amplitude and phase were extracted for each frequency from z(t)=x(t)+iy(t).",
      ),
    },
    {
      done: progress > 0,
      title: tr(
        locale,
        "دایره‌ها شکل را می‌سازند",
        "Epicycles rebuild the shape",
      ),
      text: tr(
        locale,
        "نوک آخرین بردار، جمع لحظه‌ای همه مؤلفه‌ها و قلم بازسازی است.",
        "The last vector tip is the instantaneous sum and reconstruction pen.",
      ),
    },
  ];

  return (
    <main
      className="h-dvh w-full overflow-y-auto bg-[radial-gradient(circle_at_15%_0%,rgba(139,92,246,.11),transparent_35%),#080a0e] p-5 text-slate-100 [scrollbar-color:rgba(148,163,184,.18)_transparent] [scrollbar-width:thin] max-[640px]:p-3"
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      <header className="mx-auto mb-4 grid max-w-7xl grid-cols-[160px_minmax(0,1fr)_auto] items-center gap-5 rounded-2xl border border-white/10 bg-[#0d1016]/95 p-4 shadow-xl shadow-black/20 max-[860px]:grid-cols-[1fr_auto]">
        <Link href="/" className="grid text-sm font-black text-white no-underline">
          <b>BitWave<span className="text-amber-400">Lab</span></b>
          <small className="font-mono text-[7px] font-normal tracking-[.14em] text-slate-600">FOURIER EPICYCLES</small>
        </Link>
        <div className="max-[860px]:order-3 max-[860px]:col-span-2">
          <span className="font-mono text-[7px] tracking-[.15em] text-violet-300">COMPLEX DFT · 2D RECONSTRUCTION</span>
          <h1 className="my-1 text-xl font-black text-white max-[560px]:text-base">
            {tr(
              locale,
              "شکل بکش؛ فوریه آن را با دایره‌های چرخان دوباره می‌سازد",
              "Draw a shape; Fourier rebuilds it with rotating circles",
            )}
          </h1>
          <p className="m-0 max-w-3xl text-[9px] leading-5 text-slate-500">
            {tr(
              locale,
              "هر خطی که می‌کشی به یک سیگنال مختلط تبدیل می‌شود و فقط با جمع حرکت‌های دایره‌ای از صفر بازسازی خواهد شد.",
              "Your stroke becomes a complex signal and is reconstructed from zero using only a sum of circular motions.",
            )}
          </p>
        </div>
        <CompactLabNav
          locale={locale}
          current="epicycles"
          onLocaleToggle={() => setLocale(locale === "fa" ? "en" : "fa")}
        />
      </header>

      <section className="mx-auto mb-4 grid max-w-7xl grid-cols-[minmax(0,1fr)_320px] gap-4 max-[960px]:grid-cols-1">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0e1117] shadow-xl shadow-black/20">
          <div className="flex items-center justify-between gap-4 border-b border-white/[.07] px-5 py-4 [&_span]:font-mono [&_span]:text-[7px] [&_span]:tracking-[.15em] [&_span]:text-violet-300 [&_h2]:mt-1 [&_h2]:text-sm [&_h2]:text-slate-100">
            <div>
              <span>01 · DRAW & REBUILD</span>
              <h2>
                {tr(
                  locale,
                  "روی بوم یک مسیر آزاد بکش",
                  "Draw any free-form path on the canvas",
                )}
              </h2>
            </div>
            <div className="flex items-center gap-2.5">
              <i
                className="grid size-11 place-items-center rounded-full bg-[conic-gradient(#a78bfa_var(--progress),rgba(255,255,255,.06)_0)] p-1 not-italic [&>span]:grid [&>span]:size-full [&>span]:place-items-center [&>span]:rounded-full [&>span]:bg-[#11151c] [&>span]:font-mono [&>span]:text-[7px] [&>span]:text-violet-300"
                style={
                  { "--progress": `${progress * 360}deg` } as CSSProperties
                }
              >
                <span>{Math.round(progress * 100)}%</span>
              </i>
               <div className="max-[520px]:hidden">
                <b className="block text-[8px] text-slate-300">
                  {playing
                    ? tr(locale, "در حال بازسازی", "Reconstructing")
                    : progress >= 1
                      ? tr(locale, "کامل شد", "Complete")
                      : tr(locale, "آماده", "Ready")}
                </b>
                <small className="mt-1 block text-[7px] text-slate-600">
                  {harmonics} {tr(locale, "مؤلفه فعال", "active components")}
                </small>
              </div>
            </div>
          </div>
          <div className="relative h-[min(62vh,620px)] min-h-96 touch-none overflow-hidden bg-black/25 [&>canvas]:size-full [&>canvas]:touch-none">
            <canvas
              ref={canvasRef}
              aria-label={tr(
                locale,
                "بوم رسم و بازسازی فوریه",
                "Fourier drawing and reconstruction canvas",
              )}
              onPointerDown={startDrawing}
              onPointerMove={continueDrawing}
              onPointerUp={finishDrawing}
              onPointerCancel={finishDrawing}
            />
            {!rawPoints.length && !drawingPoints.length && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center content-center gap-2 text-center">
                <span className="text-3xl text-slate-700">✎</span>
                <b className="text-[10px] text-slate-400">{tr(locale, "از هر نقطه شروع کن", "Start anywhere")}</b>
                <small className="text-[8px] text-slate-600">
                  {tr(
                    locale,
                    "ماوس یا لمس را نگه دار و مسیر را بکش",
                    "Hold mouse or touch and draw a path",
                  )}
                </small>
              </div>
            )}
            <div className="absolute bottom-3 right-3 rounded-lg border border-white/[.07] bg-black/30 px-2 py-1 font-mono text-[7px] text-slate-600">z(t) = x(t) + iy(t)</div>
          </div>
          <div className="flex items-center gap-2 border-t border-white/[.07] p-3 [&>button]:flex [&>button]:h-9 [&>button]:items-center [&>button]:gap-1.5 [&>button]:rounded-lg [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[.025] [&>button]:px-3 [&>button]:text-[8px] [&>button]:text-slate-400 [&>button]:transition [&>button:hover]:bg-white/[.06] [&>button:hover]:text-white [&>button:disabled]:cursor-not-allowed [&>button:disabled]:opacity-30">
            <button
              type="button"
              className="!border-violet-300 !bg-violet-400 !font-bold !text-[#140d21] hover:!bg-violet-300"
              disabled={!activeCoefficients.length}
              onClick={() => restart(true)}
            >
              <svg className="size-3" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>{" "}
              {tr(locale, "شروع بازسازی", "Start reconstruction")}
            </button>
            <button
              type="button"
              disabled={!activeCoefficients.length}
              onClick={() => setPlaying((value) => !value)}
            >
              {playing
                ? "Ⅱ " + tr(locale, "توقف", "Pause")
                : (
                    <svg
                      className="inline size-3"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" fill="currentColor" />
                    </svg>
                  ) + tr(locale, "ادامه", "Resume")}
            </button>
            <button
              type="button"
              disabled={!activeCoefficients.length}
              onClick={() => restart(false)}
            >
              ↺ {tr(locale, "از اول", "Restart")}
            </button>
            <span className="ms-auto font-mono text-[8px] text-slate-600">t = {progress.toFixed(3)}T</span>
          </div>
        </div>

        <aside className="grid content-start gap-4 rounded-2xl border border-white/10 bg-[#0e1117] p-4 shadow-xl shadow-black/20">
          <div className="border-b border-white/[.07] pb-3">
            <span className="font-mono text-[7px] tracking-[.15em] text-violet-300">CONTROL DESK</span>
            <h2 className="mt-1 text-sm text-slate-100">{tr(locale, "کنترل بازسازی", "Reconstruction controls")}</h2>
          </div>
          <div>
            <b className="mb-2 block text-[8px] text-slate-500">{tr(locale, "نمونه سریع", "Quick presets")}</b>
            <div className="grid grid-cols-3 gap-1.5 [&>button]:h-8 [&>button]:rounded-lg [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[.025] [&>button]:text-[8px] [&>button]:text-slate-400 [&>button:hover]:bg-white/[.06] [&>button:hover]:text-white">
              <button type="button" onClick={() => choosePreset(heartPreset())}>
                ♥ {tr(locale, "قلب", "Heart")}
              </button>
              <button type="button" onClick={() => choosePreset(starPreset())}>
                ★ {tr(locale, "ستاره", "Star")}
              </button>
              <button type="button" onClick={() => choosePreset(facePreset())}>
                ◯ {tr(locale, "چهره", "Face")}
              </button>
            </div>
          </div>
          <label className="grid gap-2 rounded-xl border border-white/[.07] bg-black/15 p-3">
            <span className="flex items-center justify-between">
              <b className="text-[8px] text-slate-400">{tr(locale, "تعداد هارمونیک‌ها", "Harmonic count")}</b>
              <em className="font-mono text-[8px] not-italic text-violet-300">{harmonics}</em>
            </span>
            <input
              className="h-1.5 accent-violet-400"
              type="range"
              min="1"
              max={Math.min(220, allCoefficients.length || 220)}
              value={harmonics}
              onChange={(event) => {
                setHarmonics(Number(event.target.value));
                restart(true);
              }}
            />
            <small className="text-[7px] leading-4 text-slate-600">
              {tr(
                locale,
                "بیشتر = جزئیات دقیق‌تر، محاسبه سنگین‌تر",
                "More = finer detail, heavier reconstruction",
              )}
            </small>
          </label>
          <label className="grid gap-2 rounded-xl border border-white/[.07] bg-black/15 p-3">
            <span className="flex items-center justify-between">
              <b className="text-[8px] text-slate-400">{tr(locale, "سرعت انیمیشن", "Animation speed")}</b>
              <em className="font-mono text-[8px] not-italic text-violet-300">{speed.toFixed(2)}×</em>
            </span>
            <input
              className="h-1.5 accent-violet-400"
              type="range"
              min="0.25"
              max="4"
              step="0.25"
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
            />
            <small className="text-[7px] leading-4 text-slate-600">
              {tr(
                locale,
                "فقط زمان نمایش را تغییر می‌دهد؛ ضرایب ثابت‌اند",
                "Changes playback time only; coefficients stay fixed",
              )}
            </small>
          </label>
          <div className="grid gap-1.5">
            <Toggle
              checked={showCircles}
              label={tr(locale, "نمایش دایره‌ها", "Show circles")}
              onChange={setShowCircles}
            />
            <Toggle
              checked={showVectors}
              label={tr(locale, "نمایش بردارها", "Show vectors")}
              onChange={setShowVectors}
            />
            <Toggle
              checked={showTrace}
              label={tr(locale, "نمایش رد مسیر", "Show trace")}
              onChange={setShowTrace}
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5 [&>div]:rounded-lg [&>div]:bg-black/15 [&>div]:p-2.5 [&_span]:block [&_span]:text-[6px] [&_span]:text-slate-600 [&_b]:mt-1 [&_b]:block [&_b]:font-mono [&_b]:text-[8px] [&_b]:text-slate-300">
            <div>
              <span>{tr(locale, "نمونه‌ها", "Samples")}</span>
              <b>{normalizedPath.length}</b>
            </div>
            <div>
              <span>
                {tr(locale, "انرژی پوشش‌داده‌شده", "Captured energy")}
              </span>
              <b>{(activeEnergy * 100).toFixed(1)}%</b>
            </div>
            <div>
              <span>MSE</span>
              <b>{mse.toExponential(2)}</b>
            </div>
            <div>
              <span>{tr(locale, "طول مسیر", "Path length")}</span>
              <b>{pathLength(rawPoints).toFixed(2)}</b>
            </div>
          </div>
          <button type="button" className="h-9 rounded-lg border border-rose-400/15 bg-rose-400/[.04] text-[8px] text-rose-300 hover:bg-rose-400/10" onClick={clear}>
            ⌫ {tr(locale, "پاک کردن بوم", "Clear canvas")}
          </button>
        </aside>
      </section>

      <section className="mx-auto mb-4 grid max-w-7xl grid-cols-2 gap-4 max-[800px]:grid-cols-1">
        <div className="rounded-2xl border border-white/10 bg-[#0e1117] p-4">
          <header className="flex items-start justify-between border-b border-white/[.07] pb-3 [&_span]:font-mono [&_span]:text-[7px] [&_span]:tracking-[.15em] [&_span]:text-cyan-300 [&_h2]:mt-1 [&_h2]:text-sm [&_h2]:text-slate-100">
            <div>
              <span>02 · EXPORT</span>
              <h2>
                {tr(
                  locale,
                  "انیمیشن و تصویر را ذخیره کن",
                  "Export animation and final art",
                )}
              </h2>
            </div>
            {exporting && <em className="font-mono text-[8px] not-italic text-cyan-300">{Math.round(exportProgress * 100)}%</em>}
          </header>
          <p className="text-[8px] leading-5 text-slate-600">
            {tr(
              locale,
              "هر GIF از فریم صفر آغاز می‌شود و یک دور کامل بازسازی را با استایل همین محیط ثبت می‌کند.",
              "Every GIF starts at frame zero and captures one complete reconstruction using this visual style.",
            )}
          </p>
          <div className="grid grid-cols-3 gap-2 max-[520px]:grid-cols-1 [&>button]:h-9 [&>button]:rounded-lg [&>button]:border [&>button]:border-cyan-400/15 [&>button]:bg-cyan-400/[.04] [&>button]:text-[8px] [&>button]:text-cyan-300 [&>button:hover]:bg-cyan-400/10 [&>button:disabled]:opacity-30">
            <button
              type="button"
              disabled={!activeCoefficients.length || Boolean(exporting)}
              onClick={() => void makeGif(true)}
            >
              ◉ {tr(locale, "GIF با دایره‌ها", "GIF with circles")}
            </button>
            <button
              type="button"
              disabled={!activeCoefficients.length || Boolean(exporting)}
              onClick={() => void makeGif(false)}
            >
              ⌁ {tr(locale, "GIF فقط مسیر", "Trace-only GIF")}
            </button>
            <button
              type="button"
              disabled={!activeCoefficients.length || Boolean(exporting)}
              onClick={exportPng}
            >
              ▣ {tr(locale, "تصویر نهایی PNG", "Final PNG")}
            </button>
          </div>
          {exporting && (
            <div className="mt-3 grid gap-1.5">
              <i className="h-1.5 overflow-hidden rounded-full bg-black/30">
                <b className="block h-full rounded-full bg-cyan-400" style={{ width: `${exportProgress * 100}%` }} />
              </i>
              <span className="text-[7px] text-slate-600">
                {tr(locale, "در حال ساخت فریم‌ها…", "Encoding frames…")}
              </span>
            </div>
          )}
          {exportError && (
            <p
              className={`mt-3 rounded-lg border p-2.5 text-[8px] ${exportSucceeded ? "border-emerald-400/15 bg-emerald-400/[.04] text-emerald-300" : "border-rose-400/15 bg-rose-400/[.04] text-rose-300"}`}
              role="status"
            >
              {exportError}
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0e1117] p-4">
          <header className="border-b border-white/[.07] pb-3">
            <span className="font-mono text-[7px] tracking-[.15em] text-amber-300">03 · LEARN</span>
            <h2 className="mt-1 text-sm text-slate-100">
              {tr(
                locale,
                "درون سیستم چه می‌گذرد؟",
                "What is happening inside?",
              )}
            </h2>
          </header>
          <div className="grid gap-2 py-3">
            {education.map((item, index) => (
              <article key={item.title} className={`grid grid-cols-[28px_1fr] gap-2 rounded-lg border p-2.5 ${item.done ? "border-emerald-400/15 bg-emerald-400/[.035]" : "border-white/[.07] bg-white/[.018]"}`}>
                <i className={`grid size-7 place-items-center rounded-full text-[8px] not-italic ${item.done ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-slate-600"}`}>{item.done ? "✓" : index + 1}</i>
                <div>
                  <b className="text-[8px] text-slate-300">{item.title}</b>
                  <p className="mb-0 mt-1 text-[7px] leading-4 text-slate-600">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
          <footer className="grid gap-1 rounded-xl bg-black/20 p-3">
            <code className="font-mono text-[9px] text-violet-300" dir="ltr">
              Cₖ = (1/N) Σ zₙ e<sup>−i2πkn/N</sup>
            </code>
            <span className="text-[7px] leading-4 text-slate-600">
              {tr(
                locale,
                "هر دایره: شعاع = |Cₖ| · سرعت = k · زاویه آغاز = arg(Cₖ)",
                "Each circle: radius = |Cₖ| · speed = k · initial angle = arg(Cₖ)",
              )}
            </span>
          </footer>
        </div>
      </section>

      <section className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-[#0e1117]">
        <header className="flex items-start justify-between gap-4 border-b border-white/[.07] px-5 py-4 max-[640px]:flex-col [&_span]:font-mono [&_span]:text-[7px] [&_span]:tracking-[.15em] [&_span]:text-amber-300 [&_h2]:mt-1 [&_h2]:text-sm [&_h2]:text-slate-100 [&_p]:m-0 [&_p]:max-w-xl [&_p]:text-[8px] [&_p]:leading-5 [&_p]:text-slate-600">
          <div>
            <span>04 · FOURIER INGREDIENTS</span>
            <h2>
              {tr(
                locale,
                "مؤلفه‌های سازنده‌ی مسیر",
                "The ingredients of your path",
              )}
            </h2>
          </div>
          <p>
            {tr(
              locale,
              "DC ابتدا و سپس مؤلفه‌ها بر اساس دامنه مرتب شده‌اند؛ ترتیب زنجیره جمع نهایی را تغییر نمی‌دهد.",
              "DC comes first, then components are ranked by amplitude; chain order does not change the final sum.",
            )}
          </p>
        </header>
        <div className="grid grid-cols-5 gap-2 p-4 max-[900px]:grid-cols-3 max-[560px]:grid-cols-2">
          {activeCoefficients.slice(0, 10).map((item, index) => (
            <article className="relative grid min-h-24 overflow-hidden rounded-xl border border-white/[.07] bg-white/[.018] p-3" key={`${item.frequency}-${index}`}>
              <span className="font-mono text-[7px] text-slate-600">#{index + 1}</span>
              <i
                className="absolute bottom-0 left-0 h-1 bg-violet-400/70"
                style={{
                  width: `${Math.max(5, (item.amplitude / Math.max(0.0001, activeCoefficients[1]?.amplitude ?? item.amplitude)) * 100)}%`,
                }}
              />
              <b className="mt-2 text-[10px] text-slate-200">k={item.frequency}</b>
              <em className="mt-1 font-mono text-[7px] not-italic text-violet-300">|C| {item.amplitude.toFixed(4)}</em>
              <small className="mt-1 font-mono text-[7px] text-slate-600">φ {((item.phase * 180) / Math.PI).toFixed(1)}°</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
