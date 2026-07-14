import { algorithmById } from "@/lib/signal-engine";
import {
  deserializeWorkflow,
  serializeWorkflow,
} from "../../../domain/graph/graph.serialization";
import type {
  GraphEdge,
  GraphNode,
} from "../../../domain/graph/graph.types";

const MAX_PROJECT_BYTES = 5 * 1024 * 1024;
const MAX_PROJECT_NODES = 500;

export type ImportedWorkflow = {
  title: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  diagnostics: ReturnType<typeof deserializeWorkflow>["diagnostics"];
};

export async function readWorkflowFile(file: File): Promise<ImportedWorkflow> {
  if (file.size > MAX_PROJECT_BYTES) throw new Error("project-too-large");
  const { document, diagnostics } = deserializeWorkflow(await file.text());
  if (document.nodes.length > MAX_PROJECT_NODES) throw new Error("too-many-nodes");
  const unsupported = document.nodes.find((node) => !algorithmById.has(node.algorithmId));
  if (unsupported) throw new Error(`unsupported-algorithm:${unsupported.algorithmId}`);
  return { title: document.title, nodes: document.nodes, edges: document.edges, diagnostics };
}

export function downloadWorkflow(title: string, nodes: GraphNode[], edges: GraphEdge[]) {
  const payload = serializeWorkflow(title, { nodes, edges });
  const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "bitwavelab-workflow.json";
  anchor.click();
  URL.revokeObjectURL(url);
}
