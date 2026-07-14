import type { GraphSnapshot } from "./graph.types";

export const CURRENT_GRAPH_VERSION = 1 as const;

export interface WorkflowDocument extends GraphSnapshot {
  version: typeof CURRENT_GRAPH_VERSION;
  title: string;
}

export function migrateWorkflowDocument(input: unknown): WorkflowDocument {
  if (!input || typeof input !== "object") throw new Error("Workflow document must be an object.");
  const candidate = input as Partial<WorkflowDocument>;
  if (candidate.version !== CURRENT_GRAPH_VERSION) throw new Error(`Unsupported workflow version: ${String(candidate.version)}`);
  if (!Array.isArray(candidate.nodes) || !Array.isArray(candidate.edges)) throw new Error("Workflow nodes and edges must be arrays.");
  return {
    version: CURRENT_GRAPH_VERSION,
    title: typeof candidate.title === "string" ? candidate.title : "Untitled workflow",
    nodes: candidate.nodes,
    edges: candidate.edges,
  };
}
