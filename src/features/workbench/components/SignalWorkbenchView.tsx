"use client";

import { useState, type CSSProperties } from "react";
import {
  algorithmById,
  algorithms,
  templates,
} from "@/lib/signal-engine";
import {
  localizeAlgorithm,
  localizeTemplate,
  tr,
} from "@/lib/i18n";
import { EdgeLayer } from "@/features/graph-editor/rendering/EdgeLayer";
import { WorkbenchHeader } from "@/features/workbench/components/WorkbenchHeader";
import { BlockLibrary } from "@/features/workbench/components/BlockLibrary";
import { AnalysisDeck } from "@/features/workbench/components/AnalysisDeck";
import { MobileWorkbenchNav } from "@/features/workbench/components/MobileWorkbenchNav";
import { NodeInsight } from "@/features/workbench/components/NodeInsight";
import { InspectorPanel } from "@/features/workbench/components/InspectorPanel";
import { NodeContextMenu } from "@/features/workbench/canvas/NodeContextMenu";
import { GraphNodeCard } from "@/features/workbench/canvas/GraphNodeCard";
import { useSignalWorkbenchController } from "@/features/workbench/hooks/use-signal-workbench-controller";

const NODE_WIDTH = 224;
const NODE_HEIGHT = 176;

export function SignalWorkbenchView({
  controller,
}: {
  controller: ReturnType<typeof useSignalWorkbenchController>;
}) {
  const {
    locale,
    setLocale,
    nodes,
    edges,
    renderRevision,
    canUndo,
    canRedo,
    dispatchCommand,
    setSelectedNodeId,
    selectedNodeIds,
    setSelectedNodeIds,
    pendingFrom,
    setPendingFrom,
    run,
    scopeTab,
    setScopeTab,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    live,
    setLive,
    running,
    runCount,
    activeTemplate,
    templateMenuOpen,
    setTemplateMenuOpen,
    contextMenu,
    setContextMenu,
    contextSearch,
    setContextSearch,
    activeExecutionNodeId,
    completedExecutionNodeIds,
    zoom,
    canvasSize,
    selectionBox,
    setInsightNodeId,
    showGuideNotes,
    setShowGuideNotes,
    mobilePane,
    setMobilePane,
    headerMenuOpen,
    setHeaderMenuOpen,
    projectNotice,
    setProjectNotice,
    scopeExpanded,
    setScopeExpanded,
    scopeHeight,
    canvasRef,
    centerWorkspaceRef,
    stageRef,
    setCanvasZoom,
    loadTemplate,
    runGraph,
    selectedNode,
    selectedAlgorithm,
    selectedResult,
    suggestions,
    assessment,
    executableNodeCount,
    renderedEdges,
    scopeEntry,
    scopeData,
    groupedAlgorithms,
    addAlgorithm,
    applySuggestion,
    copySelected,
    pasteCopied,
    deleteSelected,
    toggleNodeDisabled,
    toggleSelectedDisabled,
    removeNode,
    updateParam,
    startBoxSelection,
    moveDrag,
    finishDrag,
    undoGraph,
    redoGraph,
    exportProject,
    importProject,
    startScopeResize,
    resizeScope,
    finishScopeResize,
    categoryCounts,
    contextAlgorithms,
    insightNode,
    insightParent,
  } = controller;
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const desktopColumns = libraryOpen
    ? inspectorOpen
      ? "grid-cols-[300px_minmax(540px,1fr)_340px]"
      : "grid-cols-[300px_minmax(540px,1fr)]"
    : inspectorOpen
      ? "grid-cols-[minmax(540px,1fr)_340px]"
      : "grid-cols-[minmax(0,1fr)]";
  return (
    <div
      className="grid h-dvh min-h-[680px] w-full grid-rows-[64px_minmax(0,1fr)_25px] overflow-hidden bg-canvas text-slate-100 max-[840px]:min-h-0 max-[840px]:grid-rows-[48px_minmax(0,1fr)]"
      dir={locale === "fa" ? "rtl" : "ltr"}
      lang={locale}
    >
      <WorkbenchHeader
        locale={locale}
        activeTemplate={activeTemplate}
        templateMenuOpen={templateMenuOpen}
        toolsMenuOpen={headerMenuOpen}
        live={live}
        running={running}
        canUndo={canUndo}
        canRedo={canRedo}
        projectNotice={projectNotice}
        onTemplateMenuChange={setTemplateMenuOpen}
        onToolsMenuChange={setHeaderMenuOpen}
        onTemplateLoad={(id) => {
          loadTemplate(id);
          setTemplateMenuOpen(false);
        }}
        onLocaleToggle={() => {
          setLocale(locale === "fa" ? "en" : "fa");
          setHeaderMenuOpen(false);
        }}
        onLiveToggle={() => setLive((value) => !value)}
        onRun={() => void runGraph()}
        onUndo={undoGraph}
        onRedo={redoGraph}
        onProjectExport={() => {
          exportProject();
          setHeaderMenuOpen(false);
        }}
        onProjectImport={(file) => void importProject(file)}
        onNoticeClose={() => setProjectNotice("")}
      />

      <div className={`grid min-h-0 ${desktopColumns} [direction:ltr] max-[1280px]:grid-cols-[270px_minmax(0,1fr)] ${libraryOpen ? "" : "max-[1280px]:grid-cols-1"} max-[840px]:block`}>
        <div className={`min-h-0 ${libraryOpen ? "" : "min-[841px]:hidden"} max-[840px]:h-full ${mobilePane === "library" ? "max-[840px]:block" : "max-[840px]:hidden"}`}>
          <BlockLibrary
            locale={locale}
            search={search}
            activeCategory={activeCategory}
            categoryCounts={categoryCounts}
            groups={groupedAlgorithms}
            onSearchChange={setSearch}
            onCategoryChange={setActiveCategory}
            onAdd={(algorithmId) => {
              addAlgorithm(algorithmId);
              setMobilePane("canvas");
            }}
          />
        </div>

        <main
          ref={centerWorkspaceRef}
          className={`grid min-h-0 grid-rows-[minmax(190px,1fr)_7px_var(--scope-height)] gap-0 overflow-hidden bg-[#080a0e] p-[7px] max-[840px]:h-full max-[840px]:grid-rows-[minmax(160px,1fr)_7px_var(--scope-height)] max-[840px]:p-1.5 ${mobilePane === "canvas" ? "max-[840px]:grid" : "max-[840px]:hidden"}`}
          style={
            {
              "--scope-height": `${scopeExpanded ? scopeHeight : 48}px`,
            } as CSSProperties
          }
        >
          <section className="mb-[3px] grid min-h-0 grid-rows-[43px_minmax(0,1fr)] overflow-hidden rounded-[10px] border border-slate-400/[.13] bg-panel">
            <div className="relative z-20 flex h-[43px] min-w-0 items-center gap-3 border-b border-slate-400/[.13] bg-panel-raised/[.92] px-[11px] [direction:ltr]">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="size-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.65)]" />
                <div className="min-w-0">
                  <b className="block truncate text-[9px] text-slate-200">
                    {running
                      ? `${tr(locale, "در حال اجرای", "Running")} ${localizeAlgorithm(algorithmById.get(nodes.find((node) => node.id === activeExecutionNodeId)?.algorithmId ?? "") ?? algorithms[0], locale).name}`
                      : localizeTemplate(
                          activeTemplate,
                          templates[activeTemplate],
                          locale,
                        ).name}
                  </b>
                  <small className="mt-0.5 block truncate text-[7px] text-slate-600 max-[680px]:hidden">
                    {tr(
                      locale,
                      "کادر بکش: انتخاب گروهی • راست‌کلیک: افزودن • Ctrl + Wheel: زوم",
                      "Box drag: multi-select • Right-click: add • Ctrl + Wheel: zoom",
                    )}
                  </small>
                </div>
              </div>
              {running && (
                <div className="relative h-5 w-24 overflow-hidden rounded-full border border-emerald-400/15 bg-black/30 max-[680px]:hidden">
                  <span
                    className="absolute inset-y-0 left-0 bg-emerald-400/20 transition-[width]"
                    style={{
                      width: `${(completedExecutionNodeIds.length / Math.max(1, executableNodeCount)) * 100}%`,
                    }}
                  />
                  <b className="relative z-10 grid h-full place-items-center font-mono text-[7px] text-emerald-300">
                    {completedExecutionNodeIds.length}/{executableNodeCount}
                  </b>
                </div>
              )}
              {pendingFrom && (
                <div className="flex items-center gap-1.5 rounded-lg border border-cyan-400/15 bg-cyan-400/[.06] px-2 py-1 text-[7px] text-cyan-300 max-[900px]:hidden">
                  <span className="text-xs">↗</span>{" "}
                  {tr(
                    locale,
                    "اکنون ورودی Node مقصد را انتخاب کن",
                    "Now select the destination node input",
                  )}{" "}
                  <button
                    className="rounded border border-cyan-400/20 px-1.5 py-0.5 text-[7px] hover:bg-cyan-400/10"
                    type="button"
                    onClick={() => setPendingFrom(undefined)}
                  >
                    {tr(locale, "لغو", "Cancel")}
                  </button>
                </div>
              )}
              <div className="ms-auto flex shrink-0 items-center gap-1 [&>button]:h-7 [&>button]:rounded-lg [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[.025] [&>button]:px-2 [&>button]:text-[7px] [&>button]:text-slate-500 [&>button]:transition [&>button:hover]:border-white/20 [&>button:hover]:text-slate-200">
                <button
                  type="button"
                  className={libraryOpen ? "!border-cyan-400/20 !text-cyan-300" : ""}
                  onClick={() => setLibraryOpen((value) => !value)}
                  title={tr(locale, "نمایش یا مخفی‌کردن کتابخانه", "Show or hide library")}
                >
                  ◧ <span className="max-[1050px]:hidden">{tr(locale, "کتابخانه", "Library")}</span>
                </button>
                <button
                  type="button"
                  className={inspectorOpen ? "!border-violet-400/20 !text-violet-300" : ""}
                  onClick={() => setInspectorOpen((value) => !value)}
                  title={tr(locale, "نمایش یا مخفی‌کردن بازرس", "Show or hide inspector")}
                >
                  ◨ <span className="max-[1050px]:hidden">{tr(locale, "بازرس", "Inspector")}</span>
                </button>
                <span className="font-mono text-[7px] text-slate-700 max-[1060px]:hidden">
                  ∞ {canvasSize.width}×{canvasSize.height}
                </span>
                <div className="flex h-7 items-center overflow-hidden rounded-lg border border-white/10 bg-black/20 font-mono text-[7px] text-slate-500 [&>button]:grid [&>button]:h-full [&>button]:w-7 [&>button]:place-items-center [&>button]:border-0 [&>button]:bg-transparent [&>button]:text-slate-400 [&>button:hover]:bg-white/5 [&>button:hover]:text-white [&>span]:min-w-10 [&>span]:text-center">
                  <button
                    type="button"
                    onClick={() => setCanvasZoom(zoom - 0.1)}
                    aria-label={tr(locale, "کوچک‌نمایی گراف", "Zoom graph out")}
                  >
                    −
                  </button>
                  <span>{Math.round(zoom * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setCanvasZoom(zoom + 0.1)}
                    aria-label={tr(locale, "بزرگ‌نمایی گراف", "Zoom graph in")}
                  >
                    ＋
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    canvasRef.current?.scrollTo({
                      left: 0,
                      top: 0,
                      behavior: "smooth",
                    })
                  }
                >
                  ⌖ {tr(locale, "مرکز", "Home")}
                </button>
                <button
                  type="button"
                  className={showGuideNotes ? "!border-blue-400/20 !bg-blue-400/[.065] !text-blue-300" : ""}
                  onClick={() => {
                    setShowGuideNotes((value) => !value);
                    if (
                      showGuideNotes &&
                      selectedNode?.algorithmId === "analysis.guide"
                    ) {
                      setSelectedNodeId(undefined);
                      setSelectedNodeIds([]);
                    }
                  }}
                  title={tr(
                    locale,
                    "نمایش یا مخفی‌کردن همه نوت‌های آموزشی",
                    "Show or hide all educational notes",
                  )}
                >
                  {showGuideNotes ? "◉" : "○"} {tr(locale, "نوت‌ها", "Notes")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatchCommand({ type: "graph/clear" });
                    setSelectedNodeId(undefined);
                    setSelectedNodeIds([]);
                  }}
                >
                  {tr(locale, "پاک‌کردن", "Clear")}
                </button>
              </div>
            </div>
            <div
              ref={canvasRef}
              className="relative min-h-0 touch-none overflow-auto bg-[#090c11] [background-image:radial-gradient(circle,rgba(148,163,184,.15)_1px,transparent_1.2px),linear-gradient(rgba(148,163,184,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.025)_1px,transparent_1px)] [background-size:18px_18px,90px_90px,90px_90px] [scrollbar-color:rgba(148,163,184,.18)_transparent] [scrollbar-width:thin]"
              onPointerDown={startBoxSelection}
              onPointerMove={moveDrag}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
              onContextMenu={(event) => {
                event.preventDefault();
                const rect = stageRef.current?.getBoundingClientRect();
                if (!rect) return;
                setContextMenu({
                  clientX: event.clientX,
                  clientY: event.clientY,
                  x: (event.clientX - rect.left) / zoom - NODE_WIDTH / 2,
                  y: (event.clientY - rect.top) / zoom - 35,
                });
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const algorithmId = event.dataTransfer.getData(
                  "application/x-bitwave-algorithm",
                );
                const rect = stageRef.current?.getBoundingClientRect();
                if (algorithmId && rect)
                  addAlgorithm(algorithmId, {
                    x: (event.clientX - rect.left) / zoom - NODE_WIDTH / 2,
                    y: (event.clientY - rect.top) / zoom - 40,
                  });
              }}
            >
              {selectedNodeIds.length > 1 && (
                <div className="sticky left-1/2 top-2 z-40 flex w-max -translate-x-1/2 items-center gap-1.5 rounded-xl border border-amber-400/20 bg-[#151a22]/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur">
                  <b className="px-2 text-[8px] text-amber-300">
                    {selectedNodeIds.length}{" "}
                    {tr(locale, "Node انتخاب شده", "nodes selected")}
                  </b>
                  <button
                    className="h-7 rounded-lg border border-white/10 bg-white/[.035] px-2 text-[7px] text-slate-300 hover:bg-white/[.07] [&_kbd]:ms-1 [&_kbd]:text-[6px] [&_kbd]:text-slate-600"
                    type="button"
                    onClick={copySelected}
                  >
                    {tr(locale, "کپی", "Copy")} <kbd>Ctrl+C</kbd>
                  </button>
                  <button
                    className="h-7 rounded-lg border border-white/10 bg-white/[.035] px-2 text-[7px] text-slate-300 hover:bg-white/[.07] [&_kbd]:ms-1 [&_kbd]:text-[6px] [&_kbd]:text-slate-600"
                    type="button"
                    onClick={pasteCopied}
                  >
                    {tr(locale, "پیست", "Paste")} <kbd>Ctrl+V</kbd>
                  </button>
                  <button
                    className="h-7 rounded-lg border border-white/10 bg-white/[.035] px-2 text-[7px] text-slate-300 hover:bg-white/[.07] [&_kbd]:ms-1 [&_kbd]:text-[6px] [&_kbd]:text-slate-600"
                    type="button"
                    onClick={toggleSelectedDisabled}
                  >
                    Bypass <kbd>B</kbd>
                  </button>
                  <button
                    className="h-7 rounded-lg border border-rose-400/15 bg-rose-400/[.06] px-2 text-[7px] text-rose-300 hover:bg-rose-400/10 [&_kbd]:ms-1 [&_kbd]:text-[6px] [&_kbd]:text-rose-300/50"
                    type="button"
                    onClick={deleteSelected}
                  >
                    {tr(locale, "حذف", "Delete")} <kbd>Del</kbd>
                  </button>
                  <button
                    className="grid size-7 place-items-center rounded-lg border border-white/10 text-slate-500 hover:bg-white/5 hover:text-white"
                    type="button"
                    onClick={() => {
                      setSelectedNodeIds([]);
                      setSelectedNodeId(undefined);
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              <div
                ref={stageRef}
                className="relative origin-top-left [direction:ltr]"
                style={
                  {
                    width: canvasSize.width,
                    height: canvasSize.height,
                    zoom,
                  } as CSSProperties
                }
              >
                {selectionBox && (
                  <div
                    className="pointer-events-none absolute z-30 border border-amber-300/70 bg-amber-300/10 shadow-[0_0_0_1px_rgba(251,191,36,.1)] [&>span]:absolute [&>span]:-top-5 [&>span]:left-0 [&>span]:font-mono [&>span]:text-[7px] [&>span]:text-amber-300"
                    style={{
                      left: selectionBox.x,
                      top: selectionBox.y,
                      width: selectionBox.width,
                      height: selectionBox.height,
                    }}
                  >
                    <span>{selectionBox.width > 30 ? "Select" : ""}</span>
                  </div>
                )}
                <EdgeLayer
                  nodes={nodes}
                  edges={renderedEdges}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  nodeWidth={NODE_WIDTH}
                  nodeHeight={NODE_HEIGHT}
                  portOffsetY={88}
                  renderRevision={renderRevision}
                  activeNodeId={activeExecutionNodeId}
                  completedNodeIds={completedExecutionNodeIds}
                  onRemoveEdge={(edgeId) =>
                    dispatchCommand({ type: "edge/remove", edgeId })
                  }
                />
                {nodes.map((node, index) => (
                  <GraphNodeCard
                    key={node.id}
                    node={node}
                    index={index}
                    controller={controller}
                  />
                ))}
                {!nodes.length && (
                  <div className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center text-center text-slate-600">
                    <span className="mb-2 grid size-12 place-items-center rounded-2xl border border-dashed border-white/15 text-2xl text-slate-500">＋</span>
                    <h3 className="m-0 text-xs text-slate-300">
                      {tr(
                        locale,
                        "اولین بلوک را وارد کن",
                        "Add your first block",
                      )}
                    </h3>
                    <p className="my-2 max-w-xs text-[9px] leading-5">
                      {tr(
                        locale,
                        "از کتابخانه کلیک کن یا یک Algorithm را اینجا بکش.",
                        "Click the library or drag an algorithm onto the canvas.",
                      )}
                    </p>
                    <button className="mt-1 h-8 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 text-[8px] font-bold text-amber-300 hover:bg-amber-400/15" type="button" onClick={() => loadTemplate("bpsk")}>
                      {tr(locale, "بارگذاری نمونه BPSK", "Load BPSK example")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          <button
            type="button"
            className="group grid cursor-row-resize place-items-center border-0 bg-transparent p-0 touch-none"
            aria-label={tr(
              locale,
              "تغییر ارتفاع بوم و پنل تحلیل",
              "Resize canvas and analysis panel",
            )}
            onPointerDown={startScopeResize}
            onPointerMove={resizeScope}
            onPointerUp={finishScopeResize}
            onPointerCancel={finishScopeResize}
          >
            <span className="h-1 w-12 rounded-full bg-white/10 transition group-hover:w-20 group-hover:bg-amber-400/35" />
          </button>
          <AnalysisDeck
            locale={locale}
            activeTab={scopeTab}
            expanded={scopeExpanded}
            run={run}
            runCount={runCount}
            node={scopeEntry?.node}
            data={scopeData}
            onTabChange={(tab) => {
              setScopeTab(tab);
              setScopeExpanded(true);
            }}
            onExpandedChange={setScopeExpanded}
          />
        </main>

        <div className={`min-h-0 ${inspectorOpen ? "" : "min-[841px]:hidden"} min-[841px]:max-[1280px]:hidden max-[840px]:h-full ${mobilePane === "inspector" ? "max-[840px]:block" : "max-[840px]:hidden"}`}>
          <InspectorPanel
            locale={locale}
            node={selectedNode}
            algorithm={selectedAlgorithm}
            result={selectedResult}
            assessment={assessment}
            suggestions={suggestions}
            onToggleBypass={toggleNodeDisabled}
            onApplySuggestion={applySuggestion}
            onUpdateParam={updateParam}
            onRemove={removeNode}
          />
        </div>
      </div>

      <MobileWorkbenchNav
        locale={locale}
        activePane={mobilePane}
        onPaneChange={setMobilePane}
      />

      <footer className="flex h-[25px] items-center gap-4 border-t border-white/[.07] bg-[#0a0d12] px-3 font-mono text-[7px] text-slate-600 max-[840px]:hidden" dir="ltr">
        <div>
          <span className="me-1 inline-block size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.65)]" /> Engine ready
        </div>
        <div>{edges.length} connections</div>
        <div className="flex-1" />
        <div>v1.3.0</div>
      </footer>
      {contextMenu && (
        <NodeContextMenu
          locale={locale}
          menu={contextMenu}
          search={contextSearch}
          algorithms={contextAlgorithms}
          onSearchChange={setContextSearch}
          onAdd={addAlgorithm}
          onClose={() => setContextMenu(undefined)}
        />
      )}
      {insightNode && (
        <NodeInsight
          node={insightNode}
          parent={insightParent}
          input={
            insightParent ? run.results[insightParent.id]?.data : undefined
          }
          output={run.results[insightNode.id]?.data}
          locale={locale}
          onClose={() => setInsightNodeId(undefined)}
        />
      )}
    </div>
  );
}
