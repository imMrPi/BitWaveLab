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
      className="inspector-panel"
      dir={locale === "fa" ? "rtl" : "ltr"}
      lang={locale}
    >
      <div className="panel-heading inspector-heading">
        <div>
          <span className="eyebrow">NODE INSPECTOR</span>
          <h2>{tr(locale, "پارامتر و منطق", "Parameters & logic")}</h2>
        </div>
        <span className={`inspector-status ${result?.status ?? "idle"}`}>
          {result?.status === "error"
            ? tr(locale, "خطا", "Error")
            : result?.status === "success"
              ? tr(locale, "آماده", "Ready")
              : "Idle"}
        </span>
      </div>
      {node && algorithm ? (
        <div className="inspector-scroll lab-scrollbar">
          <section
            className="inspector-hero"
            style={
              {
                "--node-color": categoryMeta[algorithm.category].color,
              } as CSSProperties
            }
          >
            <div className="inspector-icon">
              {algorithm.shortName.slice(0, 3)}
            </div>
            <div>
              <span>{localizeCategory(algorithm.category, locale).name}</span>
              <h3>{copy?.name}</h3>
              <p>{copy?.summary}</p>
            </div>
          </section>
          <section className="mentor-panel">
            <div className="mentor-title">
              <span>✦</span>
              <div>
                <b>
                  {tr(
                    locale,
                    "راهنمای هوشمند زنجیره",
                    "Intelligent pipeline guide",
                  )}
                </b>
                <small>
                  {tr(
                    locale,
                    "بر اساس کل مسیر، نه فقط یک نود",
                    "Based on the whole branch, not one node",
                  )}
                </small>
              </div>
              <em>{assessment.completion}%</em>
            </div>
            <div className="pipeline-assessment">
              <div>
                <span>TX</span>
                <i>
                  <b style={{ width: `${assessment.transmitter}%` }} />
                </i>
                <strong>{assessment.transmitter}%</strong>
              </div>
              <div>
                <span>RX</span>
                <i>
                  <b style={{ width: `${assessment.receiver}%` }} />
                </i>
                <strong>{assessment.receiver}%</strong>
              </div>
              {assessment.warnings.slice(0, 2).map((warning, index) => (
                <p key={index}>⚠ {warning}</p>
              ))}
            </div>
            <div className="mentor-list">
              {suggestions.length ? (
                suggestions.map((item) => {
                  const suggestion = localizeSuggestion(item, locale);
                  return (
                    <article key={item.id} className={item.level}>
                      <div>
                        <span>
                          {locale === "fa"
                            ? roleInfo[item.role].fa
                            : roleInfo[item.role].en}{" "}
                          · {item.confidence}%
                        </span>
                        <b>{suggestion.title}</b>
                      </div>
                      <p>{suggestion.reason}</p>
                      <small>
                        {tr(locale, "نتیجه:", "Outcome:")} {suggestion.outcome}
                      </small>
                      <button
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
                <div className="mentor-complete">
                  <b>
                    ✓{" "}
                    {tr(
                      locale,
                      "برای این نقطه پیشنهاد ضروری دیگری وجود ندارد.",
                      "No required next step remains at this point.",
                    )}
                  </b>
                  <span>
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
          <section className="contract-card">
            <div>
              <span>{tr(locale, "ورودی", "Input")}</span>
              <b>{formatKind(algorithm.input, locale)}</b>
            </div>
            <i aria-hidden="true">{locale === "fa" ? "←" : "→"}</i>
            <div>
              <span>{tr(locale, "خروجی", "Output")}</span>
              <b>{formatKind(algorithm.output, locale)}</b>
            </div>
          </section>
          {algorithm.input !== "none" && (
            <button
              type="button"
              className={`inspector-bypass ${node.disabled ? "active" : ""}`}
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
          <section className="inspector-section">
            <div className="section-title">
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
              <div className="parameter-list">
                {parameters.map((definition) => (
                  <label
                    key={definition.key}
                    className={`parameter ${definition.type}`}
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
              <div className="no-parameters">
                {tr(
                  locale,
                  "این بلوک پارامتر قابل تنظیم ندارد.",
                  "This block has no adjustable parameters.",
                )}
              </div>
            )}
          </section>
          <section className="inspector-section theory-section">
            <div className="section-title">
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
            <div className="theory-meta">
              <span>Operation</span>
              <code dir="ltr">{algorithm.operation}</code>
            </div>
          </section>
          <section className="inspector-section">
            <div className="section-title">
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
              <div className="metrics-grid">
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
                className={`result-message ${result?.status === "error" ? "error" : ""}`}
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
            className="delete-node"
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
        <div className="inspector-empty">
          <span>⌁</span>
          <h3>{tr(locale, "یک Node را انتخاب کن", "Select a node")}</h3>
          <p>
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
