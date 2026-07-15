import test from "node:test";
import assert from "node:assert/strict";
import { algorithmPlugins } from "../src/algorithms/registry.ts";
import { algorithmById, algorithms, defaultParams, executeGraph, graphFromTemplate, runAlgorithm } from "../src/lib/signal-engine.ts";

const expectedCategoryCounts = {
  sources: 8,
  analysis: 10,
  sampling: 5,
  quantization: 7,
  "source-coding": 5,
  "channel-coding": 9,
  "line-coding": 9,
  scrambling: 4,
  multiplexing: 5,
  modulation: 9,
  "pulse-shaping": 4,
  channel: 9,
  synchronization: 6,
  receiver: 10,
  decoding: 17,
  reconstruction: 7,
  embedded: 7,
};

function fixture() {
  return {
    kind: "samples",
    bits: [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0],
    originalBits: [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0],
    samples: Array.from({ length: 128 }, (_, index) => Math.sin((2 * Math.PI * index) / 16)),
    symbols: [{ re: 1, im: 0 }, { re: -1, im: 0 }],
    sampleRate: 8000,
    bitRate: 1000,
    samplesPerSymbol: 8,
    metrics: {},
    metadata: {},
    stages: [],
  };
}

test("the registry owns all 131 algorithms with no duplicate ids", () => {
  assert.equal(algorithmPlugins.length, 131);
  assert.equal(algorithms.length, 131);
  assert.equal(algorithmById.size, 131);
  assert.equal(new Set(algorithmPlugins.map((plugin) => plugin.info.definition.id)).size, 131);

  const categoryCounts = Object.fromEntries(Object.keys(expectedCategoryCounts).map((category) => [category, 0]));
  for (const plugin of algorithmPlugins) {
    const { info, process } = plugin;
    assert.equal(typeof process, "function", info.definition.id);
    assert.ok(info.docs.fa.summary.length > 0, `${info.definition.id} Persian summary`);
    assert.ok(info.docs.en.summary.length > 0, `${info.definition.id} English summary`);
    assert.ok(info.views.length > 0, `${info.definition.id} signal views`);
    categoryCounts[info.definition.category] += 1;
  }
  assert.deepEqual(categoryCounts, expectedCategoryCounts);
});

test("every registered plugin executes through the operation kernel", () => {
  for (const algorithm of algorithms) {
    const input = algorithm.input === "none" ? undefined : structuredClone(fixture());
    const output = runAlgorithm(algorithm, input, defaultParams(algorithm), 17);
    assert.equal(output.stages.at(-1), algorithm.id, `${algorithm.id} stage`);
    assert.equal(output.metadata.lastStage, algorithm.name, `${algorithm.id} metadata`);
    if (algorithm.output !== "same") assert.equal(output.kind, algorithm.output, `${algorithm.id} output kind`);
  }
});

test("all line-coding plugins produce their canonical level sequences", () => {
  const bits = [0, 1, 1, 0];
  const expected = {
    "line.unipolar": [0, 0, 1, 1, 1, 1, 0, 0],
    "line.nrzl": [-1, -1, 1, 1, 1, 1, -1, -1],
    "line.nrzi": [-1, -1, 1, 1, -1, -1, -1, -1],
    "line.rz": [-1, 0, 1, 0, 1, 0, -1, 0],
    "line.manchester": [1, -1, -1, 1, -1, 1, 1, -1],
    "line.diffmanchester": [1, -1, -1, 1, 1, -1, 1, -1],
    "line.ami": [0, 0, 1, 1, -1, -1, 0, 0],
    "line.pseudoternary": [1, 1, 0, 0, 0, 0, -1, -1],
    "line.mlt3": [0, 0, 1, 1, 0, 0, 0, 0],
  };

  for (const [id, samples] of Object.entries(expected)) {
    const algorithm = algorithmById.get(id);
    assert.ok(algorithm, id);
    const output = runAlgorithm(algorithm, { ...fixture(), kind: "bits", bits }, { sps: 2 }, 3);
    assert.deepEqual(output.samples, samples, id);
  }
});

test("guided templates connect one educational note to every executable step", () => {
  const graph = graphFromTemplate("bpsk");
  const guides = graph.nodes.filter((node) => node.algorithmId === "analysis.guide");
  const executable = graph.nodes.filter((node) => node.algorithmId !== "analysis.guide");
  const annotations = graph.edges.filter((edge) => edge.kind === "annotation");
  assert.equal(guides.length, executable.length);
  assert.equal(annotations.length, executable.length);
  assert.equal(guides[0].params.level, 4);
  assert.equal(guides[0].params.step, 1);
  assert.ok(String(guides[0].params.bodyFa).length > 10);
  assert.ok(guides.every((guide) => annotations.some((edge) => edge.from === guide.id)));
  const run = executeGraph(graph.nodes, graph.edges, 7);
  assert.equal(Object.keys(run.results).length, executable.length);
  assert.ok(guides.every((guide) => run.results[guide.id] === undefined));
});

test("media sinks rebuild content only from their received bits", () => {
  const textSource = runAlgorithm(algorithmById.get("source.text"), undefined, { text: "سلام BitWaveLab" }, 3);
  const textOutput = runAlgorithm(algorithmById.get("output.text"), textSource, {}, 4);
  assert.equal(textOutput.metadata.reconstructedText, "سلام BitWaveLab");
  assert.equal(textOutput.metrics.mediaBitErrors, 0);
  assert.equal(textOutput.metadata.reconstructedFrom, `${textSource.bits.length} received bits`);

  const damaged = structuredClone(textSource);
  damaged.bits[0] ^= 1;
  const damagedOutput = runAlgorithm(algorithmById.get("output.text"), damaged, {}, 5);
  assert.notEqual(damagedOutput.metadata.reconstructedText, "سلام BitWaveLab");
  assert.equal(damagedOutput.metrics.mediaBitErrors, 1);

  const audioSource = runAlgorithm(algorithmById.get("source.microphone"), undefined, { payload: "data:audio/webm;base64,AQIDBA==", mimeType: "audio/webm", fileName: "sample.webm", duration: 1 }, 6);
  const audioOutput = runAlgorithm(algorithmById.get("output.audio"), audioSource, {}, 7);
  assert.equal(audioOutput.metadata.reconstructedDataUrl, "data:audio/webm;base64,AQIDBA==");

  const imageSource = runAlgorithm(algorithmById.get("source.image"), undefined, { payload: "data:image/png;base64,iVBORw==", mimeType: "image/png", fileName: "sample.png", width: 1, height: 1 }, 8);
  const imageOutput = runAlgorithm(algorithmById.get("output.image"), imageSource, {}, 9);
  assert.equal(imageOutput.metadata.reconstructedDataUrl, "data:image/png;base64,iVBORw==");
  assert.throws(() => runAlgorithm(algorithmById.get("output.audio"), imageSource, {}, 9), /Media type mismatch/);

  const emptyImage = runAlgorithm(algorithmById.get("source.image"), undefined, { payload: "", mimeType: "image/png" }, 10);
  const emptyImageOutput = runAlgorithm(algorithmById.get("output.image"), emptyImage, {}, 11);
  assert.equal(emptyImageOutput.metadata.mediaReady, false);
  assert.equal(emptyImageOutput.metadata.reconstructedDataUrl, undefined);
});

test("real-media templates preserve payload through the configured signal path", () => {
  const graph = graphFromTemplate("mediaText");
  const run = executeGraph(graph.nodes, graph.edges, 17);
  const sink = graph.nodes.find((node) => node.algorithmId === "output.text");
  assert.equal(run.results[sink.id].status, "success");
  assert.equal(run.results[sink.id].data.metadata.reconstructedText, "سلام BitWaveLab!");
  assert.equal(run.results[sink.id].data.metrics.mediaBitErrors, 0);
});
