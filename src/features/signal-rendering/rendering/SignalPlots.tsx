"use client";

import { memo, useMemo } from "react";
import { constellationReference, spectrum } from "@/lib/signal-engine";
import { tr, type Locale } from "@/lib/i18n";
import type { LabData } from "../../../domain/signal/signal.types";
import {
  bitStreamFor,
  constellationFor,
  effectiveSampleRateFor,
  formatSignalNumber,
  pathFromSamples,
  waveformFor,
} from "../model/signal-view-model";

function EmptyPlot({ text }: { text: string }) {
  return (
    <div className="grid min-h-36 place-items-center content-center gap-2 rounded-lg border border-dashed border-white/10 bg-black/10 text-center text-slate-600">
      <span className="text-2xl text-slate-700">⌁</span>
      <p className="m-0 text-[8px] leading-5">{text}</p>
    </div>
  );
}

export const MiniWave = memo(function MiniWave({
  data,
  active = false,
  color = "#fbbf24",
}: {
  data?: LabData;
  active?: boolean;
  color?: string;
}) {
  const samples = waveformFor(data);
  const fallback = Array.from(
    { length: 90 },
    (_, index) => Math.sin(index / 5) * Math.cos(index / 17),
  );
  // The viewport shows only 90 units. Keeping a 270-unit cycle preserves the
  // waveform's horizontal scale instead of squeezing a full cycle into the card.
  const cycleWidth = 270;
  const path = pathFromSamples(samples.length ? samples : fallback, cycleWidth, 34);
  return (
    <div className={`relative mx-2.5 mb-[7px] h-[50px] overflow-hidden rounded-[7px] border border-slate-400/[.08] bg-[#090d13] [background-image:linear-gradient(rgba(148,163,184,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.05)_1px,transparent_1px)] [background-size:100%_12px,24px_100%] ${active ? "opacity-100" : "opacity-80"}`}>
      <svg className="relative h-full w-[400%]" viewBox="0 0 360 34" preserveAspectRatio="none" aria-hidden="true">
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            from="0 0"
            to={`-${cycleWidth} 0`}
            dur="12s"
            repeatCount="indefinite"
          />
          <path
            className="fill-none stroke-[1.5] [vector-effect:non-scaling-stroke]"
            style={{ stroke: color }}
            d={path}
          />
          <path
            className="fill-none stroke-[1.5] [vector-effect:non-scaling-stroke]"
            style={{ stroke: color }}
            d={path}
            transform={`translate(${cycleWidth} 0)`}
          />
          <g className="opacity-80" transform={`translate(${cycleWidth} 0)`}>
            <line y1="1" y2="33" className="stroke-[.55] [stroke-dasharray:2_2]" style={{ stroke: color }} />
            <circle cy="4" r="1.7" style={{ fill: color }} />
          </g>
        </g>
      </svg>
      <i className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#090d13] to-transparent ${active ? "opacity-70" : "opacity-40"}`} />
    </div>
  );
});

export const TimePlot = memo(function TimePlot({
  data,
  locale,
}: {
  data?: LabData;
  locale: Locale;
}) {
  const samples = waveformFor(data);
  const visibleSamples = samples.slice(0, 900);
  const effectiveSampleRate = effectiveSampleRateFor(data);
  const path = pathFromSamples(visibleSamples);
  if (!samples.length)
    return (
      <EmptyPlot
        text={tr(
          locale,
          "خروجی این Node دادهٔ قابل رسم ندارد.",
          "This node has no plottable output.",
        )}
      />
    );
  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_clamp(18px,3cqh,24px)] overflow-hidden rounded-lg border border-white/[.07] bg-black/15 [&>svg]:size-full">
      <svg
        viewBox="0 0 1000 210"
        preserveAspectRatio="none"
        aria-label="نمودار سیگنال در حوزه زمان"
      >
        <defs>
          <pattern
            id="time-grid"
            width="50"
            height="35"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 35"
              fill="none"
              stroke="rgba(148,163,184,.08)"
              strokeWidth="1"
            />
          </pattern>
          <linearGradient id="wave-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbbf24" stopOpacity=".2" />
            <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="1000" height="210" fill="url(#time-grid)" />
        <line
          x1="0"
          x2="1000"
          y1="105"
          y2="105"
          stroke="rgba(255,255,255,.16)"
          strokeDasharray="4 6"
        />
        <path
          d={`${path} L 1000,105 L 0,105 Z`}
          fill="url(#wave-fill)"
          opacity=".45"
        />
        <path
          d={path}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2.3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex items-center justify-between border-t border-white/[.06] px-2 font-mono text-[7px] text-slate-600">
        <span>0 ms</span>
        <span>
          {tr(locale, "زمان", "Time")} · {visibleSamples.length}/
          {samples.length}
        </span>
        <span>
          {formatSignalNumber(
            (visibleSamples.length / effectiveSampleRate) * 1000,
          )}{" "}
          ms
        </span>
      </div>
    </div>
  );
});

export const SpectrumPlot = memo(function SpectrumPlot({
  data,
  locale,
}: {
  data?: LabData;
  locale: Locale;
}) {
  const samples = waveformFor(data);
  const effectiveSampleRate = effectiveSampleRateFor(data);
  const bins = useMemo(
    () => spectrum(samples, effectiveSampleRate),
    [samples, effectiveSampleRate],
  );
  if (!bins.length)
    return (
      <EmptyPlot
        text={tr(
          locale,
          "برای نمایش طیف، یک Sample Stream اجرا کن.",
          "Run a sample stream to display its spectrum.",
        )}
      />
    );
  const max = Math.max(1e-9, ...bins.map((bin) => bin.magnitude));
  const line = bins
    .map(
      (bin, index) =>
        `${index ? "L" : "M"}${((index / Math.max(1, bins.length - 1)) * 1000).toFixed(2)},${(190 - (bin.magnitude / max) * 160).toFixed(2)}`,
    )
    .join(" ");
  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_clamp(18px,3cqh,24px)] overflow-hidden rounded-lg border border-white/[.07] bg-black/15 [&>svg]:size-full">
      <svg
        viewBox="0 0 1000 210"
        preserveAspectRatio="none"
        aria-label="طیف دامنه سیگنال"
      >
        <defs>
          <pattern
            id="spectrum-grid"
            width="50"
            height="35"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 35"
              fill="none"
              stroke="rgba(148,163,184,.08)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="1000" height="210" fill="url(#spectrum-grid)" />
        <path d={`${line} L1000,195 L0,195 Z`} fill="rgba(167,139,250,.14)" />
        <path
          d={line}
          fill="none"
          stroke="#a78bfa"
          strokeWidth="2.2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex items-center justify-between border-t border-white/[.06] px-2 font-mono text-[7px] text-slate-600">
        <span>DC</span>
        <span>{tr(locale, "فرکانس", "Frequency")}</span>
        <span>{formatSignalNumber(bins.at(-1)?.frequency ?? 0)} Hz</span>
      </div>
    </div>
  );
});

export const ConstellationPlot = memo(function ConstellationPlot({
  data,
  locale,
}: {
  data?: LabData;
  locale: Locale;
}) {
  const symbols = constellationFor(data);
  if (!symbols.length)
    return (
      <EmptyPlot
        text={tr(
          locale,
          "این خروجی سمبل I/Q ندارد؛ یک مدولاتور QPSK یا QAM را انتخاب کن.",
          "This output has no I/Q symbols; select a PSK or QAM modulator.",
        )}
      />
    );
  const scheme = String(data?.metadata.constellationScheme ?? "");
  const idealSymbols = scheme ? constellationReference(scheme) : [];
  const maxCoordinate = Math.max(
    1.12,
    ...[...symbols, ...idealSymbols].flatMap((point) => [
      Math.abs(point.re),
      Math.abs(point.im),
    ]),
  );
  const scale = 88 / maxCoordinate;
  const modulationName = String(data?.metadata.modulation ?? "I/Q");
  const mapping = String(data?.metadata.symbolMapping ?? "—");
  const averageEnergy =
    symbols.reduce(
      (sum, point) => sum + point.re * point.re + point.im * point.im,
      0,
    ) / symbols.length;
  const idealEnergy = idealSymbols.length
    ? idealSymbols.reduce(
        (sum, point) => sum + point.re * point.re + point.im * point.im,
        0,
      ) / idealSymbols.length
    : averageEnergy;
  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_clamp(130px,18cqw,210px)] gap-[clamp(4px,.7cqw,10px)] @max-[620px]:grid-cols-1">
      <svg className="size-full min-h-48 rounded-lg border border-white/[.07] bg-black/15" viewBox="0 0 420 230" aria-label="نمودار صورت فلکی">
        <rect width="420" height="230" fill="rgba(3,7,18,.35)" />
        {Array.from({ length: 9 }, (_, index) => (
          <line
            key={`v${index}`}
            x1={42 + index * 42}
            x2={42 + index * 42}
            y1="12"
            y2="218"
            stroke="rgba(148,163,184,.07)"
          />
        ))}
        {Array.from({ length: 5 }, (_, index) => (
          <line
            key={`h${index}`}
            x1="10"
            x2="410"
            y1={23 + index * 46}
            y2={23 + index * 46}
            stroke="rgba(148,163,184,.07)"
          />
        ))}
        <line
          x1="210"
          x2="210"
          y1="8"
          y2="222"
          stroke="rgba(255,255,255,.22)"
        />
        <line
          x1="8"
          x2="412"
          y1="115"
          y2="115"
          stroke="rgba(255,255,255,.22)"
        />
        {modulationName.includes("PSK") && (
          <circle
            cx="210"
            cy="115"
            r={scale}
            fill="none"
            stroke="rgba(167,139,250,.2)"
            strokeDasharray="4 5"
          />
        )}
        {idealSymbols.map((point, index) => (
          <circle
            key={`ideal-${index}`}
            cx={210 + point.re * scale}
            cy={115 - point.im * scale}
            r="6.5"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="1.2"
            strokeOpacity=".72"
          />
        ))}
        {symbols.slice(0, 360).map((point, index) => (
          <circle
            key={index}
            cx={210 + point.re * scale}
            cy={115 - point.im * scale}
            r="4"
            fill="#f472b6"
            fillOpacity=".52"
            stroke="#fbcfe8"
            strokeOpacity=".5"
          />
        ))}
        <text x="398" y="108" fill="#64748b" fontSize="10">
          I
        </text>
        <text x="218" y="18" fill="#64748b" fontSize="10">
          Q
        </text>
      </svg>
      <div className="rounded-lg border border-white/[.07] bg-white/[.018] p-3">
        <b className="block text-[10px] text-violet-300">{modulationName}</b>
        <span className="mt-1 block text-[8px] text-slate-600">
          {symbols.length} {tr(locale, "سمبل", "symbols")}
        </span>
        <dl className="mt-3 grid gap-2 text-[7px] [&>div]:flex [&>div]:justify-between [&>div]:gap-2 [&_dt]:text-slate-600 [&_dd]:m-0 [&_dd]:font-mono [&_dd]:text-slate-300">
          <div>
            <dt>Mapping</dt>
            <dd>{mapping}</dd>
          </div>
          <div>
            <dt>Eₛ ideal</dt>
            <dd>{formatSignalNumber(idealEnergy)}</dd>
          </div>
          <div>
            <dt>Eₛ observed</dt>
            <dd>{formatSignalNumber(averageEnergy)}</dd>
          </div>
          <div>
            <dt>Axes</dt>
            <dd>I + jQ</dd>
          </div>
        </dl>
      </div>
    </div>
  );
});

export const BitsPlot = memo(function BitsPlot({
  data,
  locale,
}: {
  data?: LabData;
  locale: Locale;
}) {
  const bits = bitStreamFor(data);
  if (!bits.length)
    return (
      <EmptyPlot
        text={tr(
          locale,
          "خروجی انتخاب‌شده Bit Stream نیست.",
          "The selected output is not a bit stream.",
        )}
      />
    );
  const reference = data?.kind !== "bits" && data?.kind !== "frames";
  return (
    <div className="overflow-hidden rounded-lg border border-white/[.07] bg-black/15">
      <div className="border-b border-white/[.06] px-3 py-2 text-[8px] text-slate-500">
        {reference
          ? tr(
              locale,
              "بیت‌های مرجع نگاشت‌شده روی سیگنال",
              "Reference bits mapped onto the signal",
            )
          : tr(
              locale,
              "خروجی Bit Stream این مرحله",
              "This stage's Bit Stream output",
            )}{" "}
        · {bits.length}
      </div>
      <div className="flex flex-wrap gap-1 p-3 font-mono" dir="ltr">
        {bits.slice(0, 180).map((bit, index) => (
          <span
            key={index}
            className={bit ? "grid size-5 place-items-center rounded bg-amber-400/15 text-[8px] text-amber-300" : "grid size-5 place-items-center rounded bg-white/[.035] text-[8px] text-slate-600"}
            title={`bit ${index}`}
          >
            {bit}
          </span>
        ))}
        {bits.length > 180 && (
          <span className="grid h-5 place-items-center rounded bg-violet-400/10 px-2 text-[7px] text-violet-300">+{bits.length - 180}</span>
        )}
      </div>
    </div>
  );
});
