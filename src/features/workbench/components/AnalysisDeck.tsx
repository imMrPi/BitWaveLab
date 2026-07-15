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
      className="@container mt-[3px] grid min-h-0 grid-rows-[clamp(38px,4cqw,52px)_minmax(0,1fr)] overflow-hidden rounded-[10px] border border-slate-400/[.13] bg-[#0e1117]"
      aria-label={tr(locale, "پنل تحلیل سیگنال", "Signal analysis panel")}
    >
      <div className="flex min-w-0 items-center justify-between gap-[clamp(4px,1cqw,12px)] border-b border-white/10 bg-[#11151c]/90 px-[clamp(4px,1cqw,12px)] [direction:ltr]">
        <div
          className="grid h-full min-w-0 flex-1 grid-cols-5 items-stretch gap-[clamp(1px,.35cqw,4px)] overflow-hidden"
          role="tablist"
          aria-label={tr(locale, "نماهای تحلیل", "Analysis views")}
        >
          {scopeTabs.map((tab) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              key={tab.id}
              className={`relative flex min-w-0 items-center justify-center gap-[clamp(2px,.45cqw,6px)] overflow-hidden border-0 border-b-2 bg-transparent px-[clamp(2px,.65cqw,8px)] text-[clamp(7px,.72cqw,11px)] font-bold transition ${activeTab === tab.id ? "border-amber-400 text-amber-300" : "border-transparent text-slate-500 hover:text-slate-300"}`}
              onClick={() => onTabChange(tab.id)}
            >
              <i className="shrink-0 font-mono text-[clamp(6px,.62cqw,10px)] not-italic opacity-60">{tab.short}</i>
              <span className="min-w-0 truncate whitespace-nowrap @max-[560px]:hidden">{locale === "fa" ? tab.label : tab.english}</span>
            </button>
          ))}
        </div>
        <div className="ms-auto flex min-w-0 items-center gap-[clamp(4px,.7cqw,8px)] text-[clamp(7px,.62cqw,9px)] @max-[820px]:hidden">
          <span className="font-mono text-[7px] uppercase tracking-wider text-slate-600">Probe</span>
          <b className="max-w-40 truncate text-slate-300">{algorithm ? localizeAlgorithm(algorithm, locale).name : "—"}</b>
          <em className="whitespace-nowrap font-mono text-[7px] not-italic text-slate-600">
            {data ? `${data.kind} • ${signalDataLength(data)}` : "No data"}
          </em>
        </div>
        <button
          type="button"
          className="grid size-[clamp(26px,2.5cqw,34px)] shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[.025] text-slate-400 transition hover:border-white/20 hover:text-white"
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
      <div className="grid min-h-0 overflow-auto p-[clamp(4px,.7cqw,10px)] [scrollbar-color:rgba(148,163,184,.18)_transparent] [scrollbar-width:thin] [&>*]:h-full" role="tabpanel">
        {activeTab === "time" && <TimePlot data={data} locale={locale} />}
        {activeTab === "spectrum" && (
          <SpectrumPlot data={data} locale={locale} />
        )}
        {activeTab === "constellation" && (
          <ConstellationPlot data={data} locale={locale} />
        )}
        {activeTab === "bits" && <BitsPlot data={data} locale={locale} />}
        {activeTab === "logs" && (
          <div className="h-full overflow-auto rounded-lg bg-black/20 p-2 font-mono text-[8px]" dir={locale === "fa" ? "rtl" : "ltr"}>
            <div className="mb-2 flex items-center gap-3 border-b border-white/[.07] pb-2 text-slate-500">
              <span className="text-amber-300">Run #{runCount}</span>
              <b className="text-slate-400">
                {run.logs.length} {tr(locale, "رویداد", "events")}
              </b>
              <em className="ms-auto not-italic text-slate-600">{numberText(run.elapsed)} ms</em>
            </div>
            {run.logs.map((line, index) => (
              <p className="m-0 grid grid-cols-[24px_1fr] gap-2 border-b border-white/[.035] py-1.5 leading-4 text-slate-400" key={`${line}-${index}`}>
                <span className="text-slate-700">{String(index + 1).padStart(2, "0")}</span>
                {localizeLog(line, locale)}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
