import type { GraphEdge, GraphNode } from "./graph.types";

export interface EdgePath extends GraphEdge {
  d: string;
}

export interface EdgeGeometryOptions {
  nodeWidth: number;
  nodeHeight?: number;
  portOffsetY: number;
  minimumBend?: number;
  minimumCurve?: number;
}

export function calculateEdgePaths(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: EdgeGeometryOptions,
): EdgePath[] {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const minimumBend = options.minimumBend ?? 48;
  const minimumCurve = options.minimumCurve ?? 12;

  return edges.flatMap((edge) => {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);
    if (!from || !to) return [];

    if (edge.kind === "annotation") {
      const fromWidth = from.width ?? options.nodeWidth;
      const fromHeight = from.height ?? options.nodeHeight ?? 176;
      const toWidth = to.width ?? options.nodeWidth;
      const x1 = from.x + fromWidth / 2;
      const y1 = from.y + fromHeight;
      const x2 = to.x + toWidth / 2;
      const y2 = to.y;
      const verticalDistance = Math.round(Math.max(4, Math.abs(y2 - y1) * 0.45) * 100) / 100;
      const direction = y2 >= y1 ? 1 : -1;
      return [{
        ...edge,
        d: `M ${x1} ${y1} C ${x1} ${y1 + direction * verticalDistance}, ${x2} ${y2 - direction * verticalDistance}, ${x2} ${y2}`,
      }];
    }

    const fromWidth = from.width ?? options.nodeWidth;
    const fromHeight = from.height;
    const toHeight = to.height;
    const x1 = from.x + fromWidth;
    const y1 = from.y + (fromHeight ? fromHeight / 2 : options.portOffsetY);
    const x2 = to.x;
    const y2 = to.y + (toHeight ? toHeight / 2 : options.portOffsetY);
    const horizontalDistance = Math.abs(x2 - x1);
    const horizontalDirection = x2 >= x1 ? 1 : -1;
    const bend = horizontalDistance
      ? Math.round(Math.min(Math.max(minimumBend, horizontalDistance * 0.38), horizontalDistance * 0.45) * 100) / 100
      : 0;
    const sameRow = Math.abs(y2 - y1) < 1;
    const curve = sameRow
      ? -Math.max(minimumCurve, Math.min(24, horizontalDistance * 0.08))
      : 0;

    return [{
      ...edge,
      d: `M ${x1} ${y1} C ${x1 + horizontalDirection * bend} ${y1 + curve}, ${x2 - horizontalDirection * bend} ${y2 + curve}, ${x2} ${y2}`,
    }];
  });
}
