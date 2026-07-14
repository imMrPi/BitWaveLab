"use client";

import type { CSSProperties } from "react";
import {
  algorithmById,
  algorithms,
  categoryMeta,
  formatKind,
  mediaInputAlgorithmIds,
  mediaOutputAlgorithmIds,
  templates,
  type AlgorithmCategory,
} from "../lib/signal-engine";
import { roleForAlgorithm, roleInfo } from "../lib/recommendation-engine";
import {
  localizeAlgorithm,
  localizeCategory,
  localizeTemplate,
  tr,
} from "../lib/i18n";
import { EdgeLayer } from "@/features/graph-editor/rendering/EdgeLayer";
import { MiniWave } from "@/features/signal-rendering/rendering/SignalPlots";
import { WorkbenchHeader } from "@/features/workbench/components/WorkbenchHeader";
import { BlockLibrary } from "@/features/workbench/components/BlockLibrary";
import { AnalysisDeck } from "@/features/workbench/components/AnalysisDeck";
import { MobileWorkbenchNav } from "@/features/workbench/components/MobileWorkbenchNav";
import { NodeInsight } from "@/features/workbench/components/NodeInsight";
import { InspectorPanel } from "@/features/workbench/components/InspectorPanel";
import {
  MediaOutputContent,
  MediaSourceContent,
} from "@/features/workbench/components/MediaNodeContent";
import { LocalRecommendationPopover } from "@/features/workbench/components/LocalRecommendationPopover";
import { useSignalWorkbenchController } from "./useSignalWorkbenchController";

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
    selectedNodeId,
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
    localRecommendationNodeId,
    setLocalRecommendationNodeId,
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
    localRecommendation,
    scopeEntry,
    scopeData,
    groupedAlgorithms,
    addAlgorithm,
    createMonitor,
    applySuggestion,
    applyLocalAlternative,
    selectNode,
    copySelected,
    pasteCopied,
    deleteSelected,
    toggleNodeDisabled,
    toggleSelectedDisabled,
    connectTo,
    removeNode,
    updateParam,
    updateMediaParams,
    startDrag,
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
  return (
    <div
      className={`app-shell locale-${locale} mobile-pane-${mobilePane}`}
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

      <div className="workspace">
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

        <main
          ref={centerWorkspaceRef}
          className={`center-workspace ${scopeExpanded ? "scope-expanded" : "scope-collapsed"}`}
          style={
            {
              "--scope-height": `${scopeExpanded ? scopeHeight : 48}px`,
            } as CSSProperties
          }
        >
          <section className="canvas-card">
            <div className="canvas-toolbar">
              <div className="canvas-title">
                <span className="status-light" />
                <div>
                  <b>
                    {running
                      ? `${tr(locale, "در حال اجرای", "Running")} ${localizeAlgorithm(algorithmById.get(nodes.find((node) => node.id === activeExecutionNodeId)?.algorithmId ?? "") ?? algorithms[0], locale).name}`
                      : localizeTemplate(
                          activeTemplate,
                          templates[activeTemplate],
                          locale,
                        ).name}
                  </b>
                  <small>
                    {tr(
                      locale,
                      "کادر بکش: انتخاب گروهی • راست‌کلیک: افزودن • Ctrl + Wheel: زوم",
                      "Box drag: multi-select • Right-click: add • Ctrl + Wheel: zoom",
                    )}
                  </small>
                </div>
              </div>
              {running && (
                <div className="execution-progress">
                  <span
                    style={{
                      width: `${(completedExecutionNodeIds.length / Math.max(1, executableNodeCount)) * 100}%`,
                    }}
                  />
                  <b>
                    {completedExecutionNodeIds.length}/{executableNodeCount}
                  </b>
                </div>
              )}
              {pendingFrom && (
                <div className="connect-hint">
                  <span>↗</span>{" "}
                  {tr(
                    locale,
                    "اکنون ورودی Node مقصد را انتخاب کن",
                    "Now select the destination node input",
                  )}{" "}
                  <button
                    type="button"
                    onClick={() => setPendingFrom(undefined)}
                  >
                    {tr(locale, "لغو", "Cancel")}
                  </button>
                </div>
              )}
              <div className="canvas-actions">
                <span className="canvas-size-badge">
                  ∞ {canvasSize.width}×{canvasSize.height}
                </span>
                <div className="zoom-controls">
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
                  className={`guide-visibility ${showGuideNotes ? "active" : ""}`}
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
              className="node-canvas lab-scrollbar"
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
                <div className="selection-toolbar">
                  <b>
                    {selectedNodeIds.length}{" "}
                    {tr(locale, "Node انتخاب شده", "nodes selected")}
                  </b>
                  <button
                    className="selection-action"
                    type="button"
                    onClick={copySelected}
                  >
                    {tr(locale, "کپی", "Copy")} <kbd>Ctrl+C</kbd>
                  </button>
                  <button
                    className="selection-action"
                    type="button"
                    onClick={pasteCopied}
                  >
                    {tr(locale, "پیست", "Paste")} <kbd>Ctrl+V</kbd>
                  </button>
                  <button
                    className="selection-action"
                    type="button"
                    onClick={toggleSelectedDisabled}
                  >
                    Bypass <kbd>B</kbd>
                  </button>
                  <button
                    className="selection-action danger"
                    type="button"
                    onClick={deleteSelected}
                  >
                    {tr(locale, "حذف", "Delete")} <kbd>Del</kbd>
                  </button>
                  <button
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
                className="canvas-stage"
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
                    className="selection-box"
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
                {nodes.map((node, index) => {
                  const algorithm = algorithmById.get(node.algorithmId);
                  if (!algorithm) return null;
                  const nodeResult = run.results[node.id];
                  const selected = selectedNodeIds.includes(node.id);
                  const color = categoryMeta[algorithm.category].color;
                  const isMediaInput = mediaInputAlgorithmIds.has(
                    node.algorithmId,
                  );
                  const isMediaOutput = mediaOutputAlgorithmIds.has(
                    node.algorithmId,
                  );
                  const portTop = node.height ? node.height / 2 - 9 : undefined;
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
                      node.params[
                        locale === "fa" ? "outcomeFa" : "outcomeEn"
                      ] ?? "",
                    );
                    return (
                      <article
                        key={node.id}
                        lang={locale}
                        data-node-id={node.id}
                        data-algorithm-id={node.algorithmId}
                        className={`graph-node guide-node step-guide ${
                          collapsed ? "collapsed" : ""
                        } ${selected ? "selected" : ""}`}
                        style={
                          {
                            left: node.x,
                            top: node.y,
                            "--node-color": color,
                          } as CSSProperties
                        }
                        onClick={(event) => selectNode(event, node.id)}
                      >
                        <div
                          className="guide-node-header"
                          onPointerDown={(event) => startDrag(event, node)}
                        >
                          <span>
                            STEP {step}
                            {collapsed
                              ? ` · ${tr(locale, "مخفی", "HIDDEN")}`
                              : ""}
                          </span>
                          <b>L{String(node.params.level ?? 1)}</b>
                          <button
                            type="button"
                            className="guide-collapse"
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
                          <div className="guide-node-content">
                            <h3>{title}</h3>
                            <p>{body}</p>
                            <div>
                              <span>✓</span>
                              <small>{outcome}</small>
                            </div>
                          </div>
                        )}
                        <i
                          className={`guide-node-status ${nodeResult?.status ?? "idle"}`}
                        />
                      </article>
                    );
                  }
                  return (
                    <article
                      key={node.id}
                      data-node-id={node.id}
                      data-algorithm-id={node.algorithmId}
                      data-disabled={node.disabled ? "true" : "false"}
                      className={`graph-node ${isMediaInput || isMediaOutput ? "media-io-node" : ""} ${isMediaInput ? "media-input-node" : ""} ${isMediaOutput ? "media-output-node" : ""} ${selected ? "selected" : ""} ${node.disabled ? "disabled" : ""} ${pendingFrom === node.id ? "connecting" : ""} ${activeExecutionNodeId === node.id ? "executing" : ""} ${completedExecutionNodeIds.includes(node.id) ? "completed" : ""} ${node.algorithmId === "analysis.scope" ? "monitor-node" : ""} ${localRecommendationNodeId === node.id ? "recommending" : ""}`}
                      style={
                        {
                          left: node.x,
                          top: node.y,
                          width: node.width,
                          height: node.height,
                          "--node-color": color,
                        } as CSSProperties
                      }
                      onClick={(event) => selectNode(event, node.id)}
                    >
                      {algorithm.input !== "none" && (
                        <button
                          type="button"
                          className={`node-port input ${pendingFrom ? "available" : ""}`}
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
                          className="node-port output"
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
                        className="node-header"
                        onPointerDown={(event) => startDrag(event, node)}
                      >
                        <span className="node-order">
                          {String(
                            nodes
                              .slice(0, index + 1)
                              .filter(
                                (candidate) =>
                                  candidate.algorithmId !== "analysis.guide",
                              ).length,
                          ).padStart(2, "0")}
                        </span>
                        <span className="node-category">
                          {localizeCategory(algorithm.category, locale).name}
                        </span>
                        {algorithm.input !== "none" ? (
                          <button
                            type="button"
                            className={`node-bypass ${node.disabled ? "active" : ""}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleNodeDisabled(node.id);
                            }}
                            title={
                              node.disabled
                                ? "فعال‌کردن Node"
                                : "Bypass؛ عبور بدون تغییر"
                            }
                          >
                            ⏻
                          </button>
                        ) : (
                          <span />
                        )}
                        <button
                          type="button"
                          className="node-insight-button"
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
                          !
                        </button>
                        {!isMediaOutput ? (
                          <button
                            type="button"
                            className={`node-local-recommend ${localRecommendationNodeId === node.id ? "active" : ""}`}
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
                        {node.algorithmId !== "analysis.scope" &&
                        !isMediaOutput ? (
                          <button
                            type="button"
                            className="node-monitor"
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
                          className="node-menu"
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
                          onChange={(params) =>
                            updateMediaParams(node.id, params)
                          }
                        />
                      ) : isMediaOutput ? (
                        <MediaOutputContent
                          algorithmId={node.algorithmId}
                          data={nodeResult?.data}
                          locale={locale}
                        />
                      ) : (
                        <>
                          <div className="node-body">
                            <span className="node-symbol">
                              {algorithm.shortName.slice(0, 3)}
                            </span>
                            <div>
                              <h3>
                                {localizeAlgorithm(algorithm, locale).name}
                              </h3>
                              <p>
                                {localizeAlgorithm(algorithm, locale).summary}
                              </p>
                            </div>
                          </div>
                          <MiniWave
                            data={nodeResult?.data}
                            active={
                              !node.disabled &&
                              (live || activeExecutionNodeId === node.id)
                            }
                          />
                        </>
                      )}
                      <div className="node-footer">
                        <span>{formatKind(algorithm.input, locale)}</span>
                        <i>→</i>
                        <span>{formatKind(algorithm.output, locale)}</span>
                        <b
                          className={`role-badge role-${roleInfo[roleForAlgorithm(node.algorithmId)].side.toLowerCase()}`}
                        >
                          {roleInfo[roleForAlgorithm(node.algorithmId)].side}
                        </b>
                        {node.disabled && (
                          <b className="bypass-badge">BYPASS</b>
                        )}
                        <em
                          className={`node-status ${nodeResult?.status ?? "idle"}`}
                        >
                          {nodeResult?.status === "error"
                            ? "!"
                            : nodeResult?.status === "success"
                              ? "✓"
                              : "•"}
                        </em>
                      </div>
                      {localRecommendationNodeId === node.id &&
                        localRecommendation && (
                          <LocalRecommendationPopover
                            recommendation={localRecommendation}
                            locale={locale}
                            onApply={applyLocalAlternative}
                            onClose={() =>
                              setLocalRecommendationNodeId(undefined)
                            }
                          />
                        )}
                    </article>
                  );
                })}
                {!nodes.length && (
                  <div className="canvas-empty">
                    <span>＋</span>
                    <h3>
                      {tr(
                        locale,
                        "اولین بلوک را وارد کن",
                        "Add your first block",
                      )}
                    </h3>
                    <p>
                      {tr(
                        locale,
                        "از کتابخانه کلیک کن یا یک Algorithm را اینجا بکش.",
                        "Click the library or drag an algorithm onto the canvas.",
                      )}
                    </p>
                    <button type="button" onClick={() => loadTemplate("bpsk")}>
                      {tr(locale, "بارگذاری نمونه BPSK", "Load BPSK example")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          <button
            type="button"
            className="workspace-splitter"
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
            <span />
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

      <MobileWorkbenchNav
        locale={locale}
        activePane={mobilePane}
        onPaneChange={setMobilePane}
      />

      <footer className="statusbar" dir="ltr">
        <div>
          <span className="healthy-dot" /> Engine ready
        </div>
        <div>{edges.length} connections</div>
        <div className="status-spacer" />
        <div>v1.3.0</div>
      </footer>
      {contextMenu && (
        <>
          <button
            className="context-dismiss"
            aria-label={tr(locale, "بستن منو", "Close menu")}
            onClick={() => setContextMenu(undefined)}
          />
          <div
            className="node-context-menu"
            style={{
              left: Math.min(contextMenu.clientX, window.innerWidth - 590),
              top: Math.min(contextMenu.clientY, window.innerHeight - 500),
            }}
          >
            <div className="context-heading">
              <div>
                <span>ADD COMPONENT</span>
                <b>
                  {tr(
                    locale,
                    "یک بلوک به Canvas اضافه کن",
                    "Add a block to the canvas",
                  )}
                </b>
              </div>
              <kbd>ESC</kbd>
            </div>
            <label className="context-search">
              <span>⌕</span>
              <input
                autoFocus
                value={contextSearch}
                onChange={(event) => setContextSearch(event.target.value)}
                placeholder={tr(
                  locale,
                  "جست‌وجوی modulation، ADC، FFT…",
                  "Search modulation, ADC, FFT…",
                )}
              />
            </label>
            <div className="context-columns lab-scrollbar">
              {(
                Object.entries(categoryMeta) as Array<
                  [AlgorithmCategory, (typeof categoryMeta)[AlgorithmCategory]]
                >
              )
                .sort((a, b) => a[1].order - b[1].order)
                .map(([category, meta]) => {
                  const items = contextAlgorithms.filter(
                    (algorithm) => algorithm.category === category,
                  );
                  if (!items.length) return null;
                  return (
                    <section key={category}>
                      <h3>
                        <i style={{ background: meta.color }} />
                        {localizeCategory(category, locale).name}
                        <small>{items.length}</small>
                      </h3>
                      {items.map((algorithm) => {
                        const copy = localizeAlgorithm(algorithm, locale);
                        return (
                          <button
                            type="button"
                            key={algorithm.id}
                            onClick={() =>
                              addAlgorithm(algorithm.id, {
                                x: contextMenu.x,
                                y: contextMenu.y,
                              })
                            }
                          >
                            <span>{algorithm.shortName}</span>
                            <div>
                              <b>{copy.name}</b>
                              <small>{copy.summary}</small>
                            </div>
                            <em>＋</em>
                          </button>
                        );
                      })}
                    </section>
                  );
                })}
            </div>
          </div>
        </>
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
