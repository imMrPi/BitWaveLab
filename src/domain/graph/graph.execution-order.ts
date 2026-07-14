import type { GraphEdge, GraphNode } from "./graph.types";

export function getGraphExecutionOrder(nodes: GraphNode[], edges: GraphEdge[]) {
  const executableNodes = nodes.filter((node) => node.algorithmId !== "analysis.guide");
  const signalEdges = edges.filter((edge) => edge.kind !== "annotation");
  const indegree = new Map(executableNodes.map((node) => [node.id, 0]));
  signalEdges.forEach((edge) => indegree.has(edge.to) && indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1));
  const queue = executableNodes.filter((node) => !indegree.get(node.id)).map((node) => node.id);
  const order: string[] = [];

  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    signalEdges.filter((edge) => edge.from === id).forEach((edge) => {
      indegree.set(edge.to, (indegree.get(edge.to) ?? 1) - 1);
      if (!indegree.get(edge.to)) queue.push(edge.to);
    });
  }

  return [...order, ...executableNodes.map((node) => node.id).filter((id) => !order.includes(id))];
}
