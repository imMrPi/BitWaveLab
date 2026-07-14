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
    <div className="plot-empty">
      <span className="plot-empty-icon">⌁</span>
      <p>{text}</p>
    </div>
  );
}

export const MiniWave = memo(function MiniWave({
  data,
  active = false,
}: {
  data?: LabData;
  active?: boolean;
}) {
  const samples = waveformFor(data);
  const fallback = Array.from(
    { length: 90 },
    (_, index) => Math.sin(index / 5) * Math.cos(index / 17),
  );
  return (
    <div className={`node-wave ${active ? "active" : ""}`}>
      <svg viewBox="0 0 180 34" preserveAspectRatio="none" aria-hidden="true">
        <path
          d={pathFromSamples(samples.length ? samples : fallback, 180, 34)}
        />
      </svg>
      <i />
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
    <div className="plot-wrap">
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
      <div className="plot-axis">
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
    <div className="plot-wrap">
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
      <div className="plot-axis">
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
    <div className="constellation-wrap">
      <svg viewBox="0 0 420 230" aria-label="نمودار صورت فلکی">
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
            className="ideal-symbol"
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
            className="received-symbol"
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
      <div className="constellation-note">
        <b>{modulationName}</b>
        <span>
          {symbols.length} {tr(locale, "سمبل", "symbols")}
        </span>
        <dl>
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
    <div className="bits-panel">
      <div className="bits-caption">
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
      <div className="bits-view" dir="ltr">
        {bits.slice(0, 180).map((bit, index) => (
          <span
            key={index}
            className={bit ? "bit-one" : "bit-zero"}
            title={`bit ${index}`}
          >
            {bit}
          </span>
        ))}
        {bits.length > 180 && (
          <span className="bits-more">+{bits.length - 180}</span>
        )}
      </div>
    </div>
  );
});
