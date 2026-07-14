import type { ParameterValue } from "../signal/signal.types";
import type { GraphEdge, GraphNode } from "./graph.types";
import type { GraphChangeReason } from "./graph.events";

export type GraphCommand =
  | { type: "graph/replace"; nodes: GraphNode[]; edges: GraphEdge[]; reason?: GraphChangeReason }
  | { type: "graph/clear" }
  | { type: "node/add"; node: GraphNode }
  | { type: "nodes/remove"; nodeIds: string[] }
  | { type: "nodes/move"; positions: Record<string, { x: number; y: number }> }
  | { type: "node/update-params"; nodeId: string; params: Record<string, ParameterValue> }
  | { type: "node/set-bypass"; nodeId: string; disabled: boolean }
  | { type: "nodes/set-bypass"; nodeIds: string[]; disabled: boolean }
  | { type: "edge/connect"; edge: GraphEdge; replaceIncoming?: boolean }
  | { type: "edge/remove"; edgeId: string }
  | { type: "subgraph/paste"; nodes: GraphNode[]; edges: GraphEdge[] };
