import type { GraphCommand } from "./graph.commands";
import type { GraphEvent, GraphChangeReason } from "./graph.events";
import type { GraphSnapshot } from "./graph.types";

export interface GraphCommandResult {
  snapshot: GraphSnapshot;
  events: GraphEvent[];
}

export function cloneGraph(snapshot: GraphSnapshot): GraphSnapshot {
  return {
    nodes: snapshot.nodes.map((node) => ({ ...node, params: { ...node.params } })),
    edges: snapshot.edges.map((edge) => ({ ...edge })),
  };
}

function changed(snapshot: GraphSnapshot, reason: GraphChangeReason, events: GraphEvent[]): GraphCommandResult {
  const cloned = cloneGraph(snapshot);
  return { snapshot: cloned, events: [...events, { type: "graph/changed", reason, snapshot: cloned }] };
}

export function handleGraphCommand(current: GraphSnapshot, command: GraphCommand): GraphCommandResult {
  switch (command.type) {
    case "graph/replace":
      return changed({ nodes: command.nodes, edges: command.edges }, command.reason ?? "legacy-replace", []);
    case "graph/clear":
      return changed({ nodes: [], edges: [] }, "graph-cleared", []);
    case "node/add":
      return changed(
        { ...current, nodes: [...current.nodes, command.node] },
        "node-added",
        [{ type: "node/added", node: command.node }],
      );
    case "nodes/remove": {
      const removed = new Set(command.nodeIds);
      return changed(
        {
          nodes: current.nodes.filter((node) => !removed.has(node.id)),
          edges: current.edges.filter((edge) => !removed.has(edge.from) && !removed.has(edge.to)),
        },
        "nodes-removed",
        [{ type: "nodes/removed", nodeIds: command.nodeIds }],
      );
    }
    case "nodes/move":
      return changed(
        {
          ...current,
          nodes: current.nodes.map((node) => command.positions[node.id] ? { ...node, ...command.positions[node.id] } : node),
        },
        "nodes-moved",
        [{ type: "nodes/moved", positions: command.positions }],
      );
    case "node/update-params":
      return changed(
        {
          ...current,
          nodes: current.nodes.map((node) => node.id === command.nodeId ? { ...node, params: { ...node.params, ...command.params } } : node),
        },
        "node-parameters-updated",
        [],
      );
    case "node/set-bypass":
      return changed(
        { ...current, nodes: current.nodes.map((node) => node.id === command.nodeId ? { ...node, disabled: command.disabled } : node) },
        "node-bypass-changed",
        [{ type: "node/bypass-changed", nodeId: command.nodeId, disabled: command.disabled }],
      );
    case "nodes/set-bypass": {
      const nodeIds = new Set(command.nodeIds);
      return changed(
        { ...current, nodes: current.nodes.map((node) => nodeIds.has(node.id) ? { ...node, disabled: command.disabled } : node) },
        "node-bypass-changed",
        command.nodeIds.map((nodeId) => ({ type: "node/bypass-changed", nodeId, disabled: command.disabled })),
      );
    }
    case "edge/connect": {
      const withoutIncoming = command.replaceIncoming
        ? current.edges.filter((edge) => edge.kind === "annotation" || edge.to !== command.edge.to)
        : current.edges;
      return changed(
        { ...current, edges: [...withoutIncoming.filter((edge) => edge.id !== command.edge.id), command.edge] },
        "edge-connected",
        [{ type: "edge/connected", edge: command.edge }],
      );
    }
    case "edge/remove":
      return changed(
        { ...current, edges: current.edges.filter((edge) => edge.id !== command.edgeId) },
        "edge-removed",
        [{ type: "edge/removed", edgeId: command.edgeId }],
      );
    case "subgraph/paste":
      return changed(
        { nodes: [...current.nodes, ...command.nodes], edges: [...current.edges, ...command.edges] },
        "subgraph-pasted",
        command.nodes.map((node) => ({ type: "node/added", node })),
      );
  }
}
