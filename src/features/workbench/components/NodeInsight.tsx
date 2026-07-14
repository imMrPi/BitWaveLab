"use client";

import { useEffect, useState } from "react";
import {
  algorithmById,
  formatKind,
  type GraphNode,
  type LabData,
} from "@/lib/signal-engine";
import { localizeAlgorithm, tr, type Locale } from "@/lib/i18n";
import {
  roleForAlgorithm,
  roleInfo,
  type PipelineRole,
} from "@/lib/recommendation-engine";
import {
  formatSignalNumber as numberText,
  getSignalStats as signalStats,
} from "../../signal-rendering/model/signal-view-model";

function roleAction(role: PipelineRole, locale: Locale) {
  const fa: Record<PipelineRole, string> = {
    source: "اطلاعات اولیه را می‌سازد و مرجع مقایسه را نگه می‌دارد.",
    "source-encoder":
      "افزونگی آماری منبع را کم می‌کند تا داده با بیت کمتری نمایش داده شود.",
    scrambler:
      "الگوی بیت را سفید می‌کند؛ این رمزنگاری نیست و باید در گیرنده معکوس شود.",
    "channel-encoder":
      "افزونگی کنترل‌شده اضافه می‌کند تا خطای کانال کشف یا اصلاح شود.",
    interleaver:
      "ترتیب بیت‌ها را جابه‌جا می‌کند تا Burst Error بین چند کدواژه پخش شود.",
    "line-coder": "بیت منطقی را به سطح و گذار زمانی Baseband تبدیل می‌کند.",
    multiplexer:
      "چند جریان را روی منبع زمانی، فرکانسی یا کدی مشترک قرار می‌دهد.",
    modulator: "بیت‌ها را به دامنه، فاز یا فرکانس حامل نگاشت می‌کند.",
    "tx-filter": "پالس را شکل می‌دهد تا پهنای باند و ISI کنترل شود.",
    channel: "نویز، تضعیف، Fading یا اعوجاج مسیر را به سیگنال اعمال می‌کند.",
    "gain-control":
      "توان دریافتی را بدون تغییر اطلاعات به محدوده مناسب گیرنده می‌آورد.",
    synchronizer: "زمان سمبل، فاز، فرکانس یا مرز فریم را بازیابی می‌کند.",
    "matched-filter":
      "انرژی پالس را در لحظه تصمیم متمرکز و SNR را بیشینه می‌کند.",
    equalizer:
      "اثر حافظه و چندمسیری کانال را تخمین می‌زند و ISI را کاهش می‌دهد.",
    demodulator:
      "پوش، انرژی یا مؤلفه پایه را از حامل استخراج می‌کند و خروجی را برای تصمیم آماده می‌سازد.",
    detector: "سمبل یا نمونه دریافتی را به محتمل‌ترین بیت‌ها تبدیل می‌کند.",
    deinterleaver:
      "جایگشت فرستنده را معکوس می‌کند تا کدواژه‌ها به ترتیب اصلی برگردند.",
    "channel-decoder":
      "افزونگی FEC را مصرف و بیت‌های محافظت‌شده را بازیابی می‌کند.",
    descrambler: "توالی Scrambler را با همان حالت اولیه معکوس می‌کند.",
    "source-decoder": "نمایش فشرده را به اطلاعات منبع بازمی‌گرداند.",
    reconstruction:
      "نمونه‌های دیجیتال را برای خروجی پیوسته و DAC آماده می‌کند.",
    measurement:
      "سیگنال را تغییر نمی‌دهد؛ فقط آن را اندازه‌گیری یا نمایش می‌دهد.",
    embedded: "رفتار ADC، DMA یا گذرگاه سخت‌افزاری را مدل می‌کند.",
    transform: "یک تبدیل آموزشی روی نمایش سیگنال اعمال می‌کند.",
  };
  return locale === "fa"
    ? fa[role]
    : `${roleInfo[role].en} transforms the previous stage while preserving the pipeline's data contract.`;
}

type Props = {
  node: GraphNode;
  parent?: GraphNode;
  input?: LabData;
  output?: LabData;
  locale: Locale;
  onClose: () => void;
};

export function NodeInsight({
  node,
  parent,
  input,
  output,
  locale,
  onClose,
}: Props) {
  const algorithm = algorithmById.get(node.algorithmId)!;
  const parentAlgorithm = parent
    ? algorithmById.get(parent.algorithmId)
    : undefined;
  const role = roleForAlgorithm(node.algorithmId);
  const before = signalStats(input);
  const after = signalStats(output);
  const visibleBefore = before.values.slice(0, 280);
  const visibleAfter = after.values.slice(0, 280);
  const count = Math.max(visibleBefore.length, visibleAfter.length, 1);
  const max = Math.max(
    1e-9,
    ...visibleBefore.map(Math.abs),
    ...visibleAfter.map(Math.abs),
  );
  const makePath = (values: number[]) =>
    values
      .map(
        (value, index) =>
          `${index ? "L" : "M"}${(index / Math.max(1, count - 1)) * 920},${120 - (value / max) * 88}`,
      )
      .join(" ");
  const [cursor, setCursor] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setCursor((value) => (value + 1) % count),
      85,
    );
    return () => window.clearInterval(timer);
  }, [count]);
  const sampleRate = output?.sampleRate ?? input?.sampleRate ?? 1;
  const inputValue = visibleBefore[cursor] ?? 0;
  const outputValue = visibleAfter[cursor] ?? 0;
  const copy = localizeAlgorithm(algorithm, locale);
  return (
    <div className="insight-backdrop" onMouseDown={onClose}>
      <section
        className="node-insight"
        onMouseDown={(event) => event.stopPropagation()}
        dir={locale === "fa" ? "rtl" : "ltr"}
      >
        <header>
          <div>
            <span>
              {roleInfo[role].side} ·{" "}
              {locale === "fa" ? roleInfo[role].fa : roleInfo[role].en}
            </span>
            <h2>! {copy.name}</h2>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="insight-chain">
          <div>
            <small>{tr(locale, "مرحله قبل", "Previous stage")}</small>
            <b>
              {parentAlgorithm
                ? localizeAlgorithm(parentAlgorithm, locale).name
                : tr(locale, "آغاز زنجیره", "Pipeline start")}
            </b>
            <em>{formatKind(input?.kind ?? "none", locale)}</em>
          </div>
          <i>→</i>
          <div className="active">
            <small>{tr(locale, "این نود", "This node")}</small>
            <b>{copy.name}</b>
            <em>{formatKind(output?.kind ?? algorithm.output, locale)}</em>
          </div>
        </div>
        <p className="insight-explanation">{roleAction(role, locale)}</p>
        <div className="insight-live-head">
          <div>
            <span className="live-dot" />{" "}
            {tr(locale, "پروب لحظه‌ای دامنه–زمان", "Live amplitude–time probe")}
          </div>
          <code dir="ltr">
            t={((cursor / sampleRate) * 1000).toFixed(3)} ms · in=
            {inputValue.toFixed(3)} · out={outputValue.toFixed(3)}
          </code>
        </div>
        <div className="insight-chart">
          <svg viewBox="0 0 920 240" preserveAspectRatio="none">
            <line x1="0" x2="920" y1="120" y2="120" />
            <path className="before" d={makePath(visibleBefore)} />
            <path className="after" d={makePath(visibleAfter)} />
            <line
              className="cursor"
              x1={(cursor / Math.max(1, count - 1)) * 920}
              x2={(cursor / Math.max(1, count - 1)) * 920}
              y1="12"
              y2="228"
            />
            <circle
              cx={(cursor / Math.max(1, count - 1)) * 920}
              cy={120 - (outputValue / max) * 88}
              r="5"
            />
          </svg>
          <div>
            <span>
              <i className="before" />
              {tr(locale, "ورودی", "Input")}
            </span>
            <span>
              <i className="after" />
              {tr(locale, "خروجی", "Output")}
            </span>
            <b>{tr(locale, "دامنه", "Amplitude")}</b>
          </div>
        </div>
        <div className="insight-metrics">
          <div>
            <span>{tr(locale, "قله ورودی", "Input peak")}</span>
            <b>{numberText(before.peak)}</b>
          </div>
          <div>
            <span>{tr(locale, "قله خروجی", "Output peak")}</span>
            <b>{numberText(after.peak)}</b>
          </div>
          <div>
            <span>RMS in</span>
            <b>{numberText(before.rms)}</b>
          </div>
          <div>
            <span>RMS out</span>
            <b>{numberText(after.rms)}</b>
          </div>
          <div>
            <span>{tr(locale, "تعداد داده", "Data length")}</span>
            <b>
              {after.values.length ||
                output?.bits?.length ||
                output?.symbols?.length ||
                0}
            </b>
          </div>
          <div>
            <span>{tr(locale, "نرخ نمونه", "Sample rate")}</span>
            <b>{numberText(sampleRate)} Hz</b>
          </div>
        </div>
      </section>
    </div>
  );
}
