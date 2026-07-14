"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  algorithmById,
  algorithms,
  categoryMeta,
  executeGraph,
  formatKind,
  graphFromTemplate,
  mediaInputAlgorithmIds,
  mediaOutputAlgorithmIds,
  nodeDimensionsForAlgorithm,
  templates,
  type AlgorithmCategory,
  type GraphEdge,
  type GraphNode,
  type GraphRun,
  type ParameterValue,
} from "../lib/signal-engine";
import { getPipelineAssessment, getPipelineSuggestions, roleForAlgorithm, roleInfo } from "../lib/recommendation-engine";
import { getLocalNodeRecommendation, type LocalNodeAlternative } from "../lib/node-recommendation-engine";
import { localizeAlgorithm, localizeCategory, localizeTemplate, tr, useLocale } from "../lib/i18n";
import { getGraphExecutionOrder } from "@/domain/graph/graph.execution-order";
import { calculateEdgePaths } from "@/domain/graph/graph.geometry";
import type { GraphSnapshot } from "@/domain/graph/graph.types";
import { useGraphController } from "@/features/graph-editor/application/use-graph-controller";
import { downloadWorkflow, readWorkflowFile } from "@/features/workbench/gateway/workflow-file.gateway";
import { useResponsiveWorkbench } from "@/features/workbench/hooks/use-responsive-workbench";
import { MOBILE_INITIAL_ZOOM, type MobilePane, type ScopeTab } from "@/features/workbench/module/workbench.types";

const NODE_WIDTH = 224;
const NODE_HEIGHT = 176;
const INITIAL_CANVAS_WIDTH = 5200;
const INITIAL_CANVAS_HEIGHT = 3200;
const CANVAS_GROWTH_MARGIN = 900;
const MIN_ZOOM = 0.55;
const MAX_ZOOM = 1.75;
const INITIAL_GRAPH = graphFromTemplate("bpsk");
const INITIAL_SELECTED_NODE_ID = INITIAL_GRAPH.nodes.find((node) => node.algorithmId !== "analysis.guide")?.id;
const INITIAL_RUN = executeGraph(INITIAL_GRAPH.nodes, INITIAL_GRAPH.edges, 41);
INITIAL_RUN.elapsed = 0;
Object.values(INITIAL_RUN.results).forEach((result) => { result.elapsed = 0; });

type ContextMenuState = { clientX: number; clientY: number; x: number; y: number };
type SelectionBoxState = { startX: number; startY: number; x: number; y: number; width: number; height: number; additive: boolean };
type DragState = {
  startX: number;
  startY: number;
  latestX: number;
  latestY: number;
  origins: Record<string, { x: number; y: number }>;
  nextNodes?: GraphNode[];
};

export function useSignalWorkbenchController() {
  const { locale, setLocale } = useLocale();
  const { isMobile } = useResponsiveWorkbench();
  const {
    nodes,
    edges,
    nodesRef,
    renderRevision,
    canUndo,
    canRedo,
    dispatchCommand,
    replaceGraph: commitGraph,
    setTransientNodes,
    commitTransientGraph,
    undo,
    redo,
  } = useGraphController(INITIAL_GRAPH);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(INITIAL_SELECTED_NODE_ID);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>(INITIAL_SELECTED_NODE_ID ? [INITIAL_SELECTED_NODE_ID] : []);
  const [pendingFrom, setPendingFrom] = useState<string>();
  const [run, setRun] = useState<GraphRun>(INITIAL_RUN);
  const [scopeTab, setScopeTab] = useState<ScopeTab>("time");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<AlgorithmCategory | "all">("all");
  const [live, setLive] = useState(true);
  const [running, setRunning] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const [activeTemplate, setActiveTemplate] = useState<keyof typeof templates>("bpsk");
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>();
  const [contextSearch, setContextSearch] = useState("");
  const [activeExecutionNodeId, setActiveExecutionNodeId] = useState<string>();
  const [completedExecutionNodeIds, setCompletedExecutionNodeIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1.08);
  const canvasSize = useMemo(() => {
    const maxX = nodes.reduce((maximum, node) => Math.max(maximum, node.x + (node.width ?? NODE_WIDTH)), 0);
    const maxY = nodes.reduce((maximum, node) => Math.max(maximum, node.y + (node.height ?? NODE_HEIGHT)), 0);
    return {
      width: Math.max(INITIAL_CANVAS_WIDTH, Math.ceil((maxX + CANVAS_GROWTH_MARGIN) / 800) * 800),
      height: Math.max(INITIAL_CANVAS_HEIGHT, Math.ceil((maxY + CANVAS_GROWTH_MARGIN) / 800) * 800),
    };
  }, [nodes]);
  const [selectionBox, setSelectionBox] = useState<SelectionBoxState>();
  const [insightNodeId, setInsightNodeId] = useState<string>();
  const [showGuideNotes, setShowGuideNotes] = useState(false);
  const [localRecommendationNodeId, setLocalRecommendationNodeId] = useState<string>();
  const [mobilePane, setMobilePane] = useState<MobilePane>("canvas");
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [projectNotice, setProjectNotice] = useState("");
  const [scopeExpanded, setScopeExpanded] = useState(true);
  const [scopeHeight, setScopeHeight] = useState(278);
  const canvasRef = useRef<HTMLDivElement>(null);
  const centerWorkspaceRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const splitDragRef = useRef<{ startY: number; height: number } | undefined>(undefined);
  const zoomRef = useRef(zoom);
  const dragRef = useRef<DragState | undefined>(undefined);
  const dragFrameRef = useRef<number | undefined>(undefined);
  const dragMovedRef = useRef(false);
  const selectionBoxRef = useRef<SelectionBoxState | undefined>(undefined);
  const clipboardRef = useRef<{ nodes: GraphNode[]; edges: GraphEdge[] } | undefined>(undefined);
  const nodeCounterRef = useRef(100);

  useEffect(() => {
    if (!isMobile) return;
    const frame = window.requestAnimationFrame(() => {
      zoomRef.current = MOBILE_INITIAL_ZOOM;
      setZoom(MOBILE_INITIAL_ZOOM);
      setScopeExpanded(false);
      setScopeHeight(Math.round(Math.min(360, window.innerHeight * .44)));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isMobile]);

  function clearSelectionAfterHistoryRestore(restored: boolean) {
    if (!restored) return;
    setSelectedNodeIds([]);
    setSelectedNodeId(undefined);
    setPendingFrom(undefined);
  }

  function undoGraph() { clearSelectionAfterHistoryRestore(Boolean(undo())); }
  function redoGraph() { clearSelectionAfterHistoryRestore(Boolean(redo())); }

  const setCanvasZoom = useCallback((nextValue: number, clientX?: number, clientY?: number) => {
    const canvas = canvasRef.current;
    const currentZoom = zoomRef.current;
    const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, +nextValue.toFixed(3)));
    if (!canvas || nextZoom === currentZoom) return;
    const rect = canvas.getBoundingClientRect();
    const pointerX = clientX === undefined ? canvas.clientWidth / 2 : clientX - rect.left;
    const pointerY = clientY === undefined ? canvas.clientHeight / 2 : clientY - rect.top;
    const worldX = (canvas.scrollLeft + pointerX) / currentZoom;
    const worldY = (canvas.scrollTop + pointerY) / currentZoom;
    zoomRef.current = nextZoom;
    setZoom(nextZoom);
    window.requestAnimationFrame(() => {
      canvas.scrollLeft = Math.max(0, worldX * nextZoom - pointerX);
      canvas.scrollTop = Math.max(0, worldY * nextZoom - pointerY);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleNativeWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      event.stopPropagation();
      const deltaScale = event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? canvas.clientHeight : 1;
      const factor = Math.exp(-event.deltaY * deltaScale * 0.002);
      setCanvasZoom(zoomRef.current * factor, event.clientX, event.clientY);
    };
    canvas.addEventListener("wheel", handleNativeWheel, { passive: false, capture: true });
    return () => canvas.removeEventListener("wheel", handleNativeWheel, true);
  }, [setCanvasZoom]);

  const loadTemplate = (templateId: keyof typeof templates) => {
    const graph = graphFromTemplate(templateId);
    const firstExecutable = graph.nodes.find((node) => node.algorithmId !== "analysis.guide");
    commitGraph(graph.nodes, graph.edges, "template-loaded");
    setSelectedNodeId(firstExecutable?.id);
    setSelectedNodeIds(firstExecutable ? [firstExecutable.id] : []);
    setPendingFrom(undefined);
    setActiveTemplate(templateId);
    const nextRun = executeGraph(graph.nodes, graph.edges, nodeCounterRef.current + 11);
    setRun(nextRun);
    setRunCount((count) => count + 1);
    window.setTimeout(() => canvasRef.current?.scrollTo({ left: 0, top: 30, behavior: "smooth" }), 20);
  };

  const runGraph = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setCompletedExecutionNodeIds([]);
    const next = executeGraph(nodes, edges, runCount + 41);
    const order = getGraphExecutionOrder(nodes, edges);
    setRun({ results: {}, logs: ["Pipeline initialized…"], elapsed: 0 });
    for (let index = 0; index < order.length; index += 1) {
      const id = order[index];
      setActiveExecutionNodeId(id);
      const visibleIds = order.slice(0, index + 1);
      setRun({
        ...next,
        results: Object.fromEntries(visibleIds.map((nodeId) => [nodeId, next.results[nodeId]]).filter(([, result]) => result)),
        logs: next.logs.slice(0, index + 1),
      });
      await new Promise((resolve) => window.setTimeout(resolve, 320));
      setCompletedExecutionNodeIds(visibleIds);
    }
    setActiveExecutionNodeId(undefined);
    setRun(next);
    setRunCount((count) => count + 1);
    setRunning(false);
  }, [nodes, edges, runCount, running]);

  useEffect(() => {
    if (!live || !nodes.length) return;
    const timeout = window.setTimeout(() => {
      setRun(executeGraph(nodes, edges, runCount + 71));
      setRunCount((count) => count + 1);
    }, 120);
    return () => window.clearTimeout(timeout);
    // runCount is intentionally excluded: it is only the deterministic seed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, live]);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const selectedAlgorithm = selectedNode ? algorithmById.get(selectedNode.algorithmId) : undefined;
  const selectedResult = selectedNodeId ? run.results[selectedNodeId] : undefined;
  const suggestions = getPipelineSuggestions(selectedNode, nodes, edges, run);
  const assessment = getPipelineAssessment(nodes, edges);
  const executableNodeCount = nodes.filter((node) => node.algorithmId !== "analysis.guide").length;
  const collapsedGuideIds = useMemo(() => new Set(nodes.filter((node) => node.algorithmId === "analysis.guide" && Boolean(node.params.collapsed)).map((node) => node.id)), [nodes]);
  const renderedEdges = useMemo(() => edges.filter((edge) => edge.kind !== "annotation" || (showGuideNotes && !collapsedGuideIds.has(edge.from))), [edges, showGuideNotes, collapsedGuideIds]);
  const localRecommendation = useMemo(() => localRecommendationNodeId ? getLocalNodeRecommendation(localRecommendationNodeId, nodes, edges, run) : undefined, [localRecommendationNodeId, nodes, edges, run]);

  const latestResultEntry = (() => {
    for (let index = nodes.length - 1; index >= 0; index -= 1) {
      const candidate = run.results[nodes[index].id]?.data;
      if (candidate) return { node: nodes[index], data: candidate };
    }
    return undefined;
  })();
  const scopeEntry = selectedNode
    ? { node: selectedNode, data: selectedResult?.data }
    : latestResultEntry;
  const scopeData = scopeEntry?.data;
  const filteredAlgorithms = useMemo(() => {
    const query = search.trim().toLowerCase();
    return algorithms.filter((algorithm) => {
      const categoryMatch = activeCategory === "all" || algorithm.category === activeCategory;
      const localized = localizeAlgorithm(algorithm, locale);
      const searchMatch = !query || `${algorithm.name} ${algorithm.shortName} ${algorithm.summary} ${localized.name} ${localized.summary} ${algorithm.tags.join(" ")}`.toLowerCase().includes(query);
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, search, locale]);

  const groupedAlgorithms = useMemo(() => {
    const map = new Map<AlgorithmCategory, typeof algorithms>();
    filteredAlgorithms.forEach((algorithm) => map.set(algorithm.category, [...(map.get(algorithm.category) ?? []), algorithm]));
    return [...map.entries()].sort((a, b) => categoryMeta[a[0]].order - categoryMeta[b[0]].order);
  }, [filteredAlgorithms]);

  function addAlgorithm(algorithmId: string, position?: { x: number; y: number }) {
    const algorithm = algorithmById.get(algorithmId);
    if (!algorithm) return;
    nodeCounterRef.current += 1;
    const dimensions = nodeDimensionsForAlgorithm(algorithmId);
    const node: GraphNode = {
      id: `node-custom-${nodeCounterRef.current}`,
      algorithmId,
      x: Math.max(20, position?.x ?? 130 + (nodes.length % 5) * 72),
      y: Math.max(28, position?.y ?? 120 + (nodes.length % 4) * 72),
      ...dimensions,
      params: Object.fromEntries(algorithm.params.map((parameter) => [parameter.key, parameter.default])),
    };
    dispatchCommand({ type: "node/add", node });
    setSelectedNodeId(node.id);
    setSelectedNodeIds([node.id]);
    setContextMenu(undefined);
    setContextSearch("");
  }

  function createMonitor(source: GraphNode) {
    const monitor = algorithmById.get("analysis.scope");
    if (!monitor) return;
    nodeCounterRef.current += 1;
    const node: GraphNode = {
      id: `node-monitor-${nodeCounterRef.current}`,
      algorithmId: monitor.id,
      x: source.x + 70,
      y: source.y + (source.height ?? NODE_HEIGHT) + 45,
      params: Object.fromEntries(monitor.params.map((parameter) => [parameter.key, parameter.default])),
    };
    commitGraph([...nodes, node], [...edges, { id: `edge-${source.id}-${node.id}`, from: source.id, to: node.id }]);
    setSelectedNodeId(node.id);
    setSelectedNodeIds([node.id]);
  }

  function applySuggestion(algorithmId: string) {
    if (!selectedNode) return;
    const algorithm = algorithmById.get(algorithmId);
    if (!algorithm) return;
    nodeCounterRef.current += 1;
    const node: GraphNode = { id: `node-guide-${nodeCounterRef.current}`, algorithmId, x: selectedNode.x + (selectedNode.width ?? NODE_WIDTH) + 85, y: selectedNode.y + 24, ...nodeDimensionsForAlgorithm(algorithmId), params: Object.fromEntries(algorithm.params.map((parameter) => [parameter.key, parameter.default])) };
    const outgoing = edges.filter((edge) => edge.kind !== "annotation" && edge.from === selectedNode.id);
    const nextEdges = (() => {
      if (algorithmId === "analysis.scope") return [...edges, { id: `edge-guide-${selectedNode.id}-${node.id}`, from: selectedNode.id, to: node.id }];
      const kept = edges.filter((edge) => edge.kind === "annotation" || edge.from !== selectedNode.id);
      const rewired = outgoing.map((edge, index) => ({ id: `edge-guide-${node.id}-${edge.to}-${index}`, from: node.id, to: edge.to }));
      return [...kept, { id: `edge-guide-${selectedNode.id}-${node.id}`, from: selectedNode.id, to: node.id }, ...rewired];
    })();
    commitGraph([...nodes, node], nextEdges);
    setSelectedNodeId(node.id); setSelectedNodeIds([node.id]);
  }

  function applyLocalAlternative(alternative: LocalNodeAlternative) {
    const target = nodes.find((node) => node.id === localRecommendationNodeId);
    const algorithm = algorithmById.get(alternative.algorithmId);
    if (!target || !algorithm) return;
    const params = Object.fromEntries(algorithm.params.map((parameter) => [parameter.key, parameter.default]));
    if (alternative.action === "replace") {
      const dimensions = nodeDimensionsForAlgorithm(algorithm.id);
      const nextNodes = nodes.map((node) => node.id === target.id ? { ...node, algorithmId: algorithm.id, params, width: dimensions?.width, height: dimensions?.height, disabled: algorithm.input === "none" ? false : node.disabled } : node);
      commitGraph(nextNodes, edges, "local-recommendation-applied");
      setSelectedNodeId(target.id);
      setSelectedNodeIds([target.id]);
      setLocalRecommendationNodeId(undefined);
      return;
    }

    nodeCounterRef.current += 1;
    const incoming = edges.filter((edge) => edge.kind !== "annotation" && edge.to === target.id);
    const outgoing = edges.filter((edge) => edge.kind !== "annotation" && edge.from === target.id);
    const firstParent = incoming.length === 1 ? nodes.find((node) => node.id === incoming[0].from) : undefined;
    const firstChild = outgoing.length === 1 ? nodes.find((node) => node.id === outgoing[0].to) : undefined;
    const preferredX = alternative.action === "insert-before"
      ? firstParent ? (firstParent.x + target.x) / 2 : target.x - NODE_WIDTH - 90
      : firstChild ? (target.x + firstChild.x) / 2 : target.x + NODE_WIDTH + 90;
    const tooClose = Math.abs(preferredX - target.x) < NODE_WIDTH + 35;
    const node: GraphNode = {
      id: `node-local-${nodeCounterRef.current}`,
      algorithmId: algorithm.id,
      x: Math.max(20, tooClose ? target.x + (alternative.action === "insert-before" ? -35 : 35) : preferredX),
      y: Math.max(28, tooClose ? target.y + NODE_HEIGHT + 78 : target.y + 20),
      ...nodeDimensionsForAlgorithm(algorithm.id),
      params,
    };
    let nextEdges: GraphEdge[];
    if (alternative.action === "insert-before") {
      const kept = edges.filter((edge) => edge.kind === "annotation" || edge.to !== target.id);
      const rewired = incoming.map((edge, index) => ({ id: `edge-local-before-${node.id}-${index}`, from: edge.from, to: node.id, kind: "signal" as const }));
      nextEdges = [...kept, ...rewired, { id: `edge-local-before-${node.id}-${target.id}`, from: node.id, to: target.id, kind: "signal" }];
    } else {
      const kept = edges.filter((edge) => edge.kind === "annotation" || edge.from !== target.id);
      const rewired = outgoing.map((edge, index) => ({ id: `edge-local-after-${node.id}-${index}`, from: node.id, to: edge.to, kind: "signal" as const }));
      nextEdges = [...kept, { id: `edge-local-after-${target.id}-${node.id}`, from: target.id, to: node.id, kind: "signal" }, ...rewired];
    }
    commitGraph([...nodes, node], nextEdges, "local-recommendation-applied");
    setSelectedNodeId(node.id);
    setSelectedNodeIds([node.id]);
    setLocalRecommendationNodeId(undefined);
  }

  function selectNode(event: ReactMouseEvent, nodeId: string) {
    event.stopPropagation();
    if (dragMovedRef.current) { dragMovedRef.current = false; return; }
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      setSelectedNodeIds((current) => current.includes(nodeId) ? current.filter((id) => id !== nodeId) : [...current, nodeId]);
      setSelectedNodeId(nodeId);
    } else { setSelectedNodeIds([nodeId]); setSelectedNodeId(nodeId); }
  }

  function copySelected() {
    const ids = new Set(selectedNodeIds);
    const clip = { nodes: nodes.filter((node) => ids.has(node.id)).map((node) => ({ ...node, params: { ...node.params } })), edges: edges.filter((edge) => ids.has(edge.from) && ids.has(edge.to)) };
    clipboardRef.current = clip; const serialized = JSON.stringify(clip); window.localStorage.setItem("bitwavelab-clipboard", serialized); navigator.clipboard?.writeText(`BITWAVELAB:${serialized}`).catch(() => undefined);
  }

  function pasteCopied() {
    let clip = clipboardRef.current;
    if (!clip) { try { clip = JSON.parse(window.localStorage.getItem("bitwavelab-clipboard") ?? "null") as GraphSnapshot; } catch { clip = undefined; } }
    if (!clip?.nodes.length) return;
    const idMap = new Map<string, string>();
    const pasted = clip.nodes.map((node) => { nodeCounterRef.current += 1; const id = `node-paste-${nodeCounterRef.current}`; idMap.set(node.id, id); return { ...node, id, x: node.x + 46, y: node.y + 46, params: { ...node.params } }; });
    nodeCounterRef.current += 1; const pasteToken = nodeCounterRef.current;
    const pastedEdges = clip.edges.map((edge) => ({ id: `edge-paste-${pasteToken}-${edge.id}`, from: idMap.get(edge.from)!, to: idMap.get(edge.to)!, kind: edge.kind }));
    dispatchCommand({ type: "subgraph/paste", nodes: pasted, edges: pastedEdges }); setSelectedNodeIds(pasted.map((node) => node.id)); setSelectedNodeId(pasted.at(-1)?.id); clipboardRef.current = { nodes: pasted, edges: pastedEdges };
  }

  function deleteSelected() {
    dispatchCommand({ type: "nodes/remove", nodeIds: selectedNodeIds }); setSelectedNodeIds([]); setSelectedNodeId(undefined);
  }

  function toggleNodeDisabled(nodeId: string) {
    const node = nodes.find((candidate) => candidate.id === nodeId);
    if (node) dispatchCommand({ type: "node/set-bypass", nodeId, disabled: !node.disabled });
  }

  function toggleSelectedDisabled() {
    const ids = new Set(selectedNodeIds); const bypassableIds = nodes.filter((node) => ids.has(node.id) && algorithmById.get(node.algorithmId)?.input !== "none").map((node) => node.id);
    const shouldDisable = nodes.some((node) => bypassableIds.includes(node.id) && !node.disabled);
    dispatchCommand({ type: "nodes/set-bypass", nodeIds: bypassableIds, disabled: shouldDisable });
  }

  function connectTo(targetId: string) {
    if (!pendingFrom || pendingFrom === targetId) return;
    nodeCounterRef.current += 1;
    dispatchCommand({
      type: "edge/connect",
      edge: { id: `edge-${pendingFrom}-${targetId}-${nodeCounterRef.current}`, from: pendingFrom, to: targetId },
      replaceIncoming: true,
    });
    setPendingFrom(undefined);
  }

  function removeNode(nodeId: string) {
    dispatchCommand({ type: "nodes/remove", nodeIds: [nodeId] });
    if (selectedNodeId === nodeId) setSelectedNodeId(undefined);
    setSelectedNodeIds((current) => current.filter((id) => id !== nodeId));
    if (pendingFrom === nodeId) setPendingFrom(undefined);
  }

  function updateParam(key: string, value: ParameterValue) {
    if (!selectedNodeId) return;
    dispatchCommand({ type: "node/update-params", nodeId: selectedNodeId, params: { [key]: value } });
  }

  function updateMediaParams(nodeId: string, params: Record<string, ParameterValue>) {
    dispatchCommand({ type: "node/update-params", nodeId, params });
  }

  function startDrag(event: ReactPointerEvent, node: GraphNode) {
    if ((event.target as HTMLElement).closest("button")) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dragIds = selectedNodeIds.includes(node.id) ? selectedNodeIds : [node.id];
    if (!selectedNodeIds.includes(node.id)) { setSelectedNodeIds([node.id]); setSelectedNodeId(node.id); }
    const startX = (event.clientX - rect.left) / zoom;
    const startY = (event.clientY - rect.top) / zoom;
    dragRef.current = { startX, startY, latestX: startX, latestY: startY, origins: Object.fromEntries(nodes.filter((candidate) => dragIds.includes(candidate.id)).map((candidate) => [candidate.id, { x: candidate.x, y: candidate.y }])) };
    dragMovedRef.current = false;
    stageRef.current?.classList.add("dragging");
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function startBoxSelection(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest(".graph-node,button,.selection-toolbar,.edge-hit")) return;
    const rect = stageRef.current?.getBoundingClientRect(); if (!rect) return;
    const x = Math.max(0, (event.clientX - rect.left) / zoom); const y = Math.max(0, (event.clientY - rect.top) / zoom);
    const box = { startX: x, startY: y, x, y, width: 0, height: 0, additive: event.shiftKey || event.ctrlKey || event.metaKey };
    setLocalRecommendationNodeId(undefined);
    selectionBoxRef.current = box; setSelectionBox(box);
    if (!(event.shiftKey || event.ctrlKey || event.metaKey)) { setSelectedNodeIds([]); setSelectedNodeId(undefined); }
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function flushDragFrame() {
    dragFrameRef.current = undefined;
    const drag = dragRef.current;
    const stage = stageRef.current;
    if (!drag || !stage) return;
    const dx = drag.latestX - drag.startX;
    const dy = drag.latestY - drag.startY;
    const next = nodesRef.current.map((node) => drag.origins[node.id] ? {
      ...node,
      x: Math.max(20, drag.origins[node.id].x + dx),
      y: Math.max(28, drag.origins[node.id].y + dy),
    } : node);
    drag.nextNodes = next;

    const nodeById = new Map(next.map((node) => [node.id, node]));
    stage.querySelectorAll<HTMLElement>(".graph-node[data-node-id]").forEach((element) => {
      const node = nodeById.get(element.dataset.nodeId ?? "");
      if (!node || !drag.origins[node.id]) return;
      element.style.left = `${node.x}px`;
      element.style.top = `${node.y}px`;
    });

    const pathById = new Map(calculateEdgePaths(next, edges, { nodeWidth: NODE_WIDTH, nodeHeight: NODE_HEIGHT, portOffsetY: 88 }).map((path) => [path.id, path.d]));
    stage.querySelectorAll<SVGGElement>(".edge-layer g[data-edge-id]").forEach((group) => {
      const path = pathById.get(group.dataset.edgeId ?? "");
      if (!path) return;
      group.querySelectorAll<SVGPathElement>("path").forEach((element) => element.setAttribute("d", path));
    });
  }

  function scheduleDragFrame() {
    if (dragFrameRef.current !== undefined) return;
    dragFrameRef.current = window.requestAnimationFrame(flushDragFrame);
  }

  function moveDrag(event: ReactPointerEvent) {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const worldX = (event.clientX - rect.left) / zoom; const worldY = (event.clientY - rect.top) / zoom;
    if (dragRef.current) {
      const dx = worldX - dragRef.current.startX; const dy = worldY - dragRef.current.startY;
      if (Math.abs(dx) + Math.abs(dy) > 2) dragMovedRef.current = true;
      dragRef.current.latestX = worldX;
      dragRef.current.latestY = worldY;
      scheduleDragFrame();
    } else if (selectionBoxRef.current) {
      const box = selectionBoxRef.current; const next = { ...box, x: Math.min(box.startX, worldX), y: Math.min(box.startY, worldY), width: Math.abs(worldX - box.startX), height: Math.abs(worldY - box.startY) };
      selectionBoxRef.current = next; setSelectionBox(next);
    }
  }

  function finishDrag() {
    if (selectionBoxRef.current) {
      const box = selectionBoxRef.current; const matches = nodesRef.current.filter((node) => node.x < box.x + box.width && node.x + (node.width ?? NODE_WIDTH) > box.x && node.y < box.y + box.height && node.y + (node.height ?? NODE_HEIGHT) > box.y).map((node) => node.id);
      const next = box.additive ? [...new Set([...selectedNodeIds, ...matches])] : matches;
      setSelectedNodeIds(next); setSelectedNodeId(next.at(-1)); selectionBoxRef.current = undefined; setSelectionBox(undefined);
    }
    if (dragFrameRef.current !== undefined) {
      window.cancelAnimationFrame(dragFrameRef.current);
      flushDragFrame();
    }
    if (dragRef.current && dragMovedRef.current && dragRef.current.nextNodes) {
      setTransientNodes(dragRef.current.nextNodes);
      commitTransientGraph("nodes-moved");
    }
    stageRef.current?.classList.remove("dragging");
    dragRef.current = undefined;
  }

  useEffect(() => () => {
    if (dragFrameRef.current !== undefined) window.cancelAnimationFrame(dragFrameRef.current);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (target.matches("input, textarea, select") || target.isContentEditable) return;
      const command = event.ctrlKey || event.metaKey;
      if (command && event.key.toLowerCase() === "z") {
        event.preventDefault(); if (event.shiftKey) redoGraph(); else undoGraph();
      } else if (command && event.key.toLowerCase() === "y") {
        event.preventDefault(); redoGraph();
      } else if ((event.key === "Delete" || event.key === "Backspace") && selectedNodeIds.length) {
        event.preventDefault(); deleteSelected();
      } else if (command && event.key.toLowerCase() === "c" && selectedNodeIds.length) {
        event.preventDefault(); copySelected();
      } else if (command && event.key.toLowerCase() === "v") {
        event.preventDefault(); pasteCopied();
      } else if (command && event.key.toLowerCase() === "a") {
        event.preventDefault(); setSelectedNodeIds(nodes.map((node) => node.id)); setSelectedNodeId(nodes.at(-1)?.id);
      } else if (!command && event.key.toLowerCase() === "b" && selectedNodeIds.length) {
        event.preventDefault(); toggleSelectedDisabled();
      } else if (event.key === "Escape") { setSelectedNodeIds([]); setSelectedNodeId(undefined); setContextMenu(undefined); setInsightNodeId(undefined); setLocalRecommendationNodeId(undefined); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // Keyboard commands intentionally read the latest graph snapshot from this render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, selectedNodeIds]);

  function exportProject() {
    downloadWorkflow(templates[activeTemplate].name, nodes, edges);
    setProjectNotice(tr(locale, "فایل پروژه دانلود شد.", "Project file downloaded."));
  }

  async function importProject(file?: File) {
    if (!file) return;
    try {
      const imported = await readWorkflowFile(file);
      commitGraph(imported.nodes, imported.edges, "workflow-imported");
      const firstNode = imported.nodes.find((node) => node.algorithmId !== "analysis.guide");
      setSelectedNodeId(firstNode?.id); setSelectedNodeIds(firstNode ? [firstNode.id] : []); setPendingFrom(undefined);
      setRun(executeGraph(imported.nodes, imported.edges, nodeCounterRef.current + 71));
      setHeaderMenuOpen(false); setMobilePane("canvas");
      setProjectNotice(tr(locale, `پروژه «${imported.title}» وارد شد${imported.diagnostics.length ? ` · ${imported.diagnostics.length} هشدار` : ""}.`, `Project “${imported.title}” imported${imported.diagnostics.length ? ` · ${imported.diagnostics.length} warnings` : ""}.`));
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message === "project-too-large") setProjectNotice(tr(locale, "حجم فایل پروژه بیش از ۵ مگابایت است.", "Project files must be smaller than 5 MB."));
      else if (message === "too-many-nodes") setProjectNotice(tr(locale, "این پروژه بیش از ۵۰۰ نود دارد.", "This project contains more than 500 nodes."));
      else if (message.startsWith("unsupported-algorithm:")) { const id = message.split(":")[1]; setProjectNotice(tr(locale, `الگوریتم ${id} در این نسخه وجود ندارد.`, `Algorithm ${id} is unavailable in this version.`)); }
      else setProjectNotice(message || tr(locale, "فایل پروژه معتبر نیست.", "The project file is invalid."));
    }
  }

  function startScopeResize(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!scopeExpanded) setScopeExpanded(true);
    splitDragRef.current = { startY: event.clientY, height: scopeExpanded ? scopeHeight : 220 };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function resizeScope(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = splitDragRef.current;
    const container = centerWorkspaceRef.current;
    if (!drag || !container) return;
    const maximum = Math.max(180, container.clientHeight - 190);
    setScopeHeight(Math.max(150, Math.min(maximum, drag.height + drag.startY - event.clientY)));
  }

  function finishScopeResize(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    splitDragRef.current = undefined;
  }

  const categoryCounts = useMemo(() => Object.fromEntries(Object.keys(categoryMeta).map((category) => [category, algorithms.filter((algorithm) => algorithm.category === category).length])), []);
  const contextAlgorithms = useMemo(() => {
    const query = contextSearch.trim().toLowerCase();
    return algorithms.filter((algorithm) => !query || `${algorithm.name} ${algorithm.summary} ${algorithm.tags.join(" ")}`.toLowerCase().includes(query));
  }, [contextSearch]);
  const insightNode = nodes.find((node) => node.id === insightNodeId);
  const insightParent = insightNode ? nodes.find((node) => node.id === edges.find((edge) => edge.kind !== "annotation" && edge.to === insightNode.id)?.from) : undefined;

  return {
    locale, setLocale, nodes, edges, renderRevision, canUndo, canRedo, dispatchCommand,
    selectedNodeId, setSelectedNodeId, selectedNodeIds, setSelectedNodeIds, pendingFrom, setPendingFrom,
    run, scopeTab, setScopeTab, search, setSearch, activeCategory, setActiveCategory, live, setLive,
    running, runCount, activeTemplate, templateMenuOpen, setTemplateMenuOpen, contextMenu, setContextMenu,
    contextSearch, setContextSearch, activeExecutionNodeId, completedExecutionNodeIds, zoom, canvasSize,
    selectionBox, insightNodeId, setInsightNodeId, showGuideNotes, setShowGuideNotes,
    localRecommendationNodeId, setLocalRecommendationNodeId, mobilePane, setMobilePane,
    headerMenuOpen, setHeaderMenuOpen, projectNotice, setProjectNotice, scopeExpanded, setScopeExpanded,
    scopeHeight, canvasRef, centerWorkspaceRef, stageRef, setCanvasZoom, loadTemplate, runGraph,
    selectedNode, selectedAlgorithm, selectedResult, suggestions, assessment, executableNodeCount,
    renderedEdges, localRecommendation, scopeEntry, scopeData, groupedAlgorithms, addAlgorithm,
    createMonitor, applySuggestion, applyLocalAlternative, selectNode, copySelected, pasteCopied,
    deleteSelected, toggleNodeDisabled, toggleSelectedDisabled, connectTo, removeNode, updateParam,
    updateMediaParams, startDrag, startBoxSelection, moveDrag, finishDrag, undoGraph, redoGraph,
    exportProject, importProject, startScopeResize, resizeScope, finishScopeResize, categoryCounts,
    contextAlgorithms, insightNode, insightParent,
  };
}
