"use client";

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import CompactLabNav from "./CompactLabNav";
import { tr, useLocale } from "../lib/i18n";

const SAMPLE_COUNT = 256;

type Coefficient = { harmonic: number; a: number; b: number; amplitude: number; phase: number };

function makeWave(kind: "sine" | "square" | "triangle" | "saw") {
  return Array.from({ length: SAMPLE_COUNT }, (_, index) => {
    const phase = index / SAMPLE_COUNT;
    if (kind === "sine") return Math.sin(2 * Math.PI * phase);
    if (kind === "square") return phase < .5 ? 1 : -1;
    if (kind === "triangle") return 1 - 4 * Math.abs(Math.round(phase) - phase);
    return 2 * phase - 1;
  });
}

function path(values: number[], width = 1000, height = 300) {
  // Browser and server JS engines can differ at the last floating-point bit
  // for trigonometric functions. Fixed SVG precision keeps SSR hydration
  // deterministic without changing anything visible in the plot.
  return values.map((value,index) => `${index ? "L" : "M"}${((index/Math.max(1,values.length-1))*width).toFixed(4)},${(height/2-value*height*.38).toFixed(4)}`).join(" ");
}

function coefficients(values: number[], count: number) {
  const n = values.length;
  const dc = values.reduce((sum,value) => sum + value,0) * 2 / n;
  const terms: Coefficient[] = Array.from({ length: count }, (_, index) => {
    const harmonic = index + 1;
    let a = 0, b = 0;
    values.forEach((value,sample) => {
      const angle = 2 * Math.PI * harmonic * sample / n;
      a += value * Math.cos(angle);
      b += value * Math.sin(angle);
    });
    a *= 2/n; b *= 2/n;
    // Ideal Fourier coefficients such as the even terms of a square wave
    // are exactly zero. Clamping numerical dust prevents meaningless phases
    // and makes the educational table stable across runtimes.
    a = Math.abs(a) < 1e-12 ? 0 : Number(a.toFixed(12));
    b = Math.abs(b) < 1e-12 ? 0 : Number(b.toFixed(12));
    const amplitude = Number(Math.hypot(a,b).toFixed(12));
    const phase = amplitude === 0 ? 0 : Number(Math.atan2(-b,a).toFixed(12));
    return { harmonic, a, b, amplitude, phase };
  });
  return { dc, terms };
}

export default function FourierSketchLab() {
  const { locale, setLocale } = useLocale();
  const [values,setValues] = useState(() => makeWave("square"));
  const [harmonics,setHarmonics] = useState(12);
  const [fundamental,setFundamental] = useState(100);
  const drawing = useRef(false);
  const previousIndex = useRef<number | undefined>(undefined);
  const analysis = useMemo(() => coefficients(values,harmonics),[values,harmonics]);
  const reconstruction = useMemo(() => values.map((_,sample) => analysis.dc/2 + analysis.terms.reduce((sum,term) => sum + term.a*Math.cos(2*Math.PI*term.harmonic*sample/values.length)+term.b*Math.sin(2*Math.PI*term.harmonic*sample/values.length),0)),[values,analysis]);
  const mse = values.reduce((sum,value,index) => sum + (value-reconstruction[index])**2,0)/values.length;
  const ranked = [...analysis.terms].sort((a,b) => b.amplitude-a.amplitude);

  function draw(event: ReactPointerEvent<SVGSVGElement>) {
    if (!drawing.current && event.type !== "pointerdown") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const index = Math.max(0,Math.min(SAMPLE_COUNT-1,Math.round(((event.clientX-rect.left)/rect.width)*(SAMPLE_COUNT-1))));
    const value = Math.max(-1.25,Math.min(1.25,1-2*((event.clientY-rect.top)/rect.height)));
    setValues((current) => {
      const next=[...current];
      const start=previousIndex.current ?? index;
      const low=Math.min(start,index), high=Math.max(start,index);
      const startValue=next[start] ?? value;
      for(let cursor=low;cursor<=high;cursor+=1){const ratio=high===low?1:(cursor-low)/(high-low);next[cursor]=start<=index?startValue+(value-startValue)*ratio:value+(startValue-value)*ratio;}
      return next;
    });
    previousIndex.current=index;
  }

  function startDraw(event: ReactPointerEvent<SVGSVGElement>){drawing.current=true;previousIndex.current=undefined;event.currentTarget.setPointerCapture(event.pointerId);draw(event);}
  function stopDraw(){drawing.current=false;previousIndex.current=undefined;}

  const card = "overflow-hidden rounded-2xl border border-white/10 bg-[#0e1117] shadow-xl shadow-black/20";
  const sectionHead = "flex items-center justify-between gap-4 border-b border-white/[.07] px-5 py-4 max-[640px]:items-start max-[640px]:flex-col [&_span]:font-mono [&_span]:text-[7px] [&_span]:tracking-[.15em] [&_span]:text-amber-400 [&_h2]:mt-1 [&_h2]:text-sm [&_h2]:text-slate-100 [&_p]:m-0 [&_p]:max-w-md [&_p]:text-[8px] [&_p]:leading-5 [&_p]:text-slate-600";
  return <main className="h-dvh w-full overflow-y-auto bg-[radial-gradient(circle_at_15%_0%,rgba(139,92,246,.1),transparent_35%),#080a0e] text-slate-100 [scrollbar-color:rgba(148,163,184,.18)_transparent] [scrollbar-width:thin]" dir={locale === "fa" ? "rtl" : "ltr"}>
    <div className="mx-auto grid max-w-7xl gap-4 p-5 max-[640px]:p-3">
      <header className="grid grid-cols-[160px_minmax(0,1fr)_auto] items-center gap-5 rounded-2xl border border-white/10 bg-[#0d1016]/95 p-4 shadow-xl shadow-black/20 max-[860px]:grid-cols-[1fr_auto]">
        <Link href="/" className="grid no-underline"><b className="text-sm font-black text-white">BitWave<span className="text-amber-400">Lab</span></b><small className="font-mono text-[7px] tracking-[.14em] text-slate-600">FOURIER SKETCH</small></Link>
        <div className="max-[860px]:order-3 max-[860px]:col-span-2"><span className="font-mono text-[7px] tracking-[.15em] text-violet-300">INTERACTIVE SERIES SYNTHESIS</span><h1 className="my-1 text-xl font-black text-white max-[560px]:text-base">{tr(locale,"شکل را بکش؛ سینوس‌های سازنده‌اش را پیدا کن","Draw a shape; discover its sinusoidal ingredients")}</h1><p className="m-0 max-w-3xl text-[9px] leading-5 text-slate-500">{tr(locale,"یک دوره از سیگنال را رسم کن. ابزار ضرایب سری فوریه، دامنه، فاز و بازسازی با تعداد هارمونیک دلخواه را محاسبه می‌کند.","Draw one signal period. The lab computes Fourier coefficients, amplitude, phase and a reconstruction with your chosen harmonic count.")}</p></div>
        <CompactLabNav locale={locale} current="series" onLocaleToggle={() => setLocale(locale === "fa" ? "en" : "fa")} />
      </header>

      <section className="grid grid-cols-[minmax(280px,1fr)_minmax(220px,.65fr)_minmax(220px,.65fr)] gap-3 rounded-2xl border border-white/10 bg-[#0e1117] p-4 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
        <div className="flex flex-wrap items-center gap-1.5"><b className="me-1 text-[8px] text-slate-500">{tr(locale,"از نمونه شروع کن:","Start from a preset:")}</b>{(["sine","square","triangle","saw"] as const).map((kind)=><button className="h-8 rounded-lg border border-white/10 bg-white/[.025] px-2.5 text-[8px] text-slate-400 hover:bg-white/[.06] hover:text-white" key={kind} type="button" onClick={() => setValues(makeWave(kind))}>{kind === "sine" ? tr(locale,"سینوسی","Sine") : kind === "square" ? tr(locale,"مربعی","Square") : kind === "triangle" ? tr(locale,"مثلثی","Triangle") : tr(locale,"دندانه‌اره‌ای","Sawtooth")}</button>)}<button type="button" className="h-8 rounded-lg border border-rose-400/15 bg-rose-400/[.04] px-2.5 text-[8px] text-rose-300 hover:bg-rose-400/10" onClick={() => setValues(Array(SAMPLE_COUNT).fill(0))}>{tr(locale,"پاک‌کردن","Clear")}</button></div>
        <label className="grid gap-2 text-[8px] text-slate-500"><span>{tr(locale,"فرکانس پایه","Fundamental frequency")} <b className="font-mono text-amber-300">{fundamental} Hz</b></span><input className="h-1.5 accent-amber-400" type="range" min="1" max="1000" step="1" value={fundamental} onChange={(event)=>setFundamental(Number(event.target.value))}/></label>
        <label className="grid gap-2 text-[8px] text-slate-500"><span>{tr(locale,"تعداد هارمونیک بازسازی","Reconstruction harmonics")} <b className="font-mono text-violet-300">{harmonics}</b></span><input className="h-1.5 accent-violet-400" type="range" min="1" max="32" step="1" value={harmonics} onChange={(event)=>setHarmonics(Number(event.target.value))}/></label>
      </section>

      <section className={card}><div className={sectionHead}><div><span>01 · DRAW</span><h2>{tr(locale,"یک دوره شکل موج را با ماوس رسم کن","Draw one waveform period")}</h2></div><p>{tr(locale,"محور عمودی دامنه نرمال‌شده و محور افقی یک دوره T است.","The vertical axis is normalized amplitude; the horizontal axis is one period T.")}</p></div><div className="relative h-80 touch-none bg-black/20 p-5 ps-10"><svg className="size-full cursor-crosshair" viewBox="0 0 1000 300" preserveAspectRatio="none" onPointerDown={startDraw} onPointerMove={draw} onPointerUp={stopDraw} onPointerCancel={stopDraw}><defs><pattern id="draw-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path className="fill-none stroke-white/[.05]" d="M50 0H0V50"/></pattern></defs><rect width="1000" height="300" fill="url(#draw-grid)"/><line className="stroke-white/15 [stroke-dasharray:4_6]" x1="0" x2="1000" y1="150" y2="150"/><path className="fill-none stroke-amber-300 stroke-[2.5]" d={path(values)}/></svg><span className="absolute bottom-8 left-2 top-6 flex flex-col justify-between font-mono text-[7px] text-slate-600">+A<i className="not-italic">0</i><i className="not-italic">−A</i></span><span className="absolute inset-x-10 bottom-2 flex justify-between font-mono text-[7px] text-slate-600">0 <b>{tr(locale,"یک دوره T","one period T")}</b> T</span></div></section>

      <section className={card}><div className={sectionHead}><div><span>02 · RECONSTRUCT</span><h2>{tr(locale,"اصل و بازسازی سری فوریه","Original vs Fourier reconstruction")}</h2></div><div className="rounded-lg border border-violet-400/15 bg-violet-400/[.05] px-3 py-2"><small className="me-2 font-mono text-[7px] text-slate-600">MSE</small><b className="font-mono text-[9px] text-violet-300">{mse.toExponential(2)}</b></div></div><div className="h-80 bg-black/20 p-5"><svg className="size-full" viewBox="0 0 1000 300" preserveAspectRatio="none"><line className="stroke-white/10 [stroke-dasharray:4_6]" x1="0" x2="1000" y1="150" y2="150"/><path className="fill-none stroke-slate-500/45 stroke-[1.5]" d={path(values)}/><path className="fill-none stroke-violet-300 stroke-[2.5]" d={path(reconstruction)}/></svg><div className="flex justify-center gap-5 text-[7px] text-slate-500"><span><i className="me-1 inline-block h-0.5 w-4 bg-slate-500/50"/> {tr(locale,"شکل رسم‌شده","Drawn signal")}</span><span><i className="me-1 inline-block h-0.5 w-4 bg-violet-300"/> {tr(locale,"جمع سینوس‌ها","Sinusoid sum")}</span></div></div><div className="overflow-x-auto border-t border-white/[.07] bg-violet-400/[.025] p-4 font-mono text-[9px] leading-6 text-violet-200" dir="ltr"><b>x(t) ≈ {analysis.dc/2 >= 0 ? "+" : ""}{(analysis.dc/2).toFixed(3)}</b>{ranked.slice(0,Math.min(6,ranked.length)).map((term)=><span key={term.harmonic}> + {term.amplitude.toFixed(3)} cos(2π·{term.harmonic*fundamental}t {term.phase>=0?"+":"−"} {Math.abs(term.phase).toFixed(2)})</span>)}</div></section>

      <section className={card}><div className={sectionHead}><div><span>03 · INGREDIENTS</span><h2>{tr(locale,"سینوس‌های موردنیاز برای ساخت شکل","Sinusoids required to build the shape")}</h2></div><p>{tr(locale,"مرتب‌شده بر اساس بیشترین سهم دامنه؛ هارمونیک‌های ضعیف‌تر هم در جدول کامل هستند.","Ranked by amplitude contribution; weaker harmonics remain in the full table.")}</p></div><div className="grid grid-cols-3 gap-3 p-4 max-[900px]:grid-cols-2 max-[580px]:grid-cols-1">{ranked.slice(0,6).map((term,index)=>{const component=values.map((_,sample)=>term.amplitude*Math.cos(2*Math.PI*term.harmonic*sample/values.length+term.phase));return <article className="overflow-hidden rounded-xl border border-white/[.08] bg-white/[.018]" key={term.harmonic}><header className="flex items-center gap-2 border-b border-white/[.06] px-3 py-2"><span className="font-mono text-[7px] text-amber-300">#{index+1}</span><b className="text-[9px] text-slate-300">n={term.harmonic}</b><em className="ms-auto font-mono text-[7px] not-italic text-slate-600">{term.harmonic*fundamental} Hz</em></header><svg className="h-24 w-full bg-black/15 p-2" viewBox="0 0 260 85" preserveAspectRatio="none"><line className="stroke-white/10" x1="0" x2="260" y1="42.5" y2="42.5"/><path className="fill-none stroke-cyan-300 stroke-2" d={path(component,260,85)}/></svg><dl className="grid grid-cols-2 border-t border-white/[.06] p-2 [&>div]:text-center [&_dt]:text-[6px] [&_dt]:text-slate-600 [&_dd]:m-0 [&_dd]:mt-1 [&_dd]:font-mono [&_dd]:text-[8px] [&_dd]:text-slate-300"><div><dt>{tr(locale,"دامنه","Amplitude")}</dt><dd>{term.amplitude.toFixed(4)}</dd></div><div><dt>{tr(locale,"فاز","Phase")}</dt><dd>{(term.phase*180/Math.PI).toFixed(1)}°</dd></div></dl></article>})}</div><div className="overflow-x-auto border-t border-white/[.07]"><table className="w-full border-collapse font-mono text-[8px]" dir="ltr"><thead className="bg-black/20 text-slate-500"><tr>{["n","fₙ","aₙ · cos","bₙ · sin","Aₙ","φₙ"].map((title)=><th className="px-4 py-3 text-start font-medium" key={title}>{title}</th>)}</tr></thead><tbody className="text-slate-400 [&_tr]:border-t [&_tr]:border-white/[.05] [&_tr:hover]:bg-white/[.02] [&_td]:px-4 [&_td]:py-2.5">{analysis.terms.map((term)=><tr key={term.harmonic}><td>{term.harmonic}</td><td>{term.harmonic*fundamental} Hz</td><td>{term.a.toFixed(5)}</td><td>{term.b.toFixed(5)}</td><td>{term.amplitude.toFixed(5)}</td><td>{(term.phase*180/Math.PI).toFixed(2)}°</td></tr>)}</tbody></table></div></section>
    </div>
  </main>;
}
