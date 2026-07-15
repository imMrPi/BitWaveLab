import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { calculateEdgePaths } from "../src/domain/graph/graph.geometry.ts";
import { GraphHistory } from "../src/domain/graph/graph.history.ts";
import { getGraphExecutionOrder } from "../src/domain/graph/graph.execution-order.ts";
import { handleGraphCommand } from "../src/domain/graph/graph.reducer.ts";
import { validateGraph } from "../src/domain/graph/graph.validation.ts";
import { getLocalNodeRecommendation } from "../src/lib/node-recommendation-engine.ts";
import { executeGraph, graphFromTemplate } from "../src/lib/signal-engine.ts";
import { bitStreamFor, constellationFor, effectiveSampleRateFor, signalDataLength, waveformFor } from "../src/features/signal-rendering/model/signal-view-model.ts";

const node = (id, x = 0, y = 0) => ({ id, algorithmId: "test", x, y, params: {} });

test("edge geometry is deterministic and ignores dangling endpoints", () => {
  const nodes = [node("a", 10, 20), node("b", 400, 100)];
  const edges = [{ id: "ab", from: "a", to: "b" }, { id: "missing", from: "a", to: "z" }];
  const paths = calculateEdgePaths(nodes, edges, { nodeWidth: 224, portOffsetY: 88 });
  assert.equal(paths.length, 1);
  assert.equal(paths[0].d, "M 234 108 C 297.08 108, 336.92 188, 400 188");
});

test("same-row edges receive a visible bezier arc instead of a straight line", () => {
  const nodes = [node("a", 10, 20), node("b", 400, 20)];
  const paths = calculateEdgePaths(nodes, [{ id: "ab", from: "a", to: "b" }], { nodeWidth: 224, portOffsetY: 88 });
  assert.equal(paths[0].d, "M 234 108 C 297.08 94.72, 336.92 94.72, 400 108");
  assert.notEqual(paths[0].d, "M 234 108 C 297.08 108, 336.92 108, 400 108");
});

test("annotation edges connect guide cards vertically without changing signal geometry", () => {
  const nodes = [node("guide", 10, 20), node("stage", 10, 300)];
  const paths = calculateEdgePaths(nodes, [{ id: "note", from: "guide", to: "stage", kind: "annotation" }], { nodeWidth: 224, nodeHeight: 176, portOffsetY: 88 });
  assert.equal(paths[0].d, "M 122 196 C 122 242.8, 122 253.2, 122 300");
});

test("edge geometry follows heterogeneous media-node dimensions", () => {
  const source = { ...node("media", 10, 20), width: 292, height: 250 };
  const sink = { ...node("sink", 500, 300), width: 292, height: 226 };
  const paths = calculateEdgePaths([source, sink], [{ id: "media-path", from: "media", to: "sink" }], { nodeWidth: 224, nodeHeight: 176, portOffsetY: 88 });
  assert.match(paths[0].d, /^M 302 145 C /);
  assert.match(paths[0].d, /500 413$/);
});

test("scope view model uses the semantic data kind and effective bit sample rate", () => {
  const bits = { kind: "bits", bits: [1, 0], sampleRate: 1, bitRate: 1000, metrics: {}, metadata: {}, stages: [] };
  assert.equal(waveformFor(bits).length, 32);
  assert.equal(effectiveSampleRateFor(bits), 16000);
  assert.equal(signalDataLength(bits), 2);
  assert.deepEqual(bitStreamFor(bits), [1, 0]);

  const metrics = { ...bits, kind: "metrics", metrics: { ber: 0.01, errors: 2 } };
  assert.deepEqual(waveformFor(metrics), []);
  assert.deepEqual(bitStreamFor(metrics), []);
  assert.deepEqual(constellationFor({ ...metrics, symbols: [{ re: 1, im: 0 }], metadata: { constellationScheme: "BPSK" } }), []);
  assert.equal(signalDataLength(metrics), 2);

  const modulated = { ...bits, kind: "samples", samples: [1, -1], symbols: [{ re: 1, im: 0 }], metadata: { constellationScheme: "BPSK" } };
  assert.deepEqual(constellationFor(modulated), [{ re: 1, im: 0 }]);
});

test("edge layer is visible before layout invalidation completes", async () => {
  const component = await readFile(new URL("../src/features/graph-editor/rendering/EdgeLayer.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles/styles.css", import.meta.url), "utf8");
  assert.match(component, /pointer-events-none absolute inset-0/);
  assert.doesNotMatch(component, /measuring/);
  assert.match(styles, /@import "tailwindcss"/);
  assert.doesNotMatch(styles, /edge-layer/);
});

test("pointer movement uses the animation frame renderer and commits React state only on release", async () => {
  const workbench = await readFile(new URL("../src/features/workbench/hooks/use-signal-workbench-controller.ts", import.meta.url), "utf8");
  const shortcuts = await readFile(new URL("../src/features/workbench/hooks/use-workbench-shortcuts.ts", import.meta.url), "utf8");
  const moveHandler = workbench.slice(workbench.indexOf("function moveDrag"), workbench.indexOf("function finishDrag"));
  const finishStart = workbench.indexOf("function finishDrag");
  const finishHandler = workbench.slice(finishStart, workbench.indexOf("useEffect(() => () =>", finishStart));
  assert.match(moveHandler, /scheduleDragFrame\(\)/);
  assert.doesNotMatch(moveHandler, /setTransientNodes\(/);
  assert.match(finishHandler, /setTransientNodes\(dragRef\.current\.nextNodes\)/);
  assert.match(workbench, /requestAnimationFrame\(flushDragFrame\)/);
  assert.match(workbench, /addEventListener\("wheel", handleNativeWheel, \{ passive: false, capture: true \}\)/);
  assert.match(workbench, /removeEventListener\("wheel", handleNativeWheel, true\)/);
  assert.doesNotMatch(workbench, /onWheel=/);
  assert.match(shortcuts, /event\.ctrlKey \|\| event\.metaKey/);
  assert.match(shortcuts, /event\.preventDefault\(\)/);
  assert.match(workbench, /worldX \* nextZoom - pointerX/);
  assert.match(workbench, /INITIAL_CANVAS_WIDTH = 5200/);
  assert.match(workbench, /maxX \+ CANVAS_GROWTH_MARGIN/);
});

test("commands update graph and emit typed events", () => {
  const current = { nodes: [node("a"), node("b")], edges: [{ id: "ab", from: "a", to: "b" }] };
  const result = handleGraphCommand(current, { type: "edge/remove", edgeId: "ab" });
  assert.equal(result.snapshot.edges.length, 0);
  assert.deepEqual(result.events.map((event) => event.type), ["edge/removed", "graph/changed"]);
});

test("graph history supports undo, redo and branch replacement", () => {
  const first = { nodes: [node("a")], edges: [] };
  const second = { nodes: [node("a"), node("b")], edges: [] };
  const third = { nodes: [node("a"), node("b"), node("c")], edges: [] };
  const branched = { nodes: [node("a"), node("d")], edges: [] };
  const history = new GraphHistory(first);

  assert.equal(history.commit(second), true);
  assert.equal(history.commit(third), true);
  assert.deepEqual(history.undo(), second);
  assert.deepEqual(history.undo(), first);
  assert.deepEqual(history.redo(), second);
  assert.equal(history.commit(branched), true);
  assert.equal(history.status().canRedo, false);
  assert.deepEqual(history.undo(), second);
  assert.deepEqual(history.redo(), branched);
});

test("execution order follows graph dependencies", () => {
  const nodes = [node("c"), node("a"), node("b")];
  const edges = [{ id: "ab", from: "a", to: "b" }, { id: "bc", from: "b", to: "c" }];
  assert.deepEqual(getGraphExecutionOrder(nodes, edges), ["a", "b", "c"]);
});

test("annotation edges and guide nodes never enter signal execution order", () => {
  const nodes = [node("guide"), node("a"), node("b")];
  nodes[0].algorithmId = "analysis.guide";
  const edges = [{ id: "note", from: "guide", to: "a", kind: "annotation" }, { id: "ab", from: "a", to: "b" }];
  assert.deepEqual(getGraphExecutionOrder(nodes, edges), ["a", "b"]);
  assert.ok(!validateGraph({ nodes, edges: [...edges, { id: "back-note", from: "b", to: "guide", kind: "annotation" }] }).some((item) => item.code === "cycle"));
});

test("validation finds cycles and dangling edges", () => {
  const diagnostics = validateGraph({
    nodes: [node("a"), node("b")],
    edges: [{ id: "ab", from: "a", to: "b" }, { id: "ba", from: "b", to: "a" }, { id: "az", from: "a", to: "z" }],
  });
  assert.ok(diagnostics.some((item) => item.code === "cycle"));
  assert.ok(diagnostics.some((item) => item.code === "dangling-edge"));
});

test("media outputs are terminal and must match the upstream media source", () => {
  const source = { ...node("source"), algorithmId: "source.image" };
  const wrongSink = { ...node("sink"), algorithmId: "output.audio" };
  const after = node("after");
  const diagnostics = validateGraph({ nodes: [source, wrongSink, after], edges: [{ id: "to-sink", from: source.id, to: wrongSink.id }, { id: "past-sink", from: wrongSink.id, to: after.id }] });
  assert.ok(diagnostics.some((item) => item.code === "media-kind-mismatch"));
  assert.ok(diagnostics.some((item) => item.code === "media-sink-not-terminal"));
});

test("local recommendations obey both adjacent data contracts", () => {
  const graph = graphFromTemplate("bpsk");
  const target = graph.nodes.find((item) => item.algorithmId === "mod.bpsk");
  assert.ok(target);
  const recommendation = getLocalNodeRecommendation(target.id, graph.nodes, graph.edges, executeGraph(graph.nodes, graph.edges, 13));
  assert.ok(recommendation);
  assert.equal(recommendation.previous.algorithmId, "source.bits");
  assert.equal(recommendation.next[0].algorithmId, "shape.rrc");
  assert.ok(recommendation.alternatives.some((item) => item.id === "replace:mod.qpsk"));
  assert.ok(recommendation.alternatives.some((item) => item.action === "insert-before" && item.outputKind === "bits"));
  assert.ok(recommendation.alternatives.some((item) => item.action === "insert-after" && item.inputKind === "samples"));
  assert.ok(recommendation.alternatives.every((item) => !["analysis.guide", "analysis.scope"].includes(item.algorithmId)));
});

test("workbench exposes note visibility and a per-node local recommendation select", async () => {
  const controller = await readFile(new URL("../src/features/workbench/hooks/use-signal-workbench-controller.ts", import.meta.url), "utf8");
  const view = await readFile(new URL("../src/features/workbench/components/SignalWorkbenchView.tsx", import.meta.url), "utf8");
  const node = await readFile(new URL("../src/features/workbench/canvas/GraphNodeCard.tsx", import.meta.url), "utf8");
  const workbench = `${controller}\n${view}\n${node}`;
  const recommendation = await readFile(new URL("../src/features/workbench/components/LocalRecommendationPopover.tsx", import.meta.url), "utf8");
  assert.match(workbench, /showGuideNotes/);
  assert.match(workbench, /collapsed: !collapsed/);
  assert.match(workbench, /setLocalRecommendationNodeId/);
  assert.match(recommendation, /value=\{selectedId\}/);
  assert.match(workbench, /local-recommendation-applied/);
});
