import type { GraphEdge, GraphNode, GraphSnapshot } from "./graph.types";

export type GraphChangeReason =
  | "template-loaded"
  | "workflow-imported"
  | "node-added"
  | "nodes-removed"
  | "nodes-moved"
  | "edge-connected"
  | "edge-removed"
  | "node-parameters-updated"
  | "node-bypass-changed"
  | "local-recommendation-applied"
  | "subgraph-pasted"
  | "graph-cleared"
  | "history-restored"
  | "legacy-replace";

export type GraphEvent =
  | { type: "graph/changed"; reason: GraphChangeReason; snapshot: GraphSnapshot }
  | { type: "node/added"; node: GraphNode }
  | { type: "nodes/removed"; nodeIds: string[] }
  | { type: "nodes/moved"; positions: Record<string, { x: number; y: number }> }
  | { type: "edge/connected"; edge: GraphEdge }
  | { type: "edge/removed"; edgeId: string }
  | { type: "node/bypass-changed"; nodeId: string; disabled: boolean }
  | { type: "history/restored"; direction: "undo" | "redo"; snapshot: GraphSnapshot };

export type GraphEventListener = (event: GraphEvent) => void;

export class GraphEventBus {
  private listeners = new Set<GraphEventListener>();

  subscribe(listener: GraphEventListener) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  publish(events: GraphEvent[]) {
    events.forEach((event) => this.listeners.forEach((listener) => listener(event)));
  }
}
