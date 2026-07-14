"use client";

import { useCallback, useRef, useState } from "react";
import type { GraphCommand } from "../../../domain/graph/graph.commands";
import { GraphEventBus, type GraphEvent, type GraphChangeReason } from "../../../domain/graph/graph.events";
import { GraphHistory } from "../../../domain/graph/graph.history";
import { cloneGraph, handleGraphCommand } from "../../../domain/graph/graph.reducer";
import type { GraphEdge, GraphNode, GraphSnapshot } from "../../../domain/graph/graph.types";

export function useGraphController(initial: GraphSnapshot) {
  const [nodes, setNodes] = useState<GraphNode[]>(() => cloneGraph(initial).nodes);
  const [edges, setEdges] = useState<GraphEdge[]>(() => cloneGraph(initial).edges);
  const [historyStatus, setHistoryStatus] = useState({ canUndo: false, canRedo: false, pastLength: 0, futureLength: 0 });
  const [renderRevision, setRenderRevision] = useState(0);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const historyRef = useRef(new GraphHistory(initial));
  const eventBusRef = useRef(new GraphEventBus());

  const applySnapshot = useCallback((snapshot: GraphSnapshot) => {
    const cloned = cloneGraph(snapshot);
    nodesRef.current = cloned.nodes;
    edgesRef.current = cloned.edges;
    setNodes(cloned.nodes);
    setEdges(cloned.edges);
    setRenderRevision((revision) => revision + 1);
    return cloned;
  }, []);

  const refreshHistoryStatus = useCallback(() => {
    setHistoryStatus(historyRef.current.status());
  }, []);

  const dispatchCommand = useCallback((command: GraphCommand) => {
    const result = handleGraphCommand({ nodes: nodesRef.current, edges: edgesRef.current }, command);
    if (!historyRef.current.commit(result.snapshot)) return result.snapshot;
    const snapshot = applySnapshot(result.snapshot);
    refreshHistoryStatus();
    eventBusRef.current.publish(result.events);
    return snapshot;
  }, [applySnapshot, refreshHistoryStatus]);

  const replaceGraph = useCallback((nextNodes: GraphNode[], nextEdges: GraphEdge[], reason: GraphChangeReason = "legacy-replace") => (
    dispatchCommand({ type: "graph/replace", nodes: nextNodes, edges: nextEdges, reason })
  ), [dispatchCommand]);

  const setTransientNodes = useCallback((nextNodes: GraphNode[]) => {
    nodesRef.current = nextNodes;
    setNodes(nextNodes);
    setRenderRevision((revision) => revision + 1);
  }, []);

  const commitTransientGraph = useCallback((reason: GraphChangeReason = "nodes-moved") => {
    const snapshot = { nodes: nodesRef.current, edges: edgesRef.current };
    if (!historyRef.current.commit(snapshot)) return;
    refreshHistoryStatus();
    const cloned = cloneGraph(snapshot);
    eventBusRef.current.publish([
      { type: "graph/changed", reason, snapshot: cloned },
    ]);
  }, [refreshHistoryStatus]);

  const restoreHistory = useCallback((direction: "undo" | "redo") => {
    const snapshot = direction === "undo" ? historyRef.current.undo() : historyRef.current.redo();
    if (!snapshot) return false;
    const cloned = applySnapshot(snapshot);
    refreshHistoryStatus();
    eventBusRef.current.publish([
      { type: "history/restored", direction, snapshot: cloned },
      { type: "graph/changed", reason: "history-restored", snapshot: cloned },
    ]);
    return true;
  }, [applySnapshot, refreshHistoryStatus]);

  const undo = useCallback(() => restoreHistory("undo"), [restoreHistory]);
  const redo = useCallback(() => restoreHistory("redo"), [restoreHistory]);
  const subscribe = useCallback((listener: (event: GraphEvent) => void) => eventBusRef.current.subscribe(listener), []);

  return {
    nodes,
    edges,
    nodesRef,
    edgesRef,
    renderRevision,
    canUndo: historyStatus.canUndo,
    canRedo: historyStatus.canRedo,
    dispatchCommand,
    replaceGraph,
    setTransientNodes,
    commitTransientGraph,
    undo,
    redo,
    subscribe,
  };
}
