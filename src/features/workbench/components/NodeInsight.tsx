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
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <section
        className="grid max-h-[min(760px,94dvh)] w-[min(940px,96vw)] gap-3 overflow-y-auto rounded-2xl border border-white/10 bg-[#0e1117] p-4 shadow-2xl shadow-black/70 [scrollbar-color:rgba(148,163,184,.18)_transparent] [scrollbar-width:thin]"
        onMouseDown={(event) => event.stopPropagation()}
        dir={locale === "fa" ? "rtl" : "ltr"}
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/10 pb-3 [&_span]:font-mono [&_span]:text-[7px] [&_span]:tracking-[.12em] [&_span]:text-violet-300 [&_h2]:mt-1 [&_h2]:text-lg [&_h2]:text-slate-100">
          <div>
            <span>
              {roleInfo[role].side} ·{" "}
              {locale === "fa" ? roleInfo[role].fa : roleInfo[role].en}
            </span>
            <h2>! {copy.name}</h2>
          </div>
          <button className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/[.03] text-slate-500 hover:bg-white/[.07] hover:text-white" type="button" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="grid grid-cols-[1fr_32px_1fr] items-center gap-2 [&>div]:rounded-xl [&>div]:border [&>div]:border-white/[.08] [&>div]:bg-white/[.02] [&>div]:p-3 [&_small]:block [&_small]:text-[7px] [&_small]:text-slate-600 [&_b]:mt-1 [&_b]:block [&_b]:text-[9px] [&_b]:text-slate-200 [&_em]:mt-1 [&_em]:block [&_em]:font-mono [&_em]:text-[7px] [&_em]:not-italic [&_em]:text-slate-500">
          <div>
            <small>{tr(locale, "مرحله قبل", "Previous stage")}</small>
            <b>
              {parentAlgorithm
                ? localizeAlgorithm(parentAlgorithm, locale).name
                : tr(locale, "آغاز زنجیره", "Pipeline start")}
            </b>
            <em>{formatKind(input?.kind ?? "none", locale)}</em>
          </div>
          <i className="text-center not-italic text-slate-600">→</i>
          <div className="!border-violet-400/20 !bg-violet-400/[.04]">
            <small>{tr(locale, "این نود", "This node")}</small>
            <b>{copy.name}</b>
            <em>{formatKind(output?.kind ?? algorithm.output, locale)}</em>
          </div>
        </div>
        <p className="m-0 rounded-xl border border-white/[.07] bg-black/15 p-3 text-[9px] leading-6 text-slate-400">{roleAction(role, locale)}</p>
        <div className="flex items-center justify-between gap-3 text-[8px] text-slate-400 max-[620px]:items-start max-[620px]:flex-col">
          <div>
            <span className="me-1 inline-block size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.7)]" />{" "}
            {tr(locale, "پروب لحظه‌ای دامنه–زمان", "Live amplitude–time probe")}
          </div>
          <code className="font-mono text-[7px] text-slate-600" dir="ltr">
            t={((cursor / sampleRate) * 1000).toFixed(3)} ms · in=
            {inputValue.toFixed(3)} · out={outputValue.toFixed(3)}
          </code>
        </div>
        <div className="grid min-h-64 grid-rows-[minmax(220px,1fr)_30px] overflow-hidden rounded-xl border border-white/[.08] bg-black/20">
          <svg className="size-full" viewBox="0 0 920 240" preserveAspectRatio="none">
            <line className="stroke-white/10 [stroke-dasharray:4_6]" x1="0" x2="920" y1="120" y2="120" />
            <path className="fill-none stroke-slate-500/50 stroke-[1.5]" d={makePath(visibleBefore)} />
            <path className="fill-none stroke-violet-300 stroke-2" d={makePath(visibleAfter)} />
            <line
              className="stroke-amber-300/70 stroke-1"
              x1={(cursor / Math.max(1, count - 1)) * 920}
              x2={(cursor / Math.max(1, count - 1)) * 920}
              y1="12"
              y2="228"
            />
            <circle
              className="fill-amber-300 stroke-amber-100 stroke-1"
              cx={(cursor / Math.max(1, count - 1)) * 920}
              cy={120 - (outputValue / max) * 88}
              r="5"
            />
          </svg>
          <div className="flex items-center gap-4 border-t border-white/[.06] px-3 text-[7px] text-slate-500 [&>span]:flex [&>span]:items-center [&>span]:gap-1.5 [&>span>i]:inline-block [&>span>i]:h-0.5 [&>span>i]:w-4 [&>b]:ms-auto [&>b]:text-slate-600">
            <span>
              <i className="bg-slate-500/60" />
              {tr(locale, "ورودی", "Input")}
            </span>
            <span>
              <i className="bg-violet-300" />
              {tr(locale, "خروجی", "Output")}
            </span>
            <b>{tr(locale, "دامنه", "Amplitude")}</b>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-2 max-[760px]:grid-cols-3 max-[460px]:grid-cols-2 [&>div]:rounded-lg [&>div]:border [&>div]:border-white/[.07] [&>div]:bg-white/[.02] [&>div]:p-2.5 [&_span]:block [&_span]:text-[7px] [&_span]:text-slate-600 [&_b]:mt-1 [&_b]:block [&_b]:font-mono [&_b]:text-[8px] [&_b]:text-slate-300">
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
