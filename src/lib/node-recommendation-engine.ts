import type { AlgorithmDefinition, DataKind } from "@/domain/signal/signal.types";
import type { GraphEdge, GraphNode, GraphRun } from "@/domain/graph/graph.types";
import { registeredAlgorithmDefinitions } from "@/algorithms/registry";
import { roleForAlgorithm, type PipelineRole } from "./recommendation-engine";

export type LocalAlternativeAction = "replace" | "insert-before" | "insert-after";

export interface LocalNodeAlternative {
  id: string;
  action: LocalAlternativeAction;
  algorithmId: string;
  role: PipelineRole;
  inputKind: DataKind | "any";
  outputKind: DataKind;
  score: number;
  reasonFa: string;
  reasonEn: string;
}

export interface LocalNodeRecommendation {
  nodeId: string;
  previous?: { nodeId: string; algorithmId: string; outputKind: DataKind };
  current: { algorithmId: string; inputKind: DataKind | "any"; outputKind: DataKind };
  next: Array<{ nodeId: string; algorithmId: string; inputKind: DataKind | "any" }>;
  alternatives: LocalNodeAlternative[];
}

const definitions = new Map(registeredAlgorithmDefinitions.map((algorithm) => [algorithm.id, algorithm]));
const excluded = new Set(["analysis.guide", "analysis.scope"]);
const mediaKindByAlgorithm: Record<string, string> = {
  "source.microphone": "audio", "source.image": "image", "source.text": "text",
  "output.audio": "audio", "output.image": "image", "output.text": "text",
};

const roleOrder: PipelineRole[] = [
  "source", "source-encoder", "scrambler", "channel-encoder", "interleaver", "line-coder",
  "multiplexer", "modulator", "tx-filter", "channel", "gain-control", "synchronizer",
  "matched-filter", "equalizer", "demodulator", "detector", "deinterleaver",
  "channel-decoder", "descrambler", "source-decoder", "reconstruction", "measurement",
  "embedded", "transform",
];

function accepts(input: DataKind | "any", actual: DataKind) {
  return input === "any" || input === actual;
}

function staticOutput(algorithm: AlgorithmDefinition, input?: DataKind): DataKind {
  if (algorithm.output !== "same") return algorithm.output;
  if (input) return input;
  return algorithm.input === "none" || algorithm.input === "any" ? "samples" : algorithm.input;
}

function outputKindFor(node: GraphNode, run: GraphRun, fallbackInput?: DataKind) {
  const runtimeKind = run.results[node.id]?.data?.kind;
  if (runtimeKind) return runtimeKind;
  const algorithm = definitions.get(node.algorithmId);
  return algorithm ? staticOutput(algorithm, fallbackInput) : "samples";
}

function candidateAccepts(algorithm: AlgorithmDefinition, input: DataKind | undefined) {
  return input ? algorithm.input !== "none" && accepts(algorithm.input, input) : algorithm.input === "none";
}

function successorsAccept(algorithm: AlgorithmDefinition, input: DataKind | undefined, successors: GraphNode[]) {
  const output = staticOutput(algorithm, input);
  return successors.every((successor) => {
    if (successor.disabled) return true;
    const next = definitions.get(successor.algorithmId);
    return !next || (next.input !== "none" && accepts(next.input, output));
  });
}

function activeContractTargets(start: GraphNode[], nodes: GraphNode[], edges: GraphEdge[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const signalEdges = edges.filter((edge) => edge.kind !== "annotation");
  const queue = [...start];
  const seen = new Set<string>();
  const targets: GraphNode[] = [];
  while (queue.length) {
    const node = queue.shift()!;
    if (seen.has(node.id)) continue;
    seen.add(node.id);
    if (!node.disabled) {
      targets.push(node);
      continue;
    }
    signalEdges.filter((edge) => edge.from === node.id).forEach((edge) => {
      const next = byId.get(edge.to);
      if (next) queue.push(next);
    });
  }
  return targets;
}

function actionReason(action: LocalAlternativeAction, input: DataKind | undefined, output: DataKind, nextCount: number) {
  const contract = `${input ?? "∅"} → ${output}`;
  if (action === "replace") return {
    fa: `جایگزین سازگار با قرارداد ${contract} است و ${nextCount || "بدون"} اتصال بعدی را حفظ می‌کند.`,
    en: `Compatible replacement for ${contract}; it preserves ${nextCount || "no"} downstream connection(s).`,
  };
  if (action === "insert-before") return {
    fa: `بین نود قبلی و این نود قرار می‌گیرد؛ قرارداد میانی ${contract} بدون قطع زنجیره معتبر است.`,
    en: `Fits between the previous and current nodes; the intermediate ${contract} contract remains valid.`,
  };
  return {
    fa: `پس از این نود درج می‌شود؛ خروجی ${output} با تمام ورودی‌های بعدی سازگار است.`,
    en: `Inserts after this node; ${output} is accepted by every current downstream input.`,
  };
}

function rank(
  candidate: AlgorithmDefinition,
  action: LocalAlternativeAction,
  current: AlgorithmDefinition,
  previousRole: PipelineRole | undefined,
  nextRoles: PipelineRole[],
  existingIds: Set<string>,
) {
  const role = roleForAlgorithm(candidate.id);
  const roleIndex = roleOrder.indexOf(role);
  const currentIndex = roleOrder.indexOf(roleForAlgorithm(current.id));
  const previousIndex = previousRole ? roleOrder.indexOf(previousRole) : -1;
  const nextIndex = nextRoles.length ? Math.min(...nextRoles.map((item) => roleOrder.indexOf(item))) : roleOrder.length;
  let score = candidate.fidelity === "exact" ? 12 : 5;
  if (action === "replace") {
    if (role === roleForAlgorithm(current.id)) score += 80;
    if (candidate.category === current.category) score += 45;
  } else if (action === "insert-before") {
    if (roleIndex >= previousIndex && roleIndex <= currentIndex) score += 55;
    score += Math.max(0, 22 - Math.abs(currentIndex - roleIndex) * 3);
  } else {
    if (roleIndex >= currentIndex && roleIndex <= nextIndex) score += 55;
    score += Math.max(0, 22 - Math.abs(roleIndex - currentIndex) * 3);
  }
  if (existingIds.has(candidate.id)) score -= 28;
  return score;
}

export function getLocalNodeRecommendation(
  nodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
  run: GraphRun,
): LocalNodeRecommendation | undefined {
  const currentNode = nodes.find((node) => node.id === nodeId);
  const current = currentNode ? definitions.get(currentNode.algorithmId) : undefined;
  if (!currentNode || !current || currentNode.algorithmId === "analysis.guide") return undefined;

  const signalEdges = edges.filter((edge) => edge.kind !== "annotation");
  const incoming = signalEdges.filter((edge) => edge.to === nodeId);
  const outgoing = signalEdges.filter((edge) => edge.from === nodeId);
  const previousNode = incoming.length === 1 ? nodes.find((node) => node.id === incoming[0].from) : undefined;
  const successors = outgoing.map((edge) => nodes.find((node) => node.id === edge.to)).filter(Boolean) as GraphNode[];
  const downstreamContracts = activeContractTargets(successors, nodes, signalEdges);
  const currentContract = activeContractTargets([currentNode], nodes, signalEdges);
  const previousOutput = previousNode ? outputKindFor(previousNode, run) : undefined;
  const currentOutput = outputKindFor(currentNode, run, previousOutput);
  const previousMediaKind = String(previousNode ? run.results[previousNode.id]?.data?.metadata.mediaKind ?? mediaKindByAlgorithm[previousNode.algorithmId] ?? "" : "");
  const currentMediaKind = String(run.results[currentNode.id]?.data?.metadata.mediaKind ?? mediaKindByAlgorithm[currentNode.algorithmId] ?? previousMediaKind);
  const existingIds = new Set(nodes.filter((node) => !node.disabled).map((node) => node.algorithmId));
  const previousRole = previousNode ? roleForAlgorithm(previousNode.algorithmId) : undefined;
  const nextRoles = successors.map((node) => roleForAlgorithm(node.algorithmId));

  const alternatives: LocalNodeAlternative[] = [];
  const add = (candidate: AlgorithmDefinition, action: LocalAlternativeAction, input: DataKind | undefined, targets: GraphNode[], mediaKind: string) => {
    if (excluded.has(candidate.id) || candidate.id === current.id && action === "replace") return;
    if (candidate.id.startsWith("output.") && mediaKind && mediaKindByAlgorithm[candidate.id] !== mediaKind) return;
    if (!candidateAccepts(candidate, input) || !successorsAccept(candidate, input, targets)) return;
    const output = staticOutput(candidate, input);
    const reason = actionReason(action, input, output, targets.length);
    alternatives.push({
      id: `${action}:${candidate.id}`,
      action,
      algorithmId: candidate.id,
      role: roleForAlgorithm(candidate.id),
      inputKind: candidate.input,
      outputKind: output,
      score: rank(candidate, action, current, previousRole, nextRoles, existingIds),
      reasonFa: reason.fa,
      reasonEn: reason.en,
    });
  };

  for (const candidate of registeredAlgorithmDefinitions) {
    add(candidate, "replace", previousOutput, downstreamContracts, previousMediaKind);
    if (incoming.length <= 1) add(candidate, "insert-before", previousOutput, currentContract, previousMediaKind);
    add(candidate, "insert-after", currentOutput, downstreamContracts, currentMediaKind);
  }

  const limits: Record<LocalAlternativeAction, number> = { replace: 10, "insert-before": 10, "insert-after": 10 };
  const top = (action: LocalAlternativeAction) => alternatives
    .filter((item) => item.action === action)
    .sort((a, b) => b.score - a.score || a.algorithmId.localeCompare(b.algorithmId))
    .slice(0, limits[action]);

  return {
    nodeId,
    previous: previousNode ? { nodeId: previousNode.id, algorithmId: previousNode.algorithmId, outputKind: previousOutput! } : undefined,
    current: { algorithmId: current.id, inputKind: current.input, outputKind: currentOutput },
    next: successors.map((node) => ({ nodeId: node.id, algorithmId: node.algorithmId, inputKind: definitions.get(node.algorithmId)?.input ?? "any" })),
    alternatives: [...top("replace"), ...top("insert-before"), ...top("insert-after")],
  };
}
