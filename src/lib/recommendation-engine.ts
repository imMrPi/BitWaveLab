import { algorithmById, type DataKind, type GraphEdge, type GraphNode, type GraphRun, type LabData } from "./signal-engine";

export type PipelineRole =
  | "source" | "source-encoder" | "scrambler" | "channel-encoder" | "interleaver"
  | "line-coder" | "multiplexer" | "modulator" | "tx-filter" | "channel"
  | "gain-control" | "synchronizer" | "matched-filter" | "equalizer" | "demodulator" | "detector"
  | "deinterleaver" | "channel-decoder" | "descrambler" | "source-decoder"
  | "reconstruction" | "measurement" | "embedded" | "transform";

export type PipelineSuggestion = {
  id: string;
  algorithmId: string;
  title: string;
  reason: string;
  outcome: string;
  role: PipelineRole;
  level: "important" | "learn" | "optimize";
  confidence: number;
};

export type PipelineAssessment = {
  completion: number;
  transmitter: number;
  receiver: number;
  roles: PipelineRole[];
  warnings: string[];
  nextMissing?: PipelineRole;
};

export const roleInfo: Record<PipelineRole, { fa: string; en: string; side: "TX" | "LINK" | "RX" | "LAB" }> = {
  source:{fa:"منبع اطلاعات",en:"Information source",side:"TX"},
  "source-encoder":{fa:"کدگذار منبع",en:"Source encoder",side:"TX"},
  scrambler:{fa:"اسکرامبلر فرستنده",en:"TX scrambler",side:"TX"},
  "channel-encoder":{fa:"کدگذار کانال",en:"Channel encoder",side:"TX"},
  interleaver:{fa:"درهم‌گذار",en:"Interleaver",side:"TX"},
  "line-coder":{fa:"کدگذار خط",en:"Line coder",side:"TX"},
  multiplexer:{fa:"چندگانه‌ساز",en:"Multiplexer",side:"TX"},
  modulator:{fa:"مدولاتور",en:"Modulator",side:"TX"},
  "tx-filter":{fa:"فیلتر ارسال",en:"Transmit filter",side:"TX"},
  channel:{fa:"کانال فیزیکی",en:"Physical channel",side:"LINK"},
  "gain-control":{fa:"کنترل بهره گیرنده",en:"Receiver gain control",side:"RX"},
  synchronizer:{fa:"هم‌زمان‌ساز",en:"Synchronizer",side:"RX"},
  "matched-filter":{fa:"فیلتر تطبیق‌یافته",en:"Matched filter",side:"RX"},
  equalizer:{fa:"اکولایزر",en:"Equalizer",side:"RX"},
  demodulator:{fa:"دمدولاتور اولیه",en:"Demodulator front end",side:"RX"},
  detector:{fa:"دمدولاتور / آشکارساز",en:"Demodulator / detector",side:"RX"},
  deinterleaver:{fa:"برهم‌گذار معکوس",en:"Deinterleaver",side:"RX"},
  "channel-decoder":{fa:"رمزگشای کانال",en:"Channel decoder",side:"RX"},
  descrambler:{fa:"دی‌اسکرامبلر",en:"Descrambler",side:"RX"},
  "source-decoder":{fa:"رمزگشای منبع",en:"Source decoder",side:"RX"},
  reconstruction:{fa:"بازسازی خروجی",en:"Output reconstruction",side:"RX"},
  measurement:{fa:"اندازه‌گیری / مانیتور",en:"Measurement / monitor",side:"LAB"},
  embedded:{fa:"رابط نهفته",en:"Embedded interface",side:"LAB"},
  transform:{fa:"تبدیل سیگنال",en:"Signal transform",side:"LAB"},
};

const encoderDecoder: Record<string, string> = {
  "source.rle":"decode.rle", "source.huffman":"decode.huffman", "source.arithmetic":"decode.arithmetic", "source.lzw":"decode.lzw",
  "scramble.lfsr":"decode.descramble", "scramble.selfsync":"decode.descramble",
  "fec.parity":"decode.parity", "fec.checksum":"decode.checksum", "fec.crc8":"decode.crc",
  "fec.hamming74":"decode.hamming", "fec.convolutional":"decode.viterbi", "fec.reedsolomon":"decode.reedsolomon",
  "fec.turbo":"decode.turbo", "fec.ldpc":"decode.ldpc", "fec.interleave":"decode.deinterleave",
};

export function roleForAlgorithm(algorithmId: string): PipelineRole {
  const algorithm = algorithmById.get(algorithmId);
  if (algorithmId === "fec.interleave") return "interleaver";
  if (algorithmId === "decode.deinterleave") return "deinterleaver";
  if (algorithmId === "decode.descramble") return "descrambler";
  if (algorithmId.startsWith("decode.")) {
    if (["decode.rle","decode.huffman","decode.arithmetic","decode.lzw","decode.source"].includes(algorithmId)) return "source-decoder";
    return "channel-decoder";
  }
  if (algorithmId === "sync.agc") return "gain-control";
  if (algorithmId === "rx.matched") return "matched-filter";
  if (["rx.equalizer","rx.zf"].includes(algorithmId)) return "equalizer";
  if (algorithmId === "rx.envelope") return "demodulator";
  if (algorithmId.startsWith("rx.") && algorithmId !== "rx.ber") return "detector";
  if (algorithmId === "rx.ber" || algorithm?.category === "analysis") return "measurement";
  if (!algorithm) return "transform";
  const byCategory: Partial<Record<typeof algorithm.category, PipelineRole>> = {
    sources:"source", "source-coding":"source-encoder", scrambling:"scrambler", "channel-coding":"channel-encoder",
    "line-coding":"line-coder", multiplexing:"multiplexer", modulation:"modulator", "pulse-shaping":"tx-filter",
    channel:"channel", synchronization:"synchronizer", reconstruction:"reconstruction", embedded:"embedded",
  };
  return byCategory[algorithm.category] ?? "transform";
}

function longestRun(bits: number[]) {
  let longest = 0, current = 0, previous = -1;
  bits.forEach((bit) => { current = bit === previous ? current + 1 : 1; previous = bit; longest = Math.max(longest, current); });
  return longest;
}

function linkedNodeIds(start: string, nodes: GraphNode[], edges: GraphEdge[]) {
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const id = queue.shift()!;
    edges.filter((edge) => edge.kind !== "annotation" && (edge.from === id || edge.to === id)).forEach((edge) => {
      const next = edge.from === id ? edge.to : edge.from;
      if (!seen.has(next)) { seen.add(next); queue.push(next); }
    });
  }
  return nodes.filter((node) => seen.has(node.id) && !node.disabled && !["analysis.scope","analysis.guide"].includes(node.algorithmId));
}

function upstreamChain(start: string, nodes: GraphNode[], edges: GraphEdge[]) {
  const ordered: GraphNode[] = [];
  const seen = new Set<string>();
  let current = start;
  while (!seen.has(current)) {
    seen.add(current);
    const node = nodes.find((candidate) => candidate.id === current);
    if (node && !node.disabled) ordered.unshift(node);
    const parent = edges.find((edge) => edge.kind !== "annotation" && edge.to === current)?.from;
    if (!parent) break;
    current = parent;
  }
  return ordered;
}

function downstreamIds(start: string, edges: GraphEdge[]) {
  const seen = new Set<string>();
  const queue = [start];
  while (queue.length) {
    const id = queue.shift()!;
    edges.filter((edge) => edge.kind !== "annotation" && edge.from === id).forEach((edge) => { if (!seen.has(edge.to)) { seen.add(edge.to); queue.push(edge.to); } });
  }
  return seen;
}

function accepts(expected: DataKind | "any", actual: DataKind) { return expected === "any" || expected === actual; }

function candidateFits(candidateId: string, selected: GraphNode, selectedKind: DataKind, nodes: GraphNode[], edges: GraphEdge[]) {
  const candidate = algorithmById.get(candidateId);
  if (!candidate || !accepts(candidate.input === "none" ? "any" : candidate.input, selectedKind)) return false;
  const component = linkedNodeIds(selected.id, nodes, edges);
  if (component.some((node) => node.algorithmId === candidateId)) return false;
  if (candidateId === "analysis.scope") return true;
  const outputKind = candidate.output === "same" ? selectedKind : candidate.output;
  const targets = edges.filter((edge) => edge.kind !== "annotation" && edge.from === selected.id).map((edge) => nodes.find((node) => node.id === edge.to)).filter(Boolean) as GraphNode[];
  return targets.every((target) => {
    const targetAlgorithm = algorithmById.get(target.algorithmId);
    return !targetAlgorithm || target.disabled || accepts(targetAlgorithm.input === "none" ? "any" : targetAlgorithm.input, outputKind);
  });
}

function suggestion(algorithmId: string, title: string, reason: string, outcome: string, role: PipelineRole, level: PipelineSuggestion["level"], confidence = 96): PipelineSuggestion {
  return { id:`${algorithmId}-${role}`, algorithmId, title, reason, outcome, role, level, confidence };
}

function firstMissingDecoder(selected: GraphNode, nodes: GraphNode[], edges: GraphEdge[]) {
  const upstream = upstreamChain(selected.id, nodes, edges);
  const downstream = downstreamIds(selected.id, edges);
  const presentAfter = new Set(nodes.filter((node) => downstream.has(node.id)).map((node) => node.algorithmId));
  for (const encoder of [...upstream].reverse()) {
    const decoder = encoderDecoder[encoder.algorithmId];
    if (decoder && !presentAfter.has(decoder) && encoder.algorithmId !== selected.algorithmId) return decoder;
  }
  return undefined;
}

export function getPipelineAssessment(nodes: GraphNode[], edges: GraphEdge[]): PipelineAssessment {
  const active = nodes.filter((node) => !node.disabled && !["analysis.scope","analysis.guide"].includes(node.algorithmId));
  const roles = [...new Set(active.map((node) => roleForAlgorithm(node.algorithmId)))];
  const has = (role: PipelineRole) => roles.includes(role);
  const txChecks = [has("source"), has("channel-encoder") || has("source-encoder"), has("modulator") || has("line-coder"), has("tx-filter") || has("line-coder")];
  const rxChecks = [has("channel"), has("synchronizer") || has("gain-control"), has("detector"), !has("channel-encoder") || has("channel-decoder"), has("measurement")];
  const warnings: string[] = [];
  const nodeIds = new Set(nodes.map((node) => node.id));
  if (edges.some((edge) => !nodeIds.has(edge.from) || !nodeIds.has(edge.to))) warnings.push("یک اتصال به نود ناموجود اشاره می‌کند و باید حذف شود.");
  const counts = new Map<string, number>();
  active.forEach((node) => counts.set(node.algorithmId, (counts.get(node.algorithmId) ?? 0) + 1));
  counts.forEach((count, id) => { if (count > 1 && roleForAlgorithm(id) !== "measurement") warnings.push(`${algorithmById.get(id)?.name ?? id} ${count} بار در یک سیستم قرار گرفته؛ تکرار باید هدف مشخصی داشته باشد.`); });
  if (has("channel-encoder") && has("detector") && !has("channel-decoder")) warnings.push("کدگذار کانال فرستنده، رمزگشای متناظر در گیرنده ندارد.");
  if (has("scrambler") && has("detector") && !has("descrambler")) warnings.push("Scrambler فرستنده باید پس از بازیابی بیت در گیرنده Descramble شود.");
  if (has("source-encoder") && has("detector") && !has("source-decoder")) warnings.push("داده فشرده شده اما Source Decoder متناظر هنوز در گیرنده وجود ندارد.");
  if (has("interleaver") && has("detector") && !has("deinterleaver")) warnings.push("Interleaver باید پیش از Channel Decoder با Deinterleaver معکوس شود.");
  const all = [...txChecks, ...rxChecks];
  const nextMissing = (["source","channel-encoder","modulator","tx-filter","channel","synchronizer","detector","channel-decoder","measurement"] as PipelineRole[]).find((role) => !has(role));
  return {
    completion: Math.round((all.filter(Boolean).length / all.length) * 100),
    transmitter: Math.round((txChecks.filter(Boolean).length / txChecks.length) * 100),
    receiver: Math.round((rxChecks.filter(Boolean).length / rxChecks.length) * 100),
    roles, warnings, nextMissing,
  };
}

export function getPipelineSuggestions(selected: GraphNode | undefined, nodes: GraphNode[], edges: GraphEdge[], run: GraphRun): PipelineSuggestion[] {
  if (!selected) return [];
  if (selected.algorithmId === "analysis.guide") return [];
  const algorithm = algorithmById.get(selected.algorithmId);
  const data: LabData | undefined = run.results[selected.id]?.data;
  if (!algorithm) return [];
  const component = linkedNodeIds(selected.id, nodes, edges);
  const componentRoles = new Set(component.map((node) => roleForAlgorithm(node.algorithmId)));
  const role = roleForAlgorithm(selected.algorithmId);
  const bits = data?.bits ?? (typeof selected.params.bits === "string" ? selected.params.bits.replace(/[^01]/g, "").split("").map(Number) : []);
  const selectedKind = (data?.kind ?? (algorithm.output === "same" ? algorithm.input : algorithm.output)) as DataKind;
  const result: PipelineSuggestion[] = [];
  const add = (...args: Parameters<typeof suggestion>) => result.push(suggestion(...args));
  const has = (candidateRole: PipelineRole) => componentRoles.has(candidateRole);

  if (bits.length && longestRun(bits) >= 5 && !has("scrambler") && ["source","source-encoder"].includes(role)) {
    add("scramble.lfsr","اجرای طولانی بیت‌ها را بشکن",`${longestRun(bits)} بیت یکسان پشت‌سرهم دیده شد؛ چگالی گذار برای Clock Recovery پایین است.`,"Scrambler الگوی طیفی و گذارها را بهتر می‌کند و در گیرنده با Descrambler دقیقاً معکوس می‌شود.","scrambler","important",99);
  }

  if (role === "source" && selectedKind === "samples" && !component.some((node) => node.algorithmId === "analysis.fft")) {
    add("analysis.fft","طیف منبع را ببین","پیش از پردازش بهتر است فرکانس‌های سازنده منبع را بشناسی.","FFT دامنه مؤلفه‌های فرکانسی را بدون تغییر مسیر اندازه می‌گیرد.","measurement","learn",94);
  }

  if (["source","source-encoder","scrambler"].includes(role) && selectedKind === "bits" && !has("channel-encoder")) {
    add("fec.hamming74","یک‌بار حفاظت خطا اضافه کن","در این شاخه هنوز هیچ کد تصحیح خطایی وجود ندارد؛ Hamming فقط یک Encoder لازم دارد، نه چند Encoder پشت‌سرهم.","در گیرنده پس از آشکارسازی، Hamming Decoder متناظر پیشنهاد خواهد شد.","channel-encoder","important",97);
  }

  if (["source","source-encoder","scrambler","channel-encoder","interleaver"].includes(role) && selectedKind === "bits" && !has("modulator") && !has("line-coder")) {
    add("mod.bpsk","بیت‌ها را روی حامل بفرست","جریان بیت هنوز موج قابل عبور از کانال بی‌سیم نیست.","BPSK مسیر آموزشی پایدار برای ورود به مدولاسیون، کانال و گیرنده می‌سازد.","modulator","important",96);
    add("line.manchester","یا یک لینک Baseband بساز","برای کابل دیجیتال می‌توان بدون حامل، بیت‌ها را به سطوح زمانی تبدیل کرد.","Manchester گذار میانی تضمین می‌کند و Clock Recovery را ساده می‌کند.","line-coder","learn",91);
  }

  if (role === "modulator" && !has("tx-filter")) add("shape.rrc","فیلتر ارسال RRC را اضافه کن","سمبل‌های مدوله‌شده بدون شکل‌دهی پالس پهنای باند اضافی و ISI بیشتری دارند.","نصف اول فیلتر Nyquist ساخته می‌شود و Matched Filter گیرنده نیمه دوم را کامل می‌کند.","tx-filter","important",98);
  if (["modulator","tx-filter","line-coder","multiplexer"].includes(role) && !has("channel")) add("channel.awgn","کانال کنترل‌شده بساز","بدون اختلال نمی‌توان عملکرد واقعی گیرنده را سنجید.","SNR قابل تنظیم، مرز خطا و اثر نویز را آشکار می‌کند.","channel","important",98);

  if (role === "channel") {
    if (!has("gain-control")) add("sync.agc","دامنه دریافتی را تثبیت کن","تضعیف و Fading دامنه را از محدوده مناسب آشکارساز خارج می‌کنند.","AGC توان را نرمال می‌کند؛ اطلاعات بیت را تغییر نمی‌دهد.","gain-control","important",95);
    if (!has("synchronizer")) add("sync.carrier","مرجع گیرنده را هم‌زمان کن","گیرنده واقعی باید خطای حامل، زمان سمبل و مرز فریم را تخمین بزند.","Carrier Recovery چرخش فاز/فرکانس را پیش از تصمیم کاهش می‌دهد.","synchronizer","important",96);
    if (!has("matched-filter")) add("rx.matched","فیلتر تطبیق‌یافته گیرنده را اضافه کن","پالس دریافتی باید در لحظه تصمیم بیشترین SNR را داشته باشد.","Matched Filter با پالس ارسال جفت می‌شود و آشکارسازی را پایدارتر می‌کند.","matched-filter","important",98);
  }

  if (["gain-control","synchronizer","matched-filter","equalizer","demodulator"].includes(role) && !has("detector")) {
    add(data?.metadata.constellationScheme ? "rx.ml" : "rx.threshold","سمبل‌ها را به بیت برگردان","زنجیره گیرنده هنوز تصمیم نهایی روی سمبل یا سطح زمانی نگرفته است.","آشکارساز ML/Threshold یک Bit Stream بازیابی‌شده تحویل مراحل Decode می‌دهد.","detector","important",98);
  }

  if (["detector","deinterleaver","channel-decoder","descrambler","source-decoder"].includes(role) && selectedKind === "bits") {
    const decoder = firstMissingDecoder(selected, nodes, edges);
    if (decoder) {
      const decoderRole = roleForAlgorithm(decoder);
      add(decoder,"تبدیل فرستنده را به ترتیب معکوس باز کن","گیرنده باید تبدیل‌های فرستنده را دقیقاً با ترتیب معکوس اجرا کند؛ پیشنهاد از نزدیک‌ترین Encoder حل‌نشده انتخاب شده است.",`${algorithmById.get(decoder)?.name ?? decoder} زوج متناظر مرحله فرستنده است و دوباره پیشنهاد نمی‌شود.`,decoderRole,"important",99);
    } else if (!component.some((node) => node.algorithmId === "rx.ber")) {
      add("rx.ber","صحت کل لینک را اندازه بگیر","پس از کامل شدن مسیر معکوس، باید خروجی با مرجع اولیه مقایسه شود.","BER و تعداد خطا مشخص می‌کند کل زنجیره واقعاً درست بازیابی شده است.","measurement","important",99);
    }
  }

  if (data?.kind === "samples" && !component.some((node) => node.algorithmId === "analysis.scope")) add("analysis.scope","این نقطه را زنده نگه دار","برای مقایسه قبل و بعد، خروجی این مرحله باید هم‌زمان دیده شود.","Scope یک شاخه مانیتور غیرمخرب می‌سازد و مسیر اصلی را تغییر نمی‌دهد.","measurement","optimize",90);

  return result
    .filter((item, index, all) => all.findIndex((candidate) => candidate.algorithmId === item.algorithmId) === index)
    .filter((item) => candidateFits(item.algorithmId, selected, selectedKind, nodes, edges))
    .sort((a,b) => b.confidence - a.confidence)
    .slice(0, 4);
}
