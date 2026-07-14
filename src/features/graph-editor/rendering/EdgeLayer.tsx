"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { calculateEdgePaths } from "../../../domain/graph/graph.geometry";
import type { GraphEdge, GraphNode } from "../../../domain/graph/graph.types";

interface EdgeLayerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  nodeWidth: number;
  nodeHeight: number;
  portOffsetY: number;
  renderRevision: number;
  activeNodeId?: string;
  completedNodeIds: string[];
  onRemoveEdge(edgeId: string): void;
}

export function EdgeLayer({
  nodes,
  edges,
  width,
  height,
  nodeWidth,
  nodeHeight,
  portOffsetY,
  renderRevision,
  activeNodeId,
  completedNodeIds,
  onRemoveEdge,
}: EdgeLayerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [layoutEpoch, setLayoutEpoch] = useState(0);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setLayoutEpoch((epoch) => epoch + 1);
      });
    });
    const observer = new ResizeObserver(() => setLayoutEpoch((epoch) => epoch + 1));
    if (svg.parentElement) observer.observe(svg.parentElement);
    void document.fonts?.ready.then(() => setLayoutEpoch((epoch) => epoch + 1));
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      observer.disconnect();
    };
  }, []);

  const paths = useMemo(() => {
    void layoutEpoch;
    void renderRevision;
    return calculateEdgePaths(nodes, edges, { nodeWidth, nodeHeight, portOffsetY });
  }, [nodes, edges, nodeWidth, nodeHeight, portOffsetY, layoutEpoch, renderRevision]);

  return (
    <svg
      ref={svgRef}
      className="edge-layer"
      width={width}
      height={height}
      aria-hidden="true"
      data-render-revision={renderRevision}
      data-layout-epoch={layoutEpoch}
    >
      <defs>
        <filter id="edge-glow"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {paths.map((edge) => (
        <g key={edge.id} data-edge-id={edge.id} data-edge-from={edge.from} data-edge-to={edge.to}>
          <path
            d={edge.d}
            className={`edge-hit ${edge.kind === "annotation" ? "annotation" : ""}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onRemoveEdge(edge.id);
            }}
          />
          <path
            d={edge.d}
            className={`edge-line ${edge.kind === "annotation" ? "annotation" : activeNodeId === edge.to ? "executing" : completedNodeIds.includes(edge.to) ? "completed" : ""}`}
            filter="url(#edge-glow)"
          />
        </g>
      ))}
    </svg>
  );
}
