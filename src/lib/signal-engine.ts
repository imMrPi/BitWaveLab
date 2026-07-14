import type {
  AlgorithmCategory,
  AlgorithmDefinition,
  DataKind,
} from "@/domain/signal/signal.types";
import type {
  GraphEdge,
  GraphNode,
  GraphRun,
  NodeRunResult,
} from "@/domain/graph/graph.types";
import { registeredAlgorithmDefinitions } from "@/algorithms/registry";
import { runAlgorithm } from "@/algorithms/runtime/operation-kernel";

export type {
  AlgorithmCategory,
  AlgorithmDefinition,
  ComplexPoint,
  DataKind,
  LabData,
  ParameterDefinition,
  ParameterValue,
} from "@/domain/signal/signal.types";
export type {
  GraphEdge,
  GraphNode,
  GraphRun,
  NodeRunResult,
} from "@/domain/graph/graph.types";
export { constellationReference, runAlgorithm } from "@/algorithms/runtime/operation-kernel";

export const categoryMeta: Record<
  AlgorithmCategory,
  { name: string; hint: string; color: string; order: number }
> = {
  sources: { name: "منابع و ورودی", hint: "تولید داده و موج", color: "#f59e0b", order: 0 },
  analysis: { name: "تحلیل و اندازه‌گیری", hint: "حوزه زمان و فرکانس", color: "#a78bfa", order: 1 },
  sampling: { name: "نمونه‌برداری", hint: "ADC و تغییر نرخ", color: "#22d3ee", order: 2 },
  quantization: { name: "کوانتیزه‌سازی و PCM", hint: "دامنه گسسته", color: "#38bdf8", order: 3 },
  "source-coding": { name: "کدگذاری منبع", hint: "کاهش افزونگی", color: "#34d399", order: 4 },
  "channel-coding": { name: "کدگذاری کانال", hint: "کشف و اصلاح خطا", color: "#4ade80", order: 5 },
  "line-coding": { name: "کدگذاری خط", hint: "بیت به سطح پایه", color: "#fbbf24", order: 6 },
  scrambling: { name: "اسکرامبلینگ", hint: "شکستن الگوهای نامناسب", color: "#fb923c", order: 7 },
  multiplexing: { name: "چندگانه‌سازی", hint: "ترکیب جریان‌ها", color: "#e879f9", order: 8 },
  modulation: { name: "مدولاسیون", hint: "نگاشت روی حامل", color: "#f472b6", order: 9 },
  "pulse-shaping": { name: "شکل‌دهی پالس", hint: "کنترل ISI و طیف", color: "#c084fc", order: 10 },
  channel: { name: "کانال و اختلال", hint: "مدل محیط انتقال", color: "#f87171", order: 11 },
  synchronization: { name: "هم‌زمان‌سازی", hint: "زمان، فاز و فریم", color: "#60a5fa", order: 12 },
  receiver: { name: "گیرنده و تصمیم", hint: "بازیابی اطلاعات", color: "#2dd4bf", order: 13 },
  decoding: { name: "رمزگشایی", hint: "بازگشت بیت و داده", color: "#86efac", order: 14 },
  reconstruction: { name: "بازسازی", hint: "DAC و خروجی نهایی", color: "#67e8f9", order: 15 },
  embedded: { name: "میکروکنترلر و Embedded", hint: "ADC، UART، PWM و سنسور", color: "#facc15", order: 16 },
};

export const algorithms: AlgorithmDefinition[] = [...registeredAlgorithmDefinitions].sort(
  (a, b) => categoryMeta[a.category].order - categoryMeta[b.category].order || a.name.localeCompare(b.name, "fa"),
);

export const algorithmById = new Map(algorithms.map((algorithm) => [algorithm.id, algorithm]));

export function defaultParams(algorithm: AlgorithmDefinition) {
  return Object.fromEntries(algorithm.params.map((parameter) => [parameter.key, parameter.default]));
}

export const mediaInputAlgorithmIds = new Set(["source.microphone", "source.image", "source.text"]);
export const mediaOutputAlgorithmIds = new Set(["output.audio", "output.image", "output.text"]);

export function nodeDimensionsForAlgorithm(algorithmId: string) {
  if (mediaInputAlgorithmIds.has(algorithmId)) return { width: 292, height: 250 };
  if (mediaOutputAlgorithmIds.has(algorithmId)) return { width: 292, height: 226 };
  return undefined;
}

export function createNode(algorithmId: string, index: number, x?: number, y?: number): GraphNode {
  const algorithm = algorithmById.get(algorithmId);
  if (!algorithm) throw new Error(`Unknown algorithm: ${algorithmId}`);
  const dimensions = nodeDimensionsForAlgorithm(algorithmId);
  return {
    id: `node-${Date.now().toString(36)}-${index}`,
    algorithmId,
    x: x ?? 80 + (index % 5) * 270,
    y: y ?? 90 + Math.floor(index / 5) * 190,
    ...dimensions,
    params: defaultParams(algorithm),
  };
}

export function executeGraph(nodes: GraphNode[], edges: GraphEdge[], runSeed = 1): GraphRun {
  const started = performance.now();
  const executableNodes = nodes.filter((node) => node.algorithmId !== "analysis.guide");
  const signalEdges = edges.filter((edge) => edge.kind !== "annotation");
  const results: Record<string, NodeRunResult> = {};
  const logs: string[] = [];
  const incoming = new Map<string, GraphEdge[]>();
  const outgoing = new Map<string, GraphEdge[]>();
  const indegree = new Map(executableNodes.map((node) => [node.id, 0]));
  signalEdges.forEach((edge) => {
    incoming.set(edge.to, [...(incoming.get(edge.to) ?? []), edge]);
    outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge]);
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  });
  const queue = executableNodes.filter((node) => (indegree.get(node.id) ?? 0) === 0);
  let visited = 0;

  while (queue.length) {
    const node = queue.shift()!;
    visited += 1;
    const algorithm = algorithmById.get(node.algorithmId);
    if (!algorithm) continue;
    const parentEdge = incoming.get(node.id)?.[0];
    const input = parentEdge ? results[parentEdge.from]?.data : undefined;
    const nodeStarted = performance.now();
    try {
      if (algorithm.input !== "none" && !input) throw new Error("ورودی این بلوک متصل نیست");
      if (node.disabled) {
        if (!input) throw new Error("Node منبع قابل Bypass نیست زیرا ورودی ندارد");
        const data = { ...input, bits: input.bits ? [...input.bits] : undefined, samples: input.samples ? [...input.samples] : undefined, symbols: input.symbols ? input.symbols.map((point) => ({ ...point })) : undefined, metrics: { ...input.metrics }, metadata: { ...input.metadata, bypassedNode: algorithm.name }, stages: [...input.stages, `Bypass: ${algorithm.shortName}`] };
        results[node.id] = { status: "success", data, elapsed: performance.now() - nodeStarted };
        logs.push(`${algorithm.shortName} در حالت Bypass • سیگنال بدون تغییر عبور کرد`);
      } else {
      if (input && algorithm.input !== "any" && algorithm.input !== input.kind && algorithm.input !== "none") {
        logs.push(`هشدار نوع: ${algorithm.name} انتظار ${algorithm.input} داشت اما ${input.kind} دریافت کرد.`);
      }
      const data = runAlgorithm(algorithm, input, node.params, runSeed + visited * 17);
      results[node.id] = { status: "success", data, elapsed: performance.now() - nodeStarted };
      const dataLength = data.kind === "metrics"
        ? Object.keys(data.metrics).length
        : data.kind === "bits" || data.kind === "frames"
          ? data.bits?.length ?? 0
          : data.kind === "symbols"
            ? data.symbols?.length ?? 0
            : data.samples?.length ?? 0;
      logs.push(`${algorithm.shortName} اجرا شد • ${formatKind(data.kind)} • ${dataLength} داده`);
      }
    } catch (error) {
      results[node.id] = { status: "error", message: error instanceof Error ? error.message : "خطای ناشناخته" };
      logs.push(`خطا در ${algorithm.name}: ${results[node.id].message}`);
    }
    (outgoing.get(node.id) ?? []).forEach((edge) => {
      indegree.set(edge.to, (indegree.get(edge.to) ?? 1) - 1);
      if (indegree.get(edge.to) === 0) {
        const target = executableNodes.find((candidate) => candidate.id === edge.to);
        if (target) queue.push(target);
      }
    });
  }

  if (visited < executableNodes.length) logs.push("اجرای گراف متوقف شد: یک حلقه بدون Delay یا اتصال نامعتبر وجود دارد.");
  return { results, logs, elapsed: performance.now() - started };
}

export function spectrum(samples: number[], sampleRate: number, bins = 96) {
  const n = Math.min(samples.length, bins * 2, 256);
  if (!n) return [];
  const windowed = samples.slice(0, n).map((sample, index) => sample * (0.5 - 0.5 * Math.cos((2 * Math.PI * index) / Math.max(1, n - 1))));
  return Array.from({ length: Math.floor(n / 2) }, (_, k) => {
    let re = 0;
    let im = 0;
    for (let index = 0; index < n; index += 1) {
      const angle = (-2 * Math.PI * k * index) / n;
      re += windowed[index] * Math.cos(angle);
      im += windowed[index] * Math.sin(angle);
    }
    return { frequency: (k * sampleRate) / n, magnitude: Math.sqrt(re * re + im * im) / n };
  });
}

export function formatKind(kind: DataKind | "any" | "same", locale: "fa" | "en" = "fa") {
  const fa = { none: "بدون ورودی", bits: "Bit Stream", samples: "Sample Stream", symbols: "I/Q Symbols", frames: "Frame Stream", metrics: "Metrics", any: "هر نوع", same: "همان نوع" } as Record<string, string>;
  const en = { none: "No input", bits: "Bit Stream", samples: "Sample Stream", symbols: "I/Q Symbols", frames: "Frame Stream", metrics: "Metrics", any: "Any type", same: "Same type" } as Record<string, string>;
  return (locale === "fa" ? fa : en)[kind] ?? kind;
}

export const templates = {
  mediaText: {
    name: "پیام متنی انتها‌به‌انتها",
    description: "Text Input ← Scrambler/Hamming ← BPSK/AWGN ← Decode ← Text Output",
    algorithms: ["source.text", "scramble.lfsr", "fec.hamming74", "mod.bpsk", "channel.awgn", "rx.ml", "decode.hamming", "decode.descramble", "output.text"],
    group: "media",
  },
  mediaImage: {
    name: "ارسال واقعی تصویر",
    description: "Image Upload ← Hamming/BPSK ← Channel ← Decode ← Image Viewer",
    algorithms: ["source.image", "fec.hamming74", "mod.bpsk", "channel.awgn", "rx.ml", "decode.hamming", "output.image"],
    group: "media",
  },
  mediaAudio: {
    name: "لینک صوتی میکروفون",
    description: "Microphone ← Hamming/BPSK ← Channel ← Decode ← Audio Player",
    algorithms: ["source.microphone", "fec.hamming74", "mod.bpsk", "channel.awgn", "rx.ml", "decode.hamming", "output.audio"],
    group: "media",
  },
  bpsk: {
    name: "لینک BPSK زنده",
    description: "بیت ← BPSK ← RRC ← AWGN ← Matched Filter ← تصمیم ← BER",
    algorithms: ["source.bits", "mod.bpsk", "shape.rrc", "channel.awgn", "rx.matched", "rx.threshold", "rx.ber"],
    group: "digital",
  },
  sampling: {
    name: "ADC و بازسازی",
    description: "موج سینوسی ← نمونه‌برداری ← کوانتیزه ← هموارسازی",
    algorithms: ["source.sine", "sampling.uniform", "quant.uniform", "recon.dac", "recon.lowpass", "analysis.metrics"],
    group: "foundations",
  },
  line: {
    name: "Manchester روی خط",
    description: "دنباله بیت ← Manchester ← نویز ← تصمیم ← BER",
    algorithms: ["source.bits", "line.manchester", "channel.awgn", "rx.threshold", "rx.ber"],
    group: "baseband",
  },
  qam: {
    name: "زنجیره 16-QAM",
    description: "بیت ← Hamming ← 16-QAM ← کانال ← Sync/ML ← Hamming Decoder ← BER",
    algorithms: ["source.bits", "fec.hamming74", "mod.qam16", "shape.rrc", "channel.multipath", "channel.awgn", "sync.agc", "sync.carrier", "rx.matched", "rx.ml", "decode.hamming", "rx.ber"],
    group: "digital",
  },
  fourier: {
    name: "موج مربعی و فوریه",
    description: "موج مربعی ← FFT ← سنجش هارمونیک و مؤلفه DC",
    algorithms: ["source.square", "analysis.fft", "analysis.metrics", "analysis.scope"],
    group: "foundations",
  },
  aliasing: {
    name: "آزمایش Aliasing",
    description: "سینوس ← Anti-alias ← کاهش نرخ نمونه ← FFT",
    algorithms: ["source.sine", "sampling.antialias", "sampling.decimate", "analysis.fft", "analysis.scope"],
    group: "foundations",
  },
  pcm: {
    name: "دیجیتال‌سازی PCM",
    description: "سینوس ← Sampling ← Quantization ← PCM",
    algorithms: ["source.sine", "sampling.uniform", "quant.uniform", "quant.pcm", "analysis.metrics"],
    group: "foundations",
  },
  compression: {
    name: "مقایسه فشرده‌سازی منبع",
    description: "Bit Source ← RLE ← Huffman ← Entropy Metrics",
    algorithms: ["source.bits", "source.rle", "source.huffman", "analysis.metrics"],
    group: "coding",
  },
  hamming: {
    name: "Hamming (7,4)",
    description: "Dataword ← Hamming Encoder ← BPSK/AWGN ← Decision ← Syndrome Decoder",
    algorithms: ["source.bits", "fec.hamming74", "mod.bpsk", "channel.awgn", "rx.ml", "decode.hamming", "rx.ber"],
    group: "coding",
  },
  crc: {
    name: "CRC-8 و بررسی فریم",
    description: "Payload ← CRC Generator ← CRC Checker",
    algorithms: ["source.bits", "fec.crc8", "decode.crc", "analysis.metrics"],
    group: "coding",
  },
  convolutional: {
    name: "Convolutional + Viterbi",
    description: "Bits ← Conv 1/2 ← BPSK ← AWGN ← Decision ← Viterbi",
    algorithms: ["source.bits", "fec.convolutional", "mod.bpsk", "channel.awgn", "rx.threshold", "decode.viterbi", "rx.ber"],
    group: "coding",
  },
  nrzl: {
    name: "NRZ-L و مؤلفه DC",
    description: "Bits ← NRZ-L ← Spectrum and DC Metrics",
    algorithms: ["source.bits", "line.nrzl", "analysis.fft", "analysis.metrics", "analysis.scope"],
    group: "baseband",
  },
  ami: {
    name: "AMI و تعادل DC",
    description: "Bits ← AMI ← Spectrum ← Live Scope",
    algorithms: ["source.bits", "line.ami", "analysis.fft", "analysis.scope"],
    group: "baseband",
  },
  scrambling: {
    name: "Scrambler و HDB3",
    description: "Long zeros ← Polynomial Scrambler ← HDB3",
    algorithms: ["source.bits", "scramble.lfsr", "scramble.hdb3", "analysis.scope"],
    group: "baseband",
  },
  ask: {
    name: "لینک ASK",
    description: "Bits ← ASK ← AWGN ← Envelope Detector ← Decision",
    algorithms: ["source.bits", "mod.ask", "channel.awgn", "rx.envelope", "rx.threshold", "rx.ber"],
    group: "digital",
  },
  fsk: {
    name: "لینک FSK",
    description: "Bits ← FSK ← AWGN ← Non-coherent Decision",
    algorithms: ["source.bits", "mod.fsk", "channel.awgn", "rx.envelope", "rx.threshold", "rx.ber"],
    group: "digital",
  },
  qpsk: {
    name: "زنجیره QPSK",
    description: "Bits ← QPSK ← RRC ← AWGN ← Matched ← ML",
    algorithms: ["source.bits", "mod.qpsk", "shape.rrc", "channel.awgn", "rx.matched", "rx.ml", "rx.ber"],
    group: "digital",
  },
  qam64: {
    name: "64-QAM و EVM",
    description: "Bits ← 64-QAM ← AWGN ← AGC ← ML",
    algorithms: ["source.bits", "mod.qam64", "channel.awgn", "sync.agc", "rx.ml", "analysis.metrics"],
    group: "digital",
  },
  ofdm: {
    name: "OFDM چندحاملی",
    description: "Bits ← QPSK Mapping ← OFDM/IFFT ← Multipath ← Equalizer",
    algorithms: ["source.bits", "fec.interleave", "mux.ofdm", "channel.multipath", "sync.channel", "rx.equalizer", "analysis.scope"],
    group: "multicarrier",
  },
  cdma: {
    name: "CDMA و Chip Sequence",
    description: "Bits ← Walsh Spreading ← BPSK ← AWGN ← Correlation",
    algorithms: ["source.bits", "mux.cdma", "mod.bpsk", "channel.awgn", "analysis.correlation", "rx.threshold"],
    group: "multicarrier",
  },
  fading: {
    name: "Rayleigh Fading",
    description: "QPSK ← Rayleigh ← AWGN ← AGC ← ML",
    algorithms: ["source.bits", "mod.qpsk", "channel.rayleigh", "channel.awgn", "sync.agc", "rx.ml", "rx.ber"],
    group: "channel",
  },
  multipath: {
    name: "Multipath و Equalization",
    description: "BPSK ← Multipath ← AWGN ← MMSE Equalizer ← Decision",
    algorithms: ["source.bits", "mod.bpsk", "channel.multipath", "channel.awgn", "rx.equalizer", "rx.threshold", "rx.ber"],
    group: "channel",
  },
  carrierSync: {
    name: "Carrier Recovery",
    description: "QPSK ← CFO ← Carrier Recovery ← ML",
    algorithms: ["source.bits", "mod.qpsk", "channel.cfo", "sync.carrier", "rx.ml", "analysis.scope"],
    group: "receiver",
  },
  timingSync: {
    name: "Symbol Timing Recovery",
    description: "BPSK ← Pulse Shape ← Clock Drift ← Symbol Sync ← Decision",
    algorithms: ["source.bits", "mod.bpsk", "shape.rrc", "sync.clock", "sync.symbol", "rx.threshold", "rx.ber"],
    group: "receiver",
  },
  fullLink: {
    name: "Capstone: فرستنده تا گیرنده کامل",
    description: "Source Coding ← Scrambling ← CRC/FEC/Interleave ← QPSK/RRC ← Channel ← Sync/Detect ← تمام Decoderها ← BER",
    algorithms: ["source.bits", "source.huffman", "scramble.lfsr", "fec.crc8", "fec.hamming74", "fec.interleave", "mod.qpsk", "shape.rrc", "channel.multipath", "channel.awgn", "sync.agc", "sync.clock", "sync.carrier", "rx.matched", "rx.equalizer", "rx.ml", "decode.deinterleave", "decode.hamming", "decode.crc", "decode.descramble", "decode.huffman", "rx.ber"],
    group: "capstone",
  },
  sensorAdc: {
    name: "سنسور تا ADC میکروکنترلر",
    description: "Analog Sensor ← Anti-alias ← MCU ADC ← DMA Buffer ← Scope",
    algorithms: ["embedded.sensor", "sampling.antialias", "embedded.adc", "embedded.dma", "analysis.scope"],
    group: "embedded",
  },
  uart: {
    name: "UART Telemetry",
    description: "Payload ← UART Frame ← Noisy Wire ← Threshold ← BER",
    algorithms: ["source.bits", "embedded.uart", "channel.awgn", "rx.threshold", "rx.ber"],
    group: "embedded",
  },
  pwm: {
    name: "PWM و بازسازی آنالوگ",
    description: "Sensor ← ADC ← PWM ← Low-pass Reconstruction",
    algorithms: ["embedded.sensor", "embedded.adc", "embedded.pwm", "recon.lowpass", "analysis.scope"],
    group: "embedded",
  },
  spi: {
    name: "SPI Sensor Transfer",
    description: "Bits ← SPI Clocked Transfer ← Scope",
    algorithms: ["source.bits", "embedded.spi", "analysis.scope"],
    group: "embedded",
  },
  i2c: {
    name: "I²C Frame",
    description: "Address/Data ← I²C Start/ACK/Stop ← Scope",
    algorithms: ["source.bits", "embedded.i2c", "analysis.scope"],
    group: "embedded",
  },
} satisfies Record<string, { name: string; description: string; algorithms: string[]; group: string }>;

export const templateGroups = {
  media: { name: "ورودی و خروجی واقعی", hint: "میکروفون، تصویر و متن روی مسیر بیت" },
  foundations: { name: "مبانی سیگنال و ADC", hint: "فوریه، نمونه‌برداری و PCM" },
  coding: { name: "کدگذاری و قابلیت اطمینان", hint: "Source Coding، FEC و CRC" },
  baseband: { name: "Baseband و Line Coding", hint: "NRZ، Manchester، AMI و Scrambling" },
  digital: { name: "مدولاسیون دیجیتال", hint: "ASK تا 64-QAM" },
  multicarrier: { name: "چندحاملی و دسترسی", hint: "OFDM و CDMA" },
  channel: { name: "کانال و Equalization", hint: "Fading، Multipath و Noise" },
  receiver: { name: "گیرنده و Synchronization", hint: "Clock، Carrier و Decision" },
  embedded: { name: "میکروکنترلر و گذرگاه‌ها", hint: "ADC، UART، PWM، SPI و I²C" },
  capstone: { name: "پروژه نهایی انتها‌به‌انتها", hint: "تمام تبدیل‌های فرستنده و گیرنده در یک سیستم" },
} as const;

export const learningPhases = [
  { id:"level-1", level:1, name:"۱. مشاهده، داده واقعی و مبانی", english:"1. Real data & signal basics", hint:"متن، تصویر، صوت، زمان، طیف و نمونه‌برداری", hintEnglish:"Text, image, audio, time, spectrum and sampling", description:"از یک داده واقعی شروع کن، تبدیل آن به بیت را ببین و سپس رابطه زمان، فرکانس و نرخ نمونه‌برداری را آزمایش کن.", descriptionEnglish:"Start with real media, observe its bit representation, then explore time, frequency and sampling rate.", outcome:"می‌توانی مسیر واقعی داده تا بیت و بازسازی خروجی را همراه مفاهیم Nyquist، Aliasing و Fourier توضیح بدهی.", outcomeEnglish:"You can explain a real media-to-bits-to-media path alongside Nyquist, aliasing and Fourier concepts.", templateIds:["mediaText","mediaImage","mediaAudio","fourier","sampling","aliasing","pcm"] },
  { id:"level-2", level:2, name:"۲. بیت و انتقال Baseband", english:"2. Bits & baseband", hint:"NRZ، Manchester، AMI و Scrambling", hintEnglish:"NRZ, Manchester, AMI and scrambling", description:"بیت منطقی را به شکل موج قابل انتقال تبدیل کن و اثر گذارها، DC و اجرای طولانی صفر یا یک را ببین.", descriptionEnglish:"Turn logical bits into transmittable waveforms and inspect transitions, DC and long runs.", outcome:"می‌توانی Line Code مناسب را انتخاب کنی و نیاز به Scrambling را توضیح بدهی.", outcomeEnglish:"You can choose a suitable line code and explain when scrambling is required.", templateIds:["nrzl","line","ami","scrambling"] },
  { id:"level-3", level:3, name:"۳. فشرده‌سازی و حفاظت خطا", english:"3. Coding & reliability", hint:"Source Coding، CRC، Hamming و Viterbi", hintEnglish:"Source coding, CRC, Hamming and Viterbi", description:"تفاوت کاهش افزونگی منبع با افزودن افزونگی کنترل‌شده برای کشف و اصلاح خطا را مقایسه کن.", descriptionEnglish:"Compare removing source redundancy with adding controlled redundancy for error protection.", outcome:"جای Encoder و Decoder و تفاوت Detection، Correction و Compression را درست می‌چینی.", outcomeEnglish:"You can correctly place encoders/decoders and distinguish detection, correction and compression.", templateIds:["compression","crc","hamming","convolutional"] },
  { id:"level-4", level:4, name:"۴. مدولاسیون دیجیتال", english:"4. Digital modulation", hint:"ASK، FSK، BPSK، QPSK و QAM", hintEnglish:"ASK, FSK, BPSK, QPSK and QAM", description:"بیت‌ها را روی دامنه، فرکانس و فاز حامل نگاشت کن و صورت‌فلکی و بهره طیفی را مقایسه کن.", descriptionEnglish:"Map bits onto carrier amplitude, frequency and phase; compare constellations and efficiency.", outcome:"می‌توانی بین مقاومت نویزی، پیچیدگی گیرنده و نرخ بیت هر مدولاسیون مصالحه کنی.", outcomeEnglish:"You can trade off noise tolerance, receiver complexity and bit rate across modulations.", templateIds:["ask","fsk","bpsk","qpsk","qam","qam64"] },
  { id:"level-5", level:5, name:"۵. کانال و گیرنده واقعی", english:"5. Real channels & receivers", hint:"Fading، Multipath، Equalization و Synchronization", hintEnglish:"Fading, multipath, equalization and synchronization", description:"اختلال‌های واقعی کانال را وارد کن و ببین AGC، Sync، Matched Filter و Equalizer چگونه بازیابی را ممکن می‌کنند.", descriptionEnglish:"Introduce real channel impairments and recover the signal with AGC, sync, matched filtering and equalization.", outcome:"می‌توانی علت خرابی گیرنده را از روی BER، طیف و صورت‌فلکی ریشه‌یابی کنی.", outcomeEnglish:"You can diagnose receiver failures from BER, spectrum and constellation evidence.", templateIds:["fading","multipath","carrierSync","timingSync"] },
  { id:"level-6", level:6, name:"۶. سیستم‌های پیشرفته و Embedded", english:"6. Advanced & embedded", hint:"OFDM، CDMA، ADC، UART، PWM و Busها", hintEnglish:"OFDM, CDMA, ADC, UART, PWM and buses", description:"پردازش مخابرات را به سیستم‌های چندحاملی، دسترسی چندکاربره و محدودیت‌های سخت‌افزار متصل کن.", descriptionEnglish:"Connect communication processing to multicarrier, multi-user and hardware-constrained systems.", outcome:"می‌توانی یک زنجیره نرم‌افزار–سخت‌افزار از سنسور تا لینک و خروجی طراحی کنی.", outcomeEnglish:"You can design a software–hardware chain from sensor input through link and output.", templateIds:["ofdm","cdma","sensorAdc","uart","pwm","spi","i2c"] },
  { id:"level-7", level:7, name:"۷. پروژه نهایی کامل", english:"7. End-to-end capstone", hint:"مسیر کامل و معکوس‌شدن همه تبدیل‌ها در گیرنده", hintEnglish:"A complete link with every transmitter transform reversed at the receiver", description:"کل فرستنده، کانال و گیرنده را به ترتیب قرارداد داده بساز و هر تبدیل برگشت‌پذیر را در سمت گیرنده معکوس کن.", descriptionEnglish:"Build the full transmitter, channel and receiver by data contract and reverse every invertible transform.", outcome:"با BER نهایی و Probeهای میانی صحت کل سیستم را اثبات می‌کنی.", outcomeEnglish:"You validate the complete system using final BER and intermediate probes.", templateIds:["fullLink"] },
] as const;

export function graphFromTemplate(templateId: keyof typeof templates) {
  const template = templates[templateId];
  const phase = learningPhases.find((candidate) => candidate.templateIds.some((id) => id === templateId));
  const positionFor = (index: number) => {
    const columns = 5;
    const row = Math.floor(index / columns);
    const columnInRow = index % columns;
    const column = row % 2 === 0 ? columnInRow : columns - 1 - columnInRow;
    return { x: 80 + column * 420, guideY: 40 + row * 420, nodeY: 260 + row * 420 };
  };
  const algorithmNodes = template.algorithms.map((algorithmId, index) => {
    const position = positionFor(index);
    const node = createNode(algorithmId, index, position.x, position.nodeY);
    node.id = `template-${templateId}-${index}`;
    if (algorithmId === "channel.awgn") node.params.snr = template.group === "media" ? 24 : 11;
    return node;
  });
  const guideNodes = algorithmNodes.map((targetNode, index) => {
    const position = positionFor(index);
    const target = algorithmById.get(targetNode.algorithmId)!;
    const guide = createNode("analysis.guide", index, position.x, position.guideY);
    guide.id = `template-${templateId}-guide-${index}`;
    guide.params = {
      ...guide.params,
      guideType: "step",
      step: index + 1,
      level: phase?.level ?? 1,
      titleFa: `گام ${index + 1}: ${target.name}`,
      titleEn: `Step ${index + 1}: ${target.shortName}`,
      bodyFa: target.summary,
      bodyEn: `${target.shortName} applies the ${target.operation} operation at this point in the workflow.`,
      outcomeFa: `خروجی ${formatKind(target.output)} را در پنل پایین با مرحله قبل مقایسه کن و نقش این تبدیل را توضیح بده.`,
      outcomeEn: `Compare the ${formatKind(target.output, "en")} output with the previous stage and explain this transform.`,
      pipeline: `${formatKind(target.input, "en")} → ${target.shortName} → ${formatKind(target.output, "en")}`,
    };
    return guide;
  });
  const signalEdges: GraphEdge[] = algorithmNodes.slice(1).map((node, index) => ({ id: `edge-${algorithmNodes[index].id}-${node.id}`, from: algorithmNodes[index].id, to: node.id, kind: "signal" }));
  const annotationEdges: GraphEdge[] = guideNodes.map((guide, index) => ({ id: `note-${guide.id}-${algorithmNodes[index].id}`, from: guide.id, to: algorithmNodes[index].id, kind: "annotation" }));
  return { nodes: guideNodes.flatMap((guide, index) => [guide, algorithmNodes[index]]), edges: [...signalEdges, ...annotationEdges] };
}
