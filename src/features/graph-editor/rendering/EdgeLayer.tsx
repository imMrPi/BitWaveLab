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
      className="edge-layer pointer-events-none absolute inset-0 z-0 overflow-visible"
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
            className={`pointer-events-auto cursor-pointer fill-none stroke-transparent stroke-[14] [pointer-events:stroke] ${edge.kind === "annotation" ? "stroke-[10]" : ""}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onRemoveEdge(edge.id);
            }}
          />
          <path
            d={edge.d}
            className={`pointer-events-none fill-none [stroke-linecap:round] transition-[stroke,opacity] ${edge.kind === "annotation" ? "stroke-blue-400/50 stroke-[1.35] [stroke-dasharray:5_6]" : activeNodeId === edge.to ? "stroke-amber-100 stroke-[3] [stroke-dasharray:10_8]" : completedNodeIds.includes(edge.to) ? "stroke-emerald-400/60 stroke-[1.7]" : "stroke-amber-400/55 stroke-[1.7]"}`}
            filter="url(#edge-glow)"
          />
        </g>
      ))}
    </svg>
  );
}
