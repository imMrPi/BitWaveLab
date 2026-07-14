import { localizeAlgorithm, localizeLog, tr, type Locale } from "@/lib/i18n";
import {
  algorithmById,
  type GraphNode,
  type GraphRun,
  type LabData,
} from "@/lib/signal-engine";
import {
  BitsPlot,
  ConstellationPlot,
  SpectrumPlot,
  TimePlot,
} from "../../signal-rendering/rendering/SignalPlots";
import {
  formatSignalNumber as numberText,
  signalDataLength,
} from "../../signal-rendering/model/signal-view-model";
import { scopeTabs, type ScopeTab } from "../module/workbench.types";

type Props = {
  locale: Locale;
  activeTab: ScopeTab;
  expanded: boolean;
  run: GraphRun;
  runCount: number;
  node?: GraphNode;
  data?: LabData;
  onTabChange: (tab: ScopeTab) => void;
  onExpandedChange: (expanded: boolean) => void;
};

export function AnalysisDeck({
  locale,
  activeTab,
  expanded,
  run,
  runCount,
  node,
  data,
  onTabChange,
  onExpandedChange,
}: Props) {
  const algorithm = node ? algorithmById.get(node.algorithmId) : undefined;
  return (
    <section
      className="scope-card"
      aria-label={tr(locale, "پنل تحلیل سیگنال", "Signal analysis panel")}
    >
      <div className="scope-header">
        <div
          className="scope-tabs"
          role="tablist"
          aria-label={tr(locale, "نماهای تحلیل", "Analysis views")}
        >
          {scopeTabs.map((tab) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => onTabChange(tab.id)}
            >
              <i>{tab.short}</i>
              <span>{locale === "fa" ? tab.label : tab.english}</span>
            </button>
          ))}
        </div>
        <div className="scope-context">
          <span>Probe</span>
          <b>{algorithm ? localizeAlgorithm(algorithm, locale).name : "—"}</b>
          <em>
            {data ? `${data.kind} • ${signalDataLength(data)}` : "No data"}
          </em>
        </div>
        <button
          type="button"
          className="scope-expand-button"
          aria-expanded={expanded}
          aria-label={expanded ? "جمع‌کردن" : "بازکردن تحلیل"}
          onClick={() => onExpandedChange(!expanded)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {expanded ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
          </svg>
        </button>
      </div>
      <div className="scope-content" role="tabpanel">
        {activeTab === "time" && <TimePlot data={data} locale={locale} />}
        {activeTab === "spectrum" && (
          <SpectrumPlot data={data} locale={locale} />
        )}
        {activeTab === "constellation" && (
          <ConstellationPlot data={data} locale={locale} />
        )}
        {activeTab === "bits" && <BitsPlot data={data} locale={locale} />}
        {activeTab === "logs" && (
          <div className="log-view" dir={locale === "fa" ? "rtl" : "ltr"}>
            <div className="log-summary">
              <span>Run #{runCount}</span>
              <b>
                {run.logs.length} {tr(locale, "رویداد", "events")}
              </b>
              <em>{numberText(run.elapsed)} ms</em>
            </div>
            {run.logs.map((line, index) => (
              <p key={`${line}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {localizeLog(line, locale)}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
