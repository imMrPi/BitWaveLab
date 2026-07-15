"use client";

import type { CSSProperties } from "react";
import {
  algorithmById,
  categoryMeta,
  formatKind,
  mediaInputAlgorithmIds,
  mediaOutputAlgorithmIds,
  type GraphNode,
} from "@/lib/signal-engine";
import {
  localizeAlgorithm,
  localizeCategory,
  tr,
} from "@/lib/i18n";
import { roleForAlgorithm, roleInfo } from "@/lib/recommendation-engine";
import { MiniWave } from "@/features/signal-rendering/rendering/SignalPlots";
import {
  MediaOutputContent,
  MediaSourceContent,
} from "@/features/workbench/components/MediaNodeContent";
import { LocalRecommendationPopover } from "@/features/workbench/components/LocalRecommendationPopover";
import type { useSignalWorkbenchController } from "@/features/workbench/hooks/use-signal-workbench-controller";

type Props = {
  node: GraphNode;
  index: number;
  controller: ReturnType<typeof useSignalWorkbenchController>;
};

const STANDARD_NODE_WIDTH = 224;
const STANDARD_NODE_HEIGHT = 176;

export function GraphNodeCard({ node, index, controller }: Props) {
  const {
    locale,
    isMobile,
    nodes,
    run,
    selectedNodeIds,
    pendingFrom,
    setPendingFrom,
    activeExecutionNodeId,
    completedExecutionNodeIds,
    showGuideNotes,
    localRecommendationNodeId,
    setLocalRecommendationNodeId,
    setInsightNodeId,
    localRecommendation,
    applyLocalAlternative,
    selectNode,
    connectTo,
    removeNode,
    toggleNodeDisabled,
    createMonitor,
    updateMediaParams,
    startDrag,
    dispatchCommand,
    live,
  } = controller;
  const algorithm = algorithmById.get(node.algorithmId);
  if (!algorithm) return null;
  const nodeResult = run.results[node.id];
  const selected = selectedNodeIds.includes(node.id);
  const color = categoryMeta[algorithm.category].color;
  const isMediaInput = mediaInputAlgorithmIds.has(node.algorithmId);
  const isMediaOutput = mediaOutputAlgorithmIds.has(node.algorithmId);
  const nodeWidth = node.width ?? STANDARD_NODE_WIDTH;
  const nodeHeight = node.height ?? STANDARD_NODE_HEIGHT;
  const portTop = nodeHeight / 2;

  if (node.algorithmId === "analysis.guide") {
    if (!showGuideNotes) return null;
    const step = String(node.params.step ?? 1);
    const collapsed = Boolean(node.params.collapsed);
    const title = String(
      node.params[locale === "fa" ? "titleFa" : "titleEn"] ??
        localizeAlgorithm(algorithm, locale).name,
    );
    const body = String(
      node.params[locale === "fa" ? "bodyFa" : "bodyEn"] ??
        localizeAlgorithm(algorithm, locale).summary,
    );
    const outcome = String(
      node.params[locale === "fa" ? "outcomeFa" : "outcomeEn"] ?? "",
    );
    return (
      <article
        lang={locale}
        data-node-id={node.id}
        data-algorithm-id={node.algorithmId}
        className={`graph-node absolute z-[2] grid w-56 grid-rows-[29px_minmax(0,1fr)] overflow-visible rounded-[10px] border bg-[linear-gradient(145deg,rgba(30,58,138,.18),rgba(13,18,25,.98))] text-white shadow-[0_14px_34px_rgba(0,0,0,.32),inset_3px_0_#60a5fa] transition-[border-color,box-shadow] ${collapsed ? "h-[30px] grid-rows-[29px] border-dashed opacity-80" : "h-44"} ${selected ? "border-blue-300/70 after:pointer-events-none after:absolute after:-inset-[5px] after:rounded-[13px] after:border after:border-dashed after:border-blue-300/70 after:content-['']" : "border-blue-400/30 hover:border-blue-400/45"}`}
        style={
          {
            left: node.x,
            top: node.y,
            "--node-color": color,
          } as CSSProperties
        }
        onClick={(event) => { if (!isMobile) selectNode(event, node.id); }}
        onDoubleClick={(event) => { if (isMobile) selectNode(event, node.id); }}
      >
        <div
          className={`grid cursor-grab grid-cols-[1fr_auto_22px_22px] items-center gap-[7px] border-b border-blue-400/15 ps-2.5 font-mono text-[6.5px] font-extrabold tracking-[.12em] text-blue-400 active:cursor-grabbing ${collapsed ? "border-b-0" : ""} [&>b]:rounded [&>b]:bg-blue-400/10 [&>b]:px-[5px] [&>b]:py-[3px] [&>b]:text-[8px] [&>b]:font-normal [&>b]:tracking-normal [&>b]:text-blue-300 [&_button]:grid [&_button]:size-[22px] [&_button]:place-items-center [&_button]:rounded-[5px] [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-sm [&_button]:text-[#536174] [&_button:hover]:text-rose-400`}
          onPointerDown={(event) => startDrag(event, node)}
        >
          <span>
            STEP {step}
            {collapsed ? ` · ${tr(locale, "مخفی", "HIDDEN")}` : ""}
          </span>
          <b>L{String(node.params.level ?? 1)}</b>
          <button
            type="button"
            className="hover:!bg-blue-400/10 hover:!text-blue-300"
            onClick={(event) => {
              event.stopPropagation();
              dispatchCommand({
                type: "node/update-params",
                nodeId: node.id,
                params: { collapsed: !collapsed },
              });
            }}
            title={
              collapsed
                ? tr(locale, "نمایش نوت", "Show note")
                : tr(locale, "مخفی‌کردن نوت", "Hide note")
            }
          >
            {collapsed ? "◉" : "⊖"}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              removeNode(node.id);
            }}
            title={tr(locale, "حذف راهنما", "Delete guide")}
          >
            ×
          </button>
        </div>
        {!collapsed && (
          <div className={`min-h-0 overflow-hidden px-[11px] py-2.5 ${locale === "fa" ? "text-right" : "text-left"}`}>
            <h3 className="m-0 truncate text-[10px] text-blue-100">{title}</h3>
            <p className="my-1.5 h-[31px] overflow-hidden text-[7.2px] leading-[1.55] text-[#8795a8]">{body}</p>
            <div className="grid grid-cols-[12px_1fr] items-start gap-1 text-emerald-300">
              <span className="text-[9px]">✓</span>
              <small className="h-6 overflow-hidden text-[6.5px] leading-[1.55] text-[#718476]">{outcome}</small>
            </div>
          </div>
        )}
        <i className={`absolute bottom-[7px] left-[7px] size-[5px] rounded-full ${nodeResult?.status === "success" ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,.6)]" : nodeResult?.status === "error" ? "bg-rose-400" : "bg-slate-600"}`} />
      </article>
    );
  }

  return (
    <article
      data-node-id={node.id}
      data-algorithm-id={node.algorithmId}
      data-disabled={node.disabled ? "true" : "false"}
      className={`graph-node absolute z-[2] grid select-none overflow-visible border text-white transition-[border-color,box-shadow,opacity,filter] will-change-transform ${isMediaInput ? "grid-rows-[29px_minmax(0,1fr)_28px] rounded-[14px] border-amber-500/35 bg-[linear-gradient(145deg,rgba(245,158,11,.07),#10151d_46%)]" : isMediaOutput ? "grid-rows-[29px_minmax(0,1fr)_28px] rounded-[14px] border-emerald-400/30 bg-[linear-gradient(145deg,rgba(52,211,153,.065),#10151d_48%)]" : "grid-rows-[29px_56px_minmax(0,1fr)_28px] rounded-[10px] bg-[#121720]"} ${selected ? "after:pointer-events-none after:absolute after:-inset-[5px] after:rounded-[13px] after:border after:border-dashed after:border-[color-mix(in_srgb,var(--node-color)_70%,white)] after:content-['']" : "border-slate-400/20 hover:border-slate-400/35"} ${node.disabled ? "border-dashed opacity-[.68] saturate-[.45]" : ""} ${pendingFrom === node.id ? "ring-[3px] ring-amber-400/15" : ""} ${activeExecutionNodeId === node.id ? "animate-pulse border-amber-400" : ""} ${completedExecutionNodeIds.includes(node.id) ? "border-emerald-400/30" : ""} ${node.algorithmId === "analysis.scope" ? "border-violet-400/25" : ""} ${localRecommendationNodeId === node.id ? "z-[35]" : ""}`}
      style={
        {
          left: node.x,
          top: node.y,
          width: nodeWidth,
          height: nodeHeight,
          "--node-color": color,
          borderColor: selected ? `color-mix(in srgb, ${color} 62%, white 5%)` : undefined,
          boxShadow: selected
            ? `0 0 0 2px color-mix(in srgb, ${color} 10%, transparent), 0 15px 38px rgba(0,0,0,.36), inset 3px 0 0 ${color}`
            : isMediaOutput
              ? "0 18px 48px rgba(0,0,0,.42), inset -4px 0 0 rgba(52,211,153,.7)"
              : `0 10px 28px rgba(0,0,0,.28), inset 3px 0 0 color-mix(in srgb, ${color} 65%, transparent)`,
        } as CSSProperties
      }
      onClick={(event) => { if (!isMobile) selectNode(event, node.id); }}
      onDoubleClick={(event) => { if (isMobile) selectNode(event, node.id); }}
    >
      {algorithm.input !== "none" && (
        <button
          type="button"
          className={`absolute -left-[9px] z-[3] grid size-[18px] -translate-y-1/2 place-items-center rounded-full border-0 bg-[#090c11] p-0 [&>span]:size-2 [&>span]:rounded-full [&>span]:border-2 [&>span]:bg-[#111722] [&>span]:transition ${pendingFrom ? "[&>span]:scale-125 [&>span]:border-amber-400 [&>span]:shadow-[0_0_8px_rgba(251,191,36,.45)]" : "[&>span]:border-[#637083] hover:[&>span]:scale-125 hover:[&>span]:border-amber-400 hover:[&>span]:shadow-[0_0_8px_rgba(251,191,36,.45)]"}`}
          style={{ top: portTop }}
          onClick={(event) => {
            event.stopPropagation();
            connectTo(node.id);
          }}
          aria-label={`ورودی ${algorithm.name}`}
        >
          <span />
        </button>
      )}
      {!isMediaOutput && (
        <button
          type="button"
          className="absolute -right-[9px] z-[3] grid size-[18px] -translate-y-1/2 place-items-center rounded-full border-0 bg-[#090c11] p-0 [&>span]:size-2 [&>span]:rounded-full [&>span]:border-2 [&>span]:bg-[#111722] [&>span]:transition hover:[&>span]:scale-125 hover:[&>span]:border-amber-400 hover:[&>span]:shadow-[0_0_8px_rgba(251,191,36,.45)]"
          style={{ top: portTop }}
          onClick={(event) => {
            event.stopPropagation();
            setPendingFrom(node.id);
          }}
          aria-label={`خروجی ${algorithm.name}`}
        >
          <span />
        </button>
      )}
      <div
        className="grid cursor-grab grid-cols-[25px_minmax(0,1fr)_repeat(5,24px)] items-center overflow-visible rounded-t-[10px] border-b border-slate-400/[.09] [direction:ltr] active:cursor-grabbing [&_button]:grid [&_button]:size-5 [&_button]:place-items-center [&_button]:rounded-[6px] [&_button]:border [&_button]:border-white/[.055] [&_button]:bg-[#171d27] [&_button]:text-[10px] [&_button]:text-[#7a8798] [&_button]:shadow-[0_1px_2px_rgba(0,0,0,.3)] [&_button]:transition [&_button:hover]:border-white/15 [&_button:hover]:bg-[#202938] [&_button:hover]:text-white"
        onPointerDown={(event) => startDrag(event, node)}
      >
        <span className="text-center font-mono text-[7px] font-bold text-[#4b5664]">
          {String(
            nodes
              .slice(0, index + 1)
              .filter(
                (candidate) => candidate.algorithmId !== "analysis.guide",
              ).length,
          ).padStart(2, "0")}
        </span>
        <span className="truncate text-[7.5px] font-bold" style={{ color: `color-mix(in srgb, ${color} 76%, white)` }}>
          {localizeCategory(algorithm.category, locale).name}
        </span>
        {algorithm.input !== "none" ? (
          <button
            type="button"
            className={node.disabled ? "!border-amber-400/20 !bg-amber-400/10 !text-amber-300" : ""}
            onClick={(event) => {
              event.stopPropagation();
              toggleNodeDisabled(node.id);
            }}
            title={node.disabled ? "فعال‌کردن Node" : "Bypass؛ عبور بدون تغییر"}
          >
            ⏻
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="!border-sky-400/20 !bg-sky-400/[.07] font-black !text-sky-300 hover:!border-sky-300/45 hover:!bg-sky-400/15"
          onClick={(event) => {
            event.stopPropagation();
            setInsightNodeId(node.id);
          }}
          title={tr(
            locale,
            "شرح تغییر نسبت به نود قبلی",
            "Explain this node relative to the previous stage",
          )}
        >
          ?
        </button>
        {!isMediaOutput ? (
          <button
            type="button"
            className={`${localRecommendationNodeId === node.id ? "!border-violet-300/55 !bg-violet-400/20 !text-violet-100" : "!border-violet-400/25 !bg-violet-400/[.09] !text-violet-300 hover:!border-violet-300/50 hover:!bg-violet-400/20"}`}
            onClick={(event) => {
              event.stopPropagation();
              setLocalRecommendationNodeId((current) =>
                current === node.id ? undefined : node.id,
              );
            }}
            title={tr(
              locale,
              "گزینه‌های سازگار با اتصال‌های این نود",
              "Alternatives compatible with this node's connections",
            )}
          >
            ✦
          </button>
        ) : (
          <span />
        )}
        {node.algorithmId !== "analysis.scope" && !isMediaOutput ? (
          <button
            type="button"
            className="hover:!border-violet-400/20 hover:!bg-violet-400/10 hover:!text-violet-300"
            onClick={(event) => {
              event.stopPropagation();
              createMonitor(node);
            }}
            title="ساخت Scope مستقل"
          >
            ⌁
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="hover:!border-rose-400/20 hover:!bg-rose-400/10 hover:!text-rose-300"
          onClick={(event) => {
            event.stopPropagation();
            removeNode(node.id);
          }}
          title="حذف Node"
        >
          ×
        </button>
      </div>
      {isMediaInput ? (
        <MediaSourceContent
          node={node}
          data={nodeResult?.data}
          locale={locale}
          onChange={(params) => updateMediaParams(node.id, params)}
        />
      ) : isMediaOutput ? (
        <MediaOutputContent
          algorithmId={node.algorithmId}
          data={nodeResult?.data}
          locale={locale}
        />
      ) : (
        <>
          <div className="grid min-h-0 grid-cols-[37px_minmax(0,1fr)] items-center gap-2.5 overflow-hidden px-[13px] py-[9px] [direction:ltr]">
            <span className="grid size-9 place-items-center rounded-[9px] border font-mono text-[8px] font-black" style={{ borderColor: `color-mix(in srgb, ${color} 30%, transparent)`, background: `color-mix(in srgb, ${color} 8%, transparent)`, color }}>{algorithm.shortName.slice(0, 3)}</span>
            <div className="min-w-0">
              <h3 className="m-0 truncate text-[11px] text-[#eef2f7]">{localizeAlgorithm(algorithm, locale).name}</h3>
              <p className="mt-[5px] truncate text-[8.5px] text-[#536070]">{localizeAlgorithm(algorithm, locale).summary}</p>
            </div>
          </div>
          <MiniWave
            data={nodeResult?.data}
            active={!node.disabled && (live || activeExecutionNodeId === node.id)}
            color={color}
          />
        </>
      )}
      <div className="flex min-w-0 items-center gap-[5px] overflow-hidden rounded-b-[10px] border-t border-slate-400/[.08] px-2.5 text-[7.5px] text-[#526070] [direction:ltr]">
        <span>{formatKind(algorithm.input, locale)}</span>
        <i className="not-italic text-slate-700">→</i>
        <span>{formatKind(algorithm.output, locale)}</span>
        <b
          className={`ms-auto rounded px-1.5 py-0.5 text-[6px] ${roleInfo[roleForAlgorithm(node.algorithmId)].side === "TX" ? "bg-cyan-400/10 text-cyan-300" : roleInfo[roleForAlgorithm(node.algorithmId)].side === "RX" ? "bg-violet-400/10 text-violet-300" : "bg-emerald-400/10 text-emerald-300"}`}
        >
          {roleInfo[roleForAlgorithm(node.algorithmId)].side}
        </b>
        {node.disabled && <b className="rounded bg-amber-400/10 px-1 py-0.5 text-[6px] text-amber-300">BYPASS</b>}
        <em className={`grid size-4 place-items-center rounded-full not-italic ${nodeResult?.status === "error" ? "bg-rose-400/15 text-rose-300" : nodeResult?.status === "success" ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-slate-600"}`}>
          {nodeResult?.status === "error"
            ? "!"
            : nodeResult?.status === "success"
              ? "✓"
              : "•"}
        </em>
      </div>
      {localRecommendationNodeId === node.id && localRecommendation && (
        <LocalRecommendationPopover
          recommendation={localRecommendation}
          locale={locale}
          onApply={applyLocalAlternative}
          onClose={() => setLocalRecommendationNodeId(undefined)}
        />
      )}
    </article>
  );
}
