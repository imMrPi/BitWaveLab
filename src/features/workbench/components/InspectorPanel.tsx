import type { CSSProperties } from "react";
import {
  categoryMeta,
  formatKind,
  type AlgorithmDefinition,
  type GraphNode,
  type GraphRun,
  type ParameterValue,
} from "@/lib/signal-engine";
import {
  localizeAlgorithm,
  localizeCategory,
  localizeSuggestion,
  tr,
  type Locale,
} from "@/lib/i18n";
import {
  roleInfo,
  type PipelineAssessment,
  type PipelineSuggestion,
} from "@/lib/recommendation-engine";
import { formatSignalMetric as metricText } from "../../signal-rendering/model/signal-view-model";
import { ParameterInput } from "./ParameterInput";

const parameterEnglish: Record<string, string> = {
  bits: "Bit sequence",
  sps: "Samples per symbol",
  sampleRate: "Sample rate",
  frequency: "Frequency",
  amplitude: "Amplitude",
  snr: "Signal-to-noise ratio",
  rolloff: "Roll-off factor",
  levels: "Quantization levels",
  bitsPerSample: "Bits per sample",
  factor: "Rate factor",
  threshold: "Decision threshold",
  loss: "Path loss",
  echo: "Echo coefficient",
  offset: "Frequency offset",
  limit: "Clipping limit",
  window: "Window length",
  resolution: "ADC resolution",
  carrier: "Carrier frequency",
  baud: "Baud rate",
};

type Props = {
  locale: Locale;
  node?: GraphNode;
  algorithm?: AlgorithmDefinition;
  result?: GraphRun["results"][string];
  assessment: PipelineAssessment;
  suggestions: PipelineSuggestion[];
  onToggleBypass: (id: string) => void;
  onApplySuggestion: (id: string) => void;
  onUpdateParam: (key: string, value: ParameterValue) => void;
  onRemove: (id: string) => void;
};

export function InspectorPanel({
  locale,
  node,
  algorithm,
  result,
  assessment,
  suggestions,
  onToggleBypass,
  onApplySuggestion,
  onUpdateParam,
  onRemove,
}: Props) {
  const copy = algorithm ? localizeAlgorithm(algorithm, locale) : undefined;
  const parameters =
    algorithm?.params.filter((parameter) => !parameter.hidden) ?? [];
  return (
    <aside
      className="grid h-full min-h-0 grid-rows-[77px_minmax(0,1fr)] border-l border-slate-400/[.13] bg-[#0c0f14] [direction:rtl]"
      dir={locale === "fa" ? "rtl" : "ltr"}
      lang={locale}
    >
      <div className="flex h-[77px] items-center justify-between gap-3 border-b border-slate-400/[.13] bg-[#0c0f14] px-[15px]">
        <div>
          <span className="block font-mono text-[7px] font-black tracking-[.15em] text-amber-400">NODE INSPECTOR</span>
          <h2 className="mt-1 text-[11px] text-slate-100">{tr(locale, "پارامتر و منطق", "Parameters & logic")}</h2>
        </div>
        <span className={`rounded-full border px-2 py-1 font-mono text-[7px] ${result?.status === "error" ? "border-rose-400/20 bg-rose-400/10 text-rose-300" : result?.status === "success" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-white/10 bg-white/[.03] text-slate-500"}`}>
          {result?.status === "error"
            ? tr(locale, "خطا", "Error")
            : result?.status === "success"
              ? tr(locale, "آماده", "Ready")
              : "Idle"}
        </span>
      </div>
      {node && algorithm ? (
        <div className="min-h-0 overflow-y-auto p-3 [scrollbar-color:rgba(148,163,184,.18)_transparent] [scrollbar-width:thin]">
          <section
            className="mb-3 grid grid-cols-[48px_minmax(0,1fr)] gap-3 rounded-xl border border-white/[.08] bg-white/[.02] p-3"
            style={
              {
                "--node-color": categoryMeta[algorithm.category].color,
              } as CSSProperties
            }
          >
            <div className="grid size-12 place-items-center rounded-xl border font-mono text-[9px] font-black" style={{ borderColor: `${categoryMeta[algorithm.category].color}55`, background: `${categoryMeta[algorithm.category].color}14`, color: categoryMeta[algorithm.category].color }}>
              {algorithm.shortName.slice(0, 3)}
            </div>
            <div className="min-w-0">
              <span className="text-[7px] font-bold text-slate-600">{localizeCategory(algorithm.category, locale).name}</span>
              <h3 className="my-1 truncate text-[11px] text-slate-100">{copy?.name}</h3>
              <p className="m-0 line-clamp-2 text-[8px] leading-4 text-slate-500">{copy?.summary}</p>
            </div>
          </section>
          <section className="mb-3 overflow-hidden rounded-xl border border-violet-400/15 bg-violet-400/[.035]">
            <div className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2 border-b border-violet-400/10 p-3">
              <span className="grid size-7 place-items-center rounded-lg bg-violet-400/10 text-violet-300">✦</span>
              <div className="min-w-0">
                <b className="block text-[9px] text-slate-200">
                  {tr(
                    locale,
                    "راهنمای هوشمند زنجیره",
                    "Intelligent pipeline guide",
                  )}
                </b>
                <small className="mt-0.5 block text-[7px] text-slate-600">
                  {tr(
                    locale,
                    "بر اساس کل مسیر، نه فقط یک نود",
                    "Based on the whole branch, not one node",
                  )}
                </small>
              </div>
              <em className="font-mono text-[8px] not-italic text-violet-300">{assessment.completion}%</em>
            </div>
            <div className="grid gap-2 border-b border-violet-400/10 p-3 [&>div]:grid [&>div]:grid-cols-[22px_minmax(0,1fr)_28px] [&>div]:items-center [&>div]:gap-2 [&>div>span]:font-mono [&>div>span]:text-[7px] [&>div>span]:text-slate-500 [&>div>strong]:font-mono [&>div>strong]:text-[7px] [&>div>strong]:text-slate-500 [&>p]:m-0 [&>p]:text-[7px] [&>p]:leading-4 [&>p]:text-amber-300/70">
              <div>
                <span>TX</span>
                <i className="h-1.5 overflow-hidden rounded-full bg-black/30">
                  <b className="block h-full rounded-full bg-cyan-400/60" style={{ width: `${assessment.transmitter}%` }} />
                </i>
                <strong>{assessment.transmitter}%</strong>
              </div>
              <div>
                <span>RX</span>
                <i className="h-1.5 overflow-hidden rounded-full bg-black/30">
                  <b className="block h-full rounded-full bg-violet-400/60" style={{ width: `${assessment.receiver}%` }} />
                </i>
                <strong>{assessment.receiver}%</strong>
              </div>
              {assessment.warnings.slice(0, 2).map((warning, index) => (
                <p key={index}>⚠ {warning}</p>
              ))}
            </div>
            <div className="grid gap-2 p-2.5">
              {suggestions.length ? (
                suggestions.map((item) => {
                  const suggestion = localizeSuggestion(item, locale);
                  return (
                    <article key={item.id} className={`rounded-lg border p-2.5 ${item.level === "important" ? "border-rose-400/15 bg-rose-400/[.035]" : item.level === "optimize" ? "border-cyan-400/15 bg-cyan-400/[.035]" : "border-amber-400/15 bg-amber-400/[.035]"}`}>
                      <div className="mb-1 grid gap-0.5">
                        <span className="font-mono text-[6px] text-slate-600">
                          {locale === "fa"
                            ? roleInfo[item.role].fa
                            : roleInfo[item.role].en}{" "}
                          · {item.confidence}%
                        </span>
                        <b className="text-[8px] text-slate-200">{suggestion.title}</b>
                      </div>
                      <p className="my-1.5 text-[7px] leading-4 text-slate-500">{suggestion.reason}</p>
                      <small className="block text-[7px] leading-4 text-slate-600">
                        {tr(locale, "نتیجه:", "Outcome:")} {suggestion.outcome}
                      </small>
                      <button
                        className="mt-2 h-7 w-full rounded-md border border-white/10 bg-white/[.035] text-[7px] font-bold text-slate-300 hover:bg-white/[.07]"
                        type="button"
                        onClick={() => onApplySuggestion(item.algorithmId)}
                      >
                        ＋{" "}
                        {tr(
                          locale,
                          "افزودن و اتصال خودکار",
                          "Insert and reconnect automatically",
                        )}
                      </button>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-lg border border-emerald-400/10 bg-emerald-400/[.035] p-3">
                  <b className="block text-[8px] leading-4 text-emerald-300">
                    ✓{" "}
                    {tr(
                      locale,
                      "برای این نقطه پیشنهاد ضروری دیگری وجود ندارد.",
                      "No required next step remains at this point.",
                    )}
                  </b>
                  <span className="mt-1.5 block text-[7px] leading-4 text-slate-600">
                    {tr(
                      locale,
                      "یک نود دیگر از مسیر را انتخاب کن یا BER نهایی را بررسی کن.",
                      "Select another branch stage or inspect the final BER.",
                    )}
                  </span>
                </div>
              )}
            </div>
          </section>
          <section className="mb-3 grid grid-cols-[1fr_24px_1fr] items-center rounded-xl border border-white/[.08] bg-black/15 p-2 text-center [&>div>span]:block [&>div>span]:text-[7px] [&>div>span]:text-slate-600 [&>div>b]:mt-1 [&>div>b]:block [&>div>b]:font-mono [&>div>b]:text-[8px] [&>div>b]:text-slate-300">
            <div>
              <span>{tr(locale, "ورودی", "Input")}</span>
              <b>{formatKind(algorithm.input, locale)}</b>
            </div>
            <i className="not-italic text-slate-700" aria-hidden="true">{locale === "fa" ? "←" : "→"}</i>
            <div>
              <span>{tr(locale, "خروجی", "Output")}</span>
              <b>{formatKind(algorithm.output, locale)}</b>
            </div>
          </section>
          {algorithm.input !== "none" && (
            <button
              type="button"
              className={`mb-3 grid w-full grid-cols-[32px_1fr] items-center gap-2 rounded-xl border p-2.5 text-start transition ${node.disabled ? "border-amber-400/25 bg-amber-400/[.07]" : "border-white/[.08] bg-white/[.02] hover:bg-white/[.04]"} [&>span]:grid [&>span]:size-8 [&>span]:place-items-center [&>span]:rounded-lg [&>span]:bg-white/5 [&>span]:text-amber-300 [&_b]:block [&_b]:text-[8px] [&_b]:text-slate-200 [&_small]:mt-1 [&_small]:block [&_small]:text-[7px] [&_small]:leading-4 [&_small]:text-slate-600`}
              onClick={() => onToggleBypass(node.id)}
            >
              <span>⏻</span>
              <div>
                <b>
                  {node.disabled
                    ? tr(locale, "فعال‌کردن پردازش", "Enable processing")
                    : tr(locale, "غیرفعال‌کردن و Bypass", "Disable and bypass")}
                </b>
                <small>
                  {tr(
                    locale,
                    "در حالت Bypass سیگنال ورودی بدون تغییر عبور می‌کند.",
                    "In bypass mode, the input signal passes through unchanged.",
                  )}
                </small>
              </div>
            </button>
          )}
          <section className="mb-3 rounded-xl border border-white/[.08] bg-white/[.018] p-3">
            <div className="mb-3 grid grid-cols-[28px_1fr] items-center gap-2 [&>span]:grid [&>span]:size-7 [&>span]:place-items-center [&>span]:rounded-lg [&>span]:bg-white/5 [&>span]:text-slate-400 [&_h4]:m-0 [&_h4]:text-[9px] [&_h4]:text-slate-200 [&_p]:mt-0.5 [&_p]:text-[7px] [&_p]:text-slate-600">
              <span>⚙</span>
              <div>
                <h4>{tr(locale, "پارامترها", "Parameters")}</h4>
                <p>
                  {tr(
                    locale,
                    "تغییرات در حالت زنده فوراً اجرا می‌شوند.",
                    "Changes run immediately in live mode.",
                  )}
                </p>
              </div>
            </div>
            {parameters.length ? (
              <div className="grid gap-3">
                {parameters.map((definition) => (
                  <label
                    key={definition.key}
                    className="grid gap-1.5 [&>span]:flex [&>span]:items-center [&>span]:justify-between [&>span>b]:text-[8px] [&>span>b]:text-slate-400 [&>span>small]:font-mono [&>span>small]:text-[7px] [&>span>small]:text-slate-600 [&>output]:justify-self-end [&>output]:rounded [&>output]:bg-amber-400/10 [&>output]:px-1.5 [&>output]:py-0.5 [&>output]:font-mono [&>output]:text-[7px] [&>output]:text-amber-300"
                  >
                    <span>
                      <b>
                        {locale === "fa"
                          ? definition.label
                          : (parameterEnglish[definition.key] ??
                            definition.key.replace(/([A-Z])/g, " $1"))}
                      </b>
                      {definition.unit && <small>{definition.unit}</small>}
                    </span>
                    {definition.type === "range" && (
                      <output>
                        {metricText(
                          node.params[definition.key] ?? definition.default,
                        )}
                      </output>
                    )}
                    <ParameterInput
                      definition={definition}
                      value={node.params[definition.key] ?? definition.default}
                      onChange={(value) => onUpdateParam(definition.key, value)}
                    />
                  </label>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-white/10 p-3 text-center text-[8px] text-slate-600">
                {tr(
                  locale,
                  "این بلوک پارامتر قابل تنظیم ندارد.",
                  "This block has no adjustable parameters.",
                )}
              </div>
            )}
          </section>
          <section className="mb-3 rounded-xl border border-white/[.08] bg-white/[.018] p-3 [&>p]:text-[8px] [&>p]:leading-5 [&>p]:text-slate-500">
            <div className="mb-3 grid grid-cols-[28px_1fr] items-center gap-2 [&>span]:grid [&>span]:size-7 [&>span]:place-items-center [&>span]:rounded-lg [&>span]:bg-violet-400/10 [&>span]:text-violet-300 [&_h4]:m-0 [&_h4]:text-[9px] [&_h4]:text-slate-200 [&_p]:mt-0.5 [&_p]:text-[7px] [&_p]:text-slate-600">
              <span>∑</span>
              <div>
                <h4>{tr(locale, "منطق آموزشی", "Educational logic")}</h4>
                <p>
                  {algorithm.fidelity === "exact"
                    ? tr(
                        locale,
                        "پیاده‌سازی محاسباتی",
                        "Computational implementation",
                      )
                    : tr(
                        locale,
                        "مدل آموزشی ساده‌شده",
                        "Simplified educational model",
                      )}
                </p>
              </div>
            </div>
            <p>{copy?.theory}</p>
            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-black/20 p-2">
              <span className="text-[7px] text-slate-600">Operation</span>
              <code className="truncate font-mono text-[7px] text-violet-300" dir="ltr">{algorithm.operation}</code>
            </div>
          </section>
          <section className="mb-3 rounded-xl border border-white/[.08] bg-white/[.018] p-3">
            <div className="mb-3 grid grid-cols-[28px_1fr] items-center gap-2 [&>span]:grid [&>span]:size-7 [&>span]:place-items-center [&>span]:rounded-lg [&>span]:bg-emerald-400/10 [&>span]:text-emerald-300 [&_h4]:m-0 [&_h4]:text-[9px] [&_h4]:text-slate-200 [&_p]:mt-0.5 [&_p]:text-[7px] [&_p]:text-slate-600">
              <span>⌁</span>
              <div>
                <h4>{tr(locale, "خروجی و سنجه‌ها", "Output & metrics")}</h4>
                <p>
                  {tr(
                    locale,
                    "آخرین اجرای همین Node",
                    "Latest execution of this node",
                  )}
                </p>
              </div>
            </div>
            {result?.data ? (
              <div className="grid grid-cols-2 gap-1.5 [&>div]:min-w-0 [&>div]:rounded-lg [&>div]:bg-black/15 [&>div]:p-2 [&_span]:block [&_span]:truncate [&_span]:text-[6px] [&_span]:text-slate-600 [&_b]:mt-1 [&_b]:block [&_b]:truncate [&_b]:font-mono [&_b]:text-[7px] [&_b]:text-slate-300">
                <div>
                  <span>{tr(locale, "نوع", "Type")}</span>
                  <b>{formatKind(result.data.kind, locale)}</b>
                </div>
                <div>
                  <span>{tr(locale, "نرخ نمونه", "Sample rate")}</span>
                  <b>{result.data.sampleRate.toLocaleString()} Hz</b>
                </div>
                {Object.entries(result.data.metrics)
                  .slice(0, 10)
                  .map(([key, value]) => (
                    <div key={key}>
                      <span dir="ltr">{key}</span>
                      <b>{metricText(value)}</b>
                    </div>
                  ))}
              </div>
            ) : (
              <div
                className={`rounded-lg border border-dashed p-3 text-[8px] leading-5 ${result?.status === "error" ? "border-rose-400/20 bg-rose-400/[.04] text-rose-300" : "border-white/10 text-slate-600"}`}
              >
                {result?.message ??
                  tr(
                    locale,
                    "برای دیدن نتیجه، Node را به ورودی متصل و گراف را اجرا کن.",
                    "Connect the node input and run the graph to see a result.",
                  )}
              </div>
            )}
          </section>
          <button
            type="button"
            className="h-9 w-full rounded-lg border border-rose-400/15 bg-rose-400/[.04] text-[8px] text-rose-300 transition hover:bg-rose-400/10"
            onClick={() => onRemove(node.id)}
          >
            {tr(
              locale,
              "حذف این Node از Workflow",
              "Delete this node from the workflow",
            )}
          </button>
        </div>
      ) : (
        <div className="grid min-h-0 place-items-center content-center px-8 text-center">
          <span className="mb-3 text-3xl text-slate-700">⌁</span>
          <h3 className="m-0 text-xs text-slate-300">{tr(locale, "یک Node را انتخاب کن", "Select a node")}</h3>
          <p className="mt-2 text-[8px] leading-5 text-slate-600">
            {tr(
              locale,
              "پارامترها، معادله، نوع داده و خروجی آخرین اجرا اینجا نمایش داده می‌شود.",
              "Parameters, data contract and the latest output appear here.",
            )}
          </p>
        </div>
      )}
    </aside>
  );
}
