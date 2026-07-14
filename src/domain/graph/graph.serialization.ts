import type { GraphSnapshot } from "./graph.types";
import { validateGraph } from "./graph.validation";
import { CURRENT_GRAPH_VERSION, migrateWorkflowDocument, type WorkflowDocument } from "./graph.versioning";

export function serializeWorkflow(title: string, snapshot: GraphSnapshot) {
  const document: WorkflowDocument = { version: CURRENT_GRAPH_VERSION, title, ...snapshot };
  return JSON.stringify(document, null, 2);
}

export function deserializeWorkflow(serialized: string) {
  const document = migrateWorkflowDocument(JSON.parse(serialized));
  const diagnostics = validateGraph(document);
  if (diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
    throw new Error(diagnostics.map((diagnostic) => diagnostic.message).join("\n"));
  }
  return { document, diagnostics };
}
