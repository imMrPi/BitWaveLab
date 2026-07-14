import type { GraphSnapshot } from "./graph.types";

export interface GraphDiagnostic {
  code: "duplicate-node" | "dangling-edge" | "self-edge" | "duplicate-edge" | "cycle" | "media-sink-not-terminal" | "media-kind-mismatch";
  severity: "warning" | "error";
  message: string;
  entityId?: string;
}

export function validateGraph(snapshot: GraphSnapshot): GraphDiagnostic[] {
  const diagnostics: GraphDiagnostic[] = [];
  const nodeIds = new Set<string>();
  snapshot.nodes.forEach((node) => {
    if (nodeIds.has(node.id)) diagnostics.push({ code: "duplicate-node", severity: "error", message: `Duplicate node id: ${node.id}`, entityId: node.id });
    nodeIds.add(node.id);
  });

  const connectionKeys = new Set<string>();
  snapshot.edges.forEach((edge) => {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) diagnostics.push({ code: "dangling-edge", severity: "error", message: `Edge ${edge.id} points to a missing node.`, entityId: edge.id });
    if (edge.from === edge.to) diagnostics.push({ code: "self-edge", severity: "error", message: `Edge ${edge.id} connects a node to itself.`, entityId: edge.id });
    const key = `${edge.kind ?? "signal"}:${edge.from}->${edge.to}`;
    if (connectionKeys.has(key)) diagnostics.push({ code: "duplicate-edge", severity: "warning", message: `Duplicate connection: ${key}`, entityId: edge.id });
    connectionKeys.add(key);
  });

  const mediaKind: Record<string, string> = { "source.microphone": "audio", "source.image": "image", "source.text": "text", "output.audio": "audio", "output.image": "image", "output.text": "text" };
  const signalEdges = snapshot.edges.filter((edge) => edge.kind !== "annotation");
  const nodeById = new Map(snapshot.nodes.map((node) => [node.id, node]));
  snapshot.nodes.filter((node) => node.algorithmId.startsWith("output.")).forEach((sink) => {
    if (signalEdges.some((edge) => edge.from === sink.id)) diagnostics.push({ code: "media-sink-not-terminal", severity: "error", message: `${sink.algorithmId} must be the terminal node of its signal path.`, entityId: sink.id });
    const expected = mediaKind[sink.algorithmId];
    const queue = signalEdges.filter((edge) => edge.to === sink.id).map((edge) => edge.from);
    const seen = new Set<string>();
    let sourceKind = "";
    while (queue.length && !sourceKind) {
      const id = queue.shift()!;
      if (seen.has(id)) continue;
      seen.add(id);
      const node = nodeById.get(id);
      if (node && mediaKind[node.algorithmId] && node.algorithmId.startsWith("source.")) sourceKind = mediaKind[node.algorithmId];
      signalEdges.filter((edge) => edge.to === id).forEach((edge) => queue.push(edge.from));
    }
    if (sourceKind && expected && sourceKind !== expected) diagnostics.push({ code: "media-kind-mismatch", severity: "error", message: `${sourceKind} source cannot terminate at ${expected} output.`, entityId: sink.id });
  });

  const outgoing = new Map<string, string[]>();
  signalEdges.forEach((edge) => outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge.to]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const hasCycle = (nodeId: string): boolean => {
    if (visiting.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    visiting.add(nodeId);
    const cyclic = (outgoing.get(nodeId) ?? []).some(hasCycle);
    visiting.delete(nodeId);
    visited.add(nodeId);
    return cyclic;
  };
  if (snapshot.nodes.some((node) => hasCycle(node.id))) diagnostics.push({ code: "cycle", severity: "error", message: "Graph contains a cycle without an explicit delay node." });
  return diagnostics;
}
