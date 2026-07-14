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
      className={`fourier-toggle ${checked ? "active" : ""}`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <i>
        <span />
      </i>
      <b>{label}</b>
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
      className={`epicycle-lab locale-${locale}`}
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      <header className="epicycle-top">
        <Link href="/" className="fourier-brand">
          BitWave<span>Lab</span>
          <small>FOURIER EPICYCLES</small>
        </Link>
        <div>
          <span>COMPLEX DFT · 2D RECONSTRUCTION</span>
          <h1>
            {tr(
              locale,
              "شکل بکش؛ فوریه آن را با دایره‌های چرخان دوباره می‌سازد",
              "Draw a shape; Fourier rebuilds it with rotating circles",
            )}
          </h1>
          <p>
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

      <section className="epicycle-workspace">
        <div className="epicycle-stage-card">
          <div className="epicycle-stage-head">
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
            <div className="progress-orbit">
              <i
                style={
                  { "--progress": `${progress * 360}deg` } as CSSProperties
                }
              >
                <span>{Math.round(progress * 100)}%</span>
              </i>
              <div>
                <b>
                  {playing
                    ? tr(locale, "در حال بازسازی", "Reconstructing")
                    : progress >= 1
                      ? tr(locale, "کامل شد", "Complete")
                      : tr(locale, "آماده", "Ready")}
                </b>
                <small>
                  {harmonics} {tr(locale, "مؤلفه فعال", "active components")}
                </small>
              </div>
            </div>
          </div>
          <div className="epicycle-canvas-wrap">
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
              <div className="epicycle-empty">
                <span>✎</span>
                <b>{tr(locale, "از هر نقطه شروع کن", "Start anywhere")}</b>
                <small>
                  {tr(
                    locale,
                    "ماوس یا لمس را نگه دار و مسیر را بکش",
                    "Hold mouse or touch and draw a path",
                  )}
                </small>
              </div>
            )}
            <div className="canvas-corner-label">z(t) = x(t) + iy(t)</div>
          </div>
          <div className="transport-controls">
            <button
              type="button"
              className="primary"
              disabled={!activeCoefficients.length}
              onClick={() => restart(true)}
            >
              <svg className="play-icon" viewBox="0 0 24 24" aria-hidden="true">
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
                      className="play-icon"
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
            <span className="transport-time">t = {progress.toFixed(3)}T</span>
          </div>
        </div>

        <aside className="epicycle-control-panel">
          <div className="control-panel-title">
            <span>CONTROL DESK</span>
            <h2>{tr(locale, "کنترل بازسازی", "Reconstruction controls")}</h2>
          </div>
          <div className="preset-buttons">
            <b>{tr(locale, "نمونه سریع", "Quick presets")}</b>
            <div>
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
          <label className="epicycle-range">
            <span>
              <b>{tr(locale, "تعداد هارمونیک‌ها", "Harmonic count")}</b>
              <em>{harmonics}</em>
            </span>
            <input
              type="range"
              min="1"
              max={Math.min(220, allCoefficients.length || 220)}
              value={harmonics}
              onChange={(event) => {
                setHarmonics(Number(event.target.value));
                restart(true);
              }}
            />
            <small>
              {tr(
                locale,
                "بیشتر = جزئیات دقیق‌تر، محاسبه سنگین‌تر",
                "More = finer detail, heavier reconstruction",
              )}
            </small>
          </label>
          <label className="epicycle-range">
            <span>
              <b>{tr(locale, "سرعت انیمیشن", "Animation speed")}</b>
              <em>{speed.toFixed(2)}×</em>
            </span>
            <input
              type="range"
              min="0.25"
              max="4"
              step="0.25"
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
            />
            <small>
              {tr(
                locale,
                "فقط زمان نمایش را تغییر می‌دهد؛ ضرایب ثابت‌اند",
                "Changes playback time only; coefficients stay fixed",
              )}
            </small>
          </label>
          <div className="toggle-stack">
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
          <div className="epicycle-metrics">
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
          <button type="button" className="clear-epicycle" onClick={clear}>
            ⌫ {tr(locale, "پاک کردن بوم", "Clear canvas")}
          </button>
        </aside>
      </section>

      <section className="epicycle-lower-grid">
        <div className="export-card">
          <header>
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
            {exporting && <em>{Math.round(exportProgress * 100)}%</em>}
          </header>
          <p>
            {tr(
              locale,
              "هر GIF از فریم صفر آغاز می‌شود و یک دور کامل بازسازی را با استایل همین محیط ثبت می‌کند.",
              "Every GIF starts at frame zero and captures one complete reconstruction using this visual style.",
            )}
          </p>
          <div>
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
            <div className="export-progress">
              <i>
                <b style={{ width: `${exportProgress * 100}%` }} />
              </i>
              <span>
                {tr(locale, "در حال ساخت فریم‌ها…", "Encoding frames…")}
              </span>
            </div>
          )}
          {exportError && (
            <p
              className={`export-error ${exportSucceeded ? "success" : ""}`}
              role="status"
            >
              {exportError}
            </p>
          )}
        </div>
        <div className="education-card">
          <header>
            <span>03 · LEARN</span>
            <h2>
              {tr(
                locale,
                "درون سیستم چه می‌گذرد؟",
                "What is happening inside?",
              )}
            </h2>
          </header>
          <div>
            {education.map((item, index) => (
              <article key={item.title} className={item.done ? "done" : ""}>
                <i>{item.done ? "✓" : index + 1}</i>
                <div>
                  <b>{item.title}</b>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
          <footer>
            <code dir="ltr">
              Cₖ = (1/N) Σ zₙ e<sup>−i2πkn/N</sup>
            </code>
            <span>
              {tr(
                locale,
                "هر دایره: شعاع = |Cₖ| · سرعت = k · زاویه آغاز = arg(Cₖ)",
                "Each circle: radius = |Cₖ| · speed = k · initial angle = arg(Cₖ)",
              )}
            </span>
          </footer>
        </div>
      </section>

      <section className="coefficient-lab-card">
        <header>
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
        <div className="coefficient-visuals">
          {activeCoefficients.slice(0, 10).map((item, index) => (
            <article key={`${item.frequency}-${index}`}>
              <span>#{index + 1}</span>
              <i
                style={{
                  width: `${Math.max(5, (item.amplitude / Math.max(0.0001, activeCoefficients[1]?.amplitude ?? item.amplitude)) * 100)}%`,
                }}
              />
              <b>k={item.frequency}</b>
              <em>|C| {item.amplitude.toFixed(4)}</em>
              <small>φ {((item.phase * 180) / Math.PI).toFixed(1)}°</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
