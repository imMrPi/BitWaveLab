import type { LabData, ParameterValue } from "../signal/signal.types";

export interface GraphNode {
  id: string;
  algorithmId: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  params: Record<string, ParameterValue>;
  disabled?: boolean;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  kind?: "signal" | "annotation";
}

export interface GraphSnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface NodeRunResult {
  status: "idle" | "running" | "success" | "error";
  data?: LabData;
  elapsed?: number;
  message?: string;
}

export interface GraphRun {
  results: Record<string, NodeRunResult>;
  logs: string[];
  elapsed: number;
}
