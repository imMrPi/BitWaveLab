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

  return <main className={`fourier-lab locale-${locale}`} dir={locale === "fa" ? "rtl" : "ltr"}>
    <header className="fourier-top"><Link href="/" className="fourier-brand">BitWave<span>Lab</span><small>FOURIER SKETCH</small></Link><div><span>INTERACTIVE SERIES SYNTHESIS</span><h1>{tr(locale,"شکل را بکش؛ سینوس‌های سازنده‌اش را پیدا کن","Draw a shape; discover its sinusoidal ingredients")}</h1><p>{tr(locale,"یک دوره از سیگنال را رسم کن. ابزار ضرایب سری فوریه، دامنه، فاز و بازسازی با تعداد هارمونیک دلخواه را محاسبه می‌کند.","Draw one signal period. The lab computes Fourier coefficients, amplitude, phase and a reconstruction with your chosen harmonic count.")}</p></div><CompactLabNav locale={locale} current="series" onLocaleToggle={() => setLocale(locale === "fa" ? "en" : "fa")} /></header>

    <section className="fourier-controls"><div className="preset-row"><b>{tr(locale,"از نمونه شروع کن:","Start from a preset:")}</b>{(["sine","square","triangle","saw"] as const).map((kind)=><button key={kind} type="button" onClick={() => setValues(makeWave(kind))}>{kind === "sine" ? tr(locale,"سینوسی","Sine") : kind === "square" ? tr(locale,"مربعی","Square") : kind === "triangle" ? tr(locale,"مثلثی","Triangle") : tr(locale,"دندانه‌اره‌ای","Sawtooth")}</button>)}<button type="button" className="clear" onClick={() => setValues(Array(SAMPLE_COUNT).fill(0))}>{tr(locale,"پاک‌کردن","Clear")}</button></div><label><span>{tr(locale,"فرکانس پایه","Fundamental frequency")} <b>{fundamental} Hz</b></span><input type="range" min="1" max="1000" step="1" value={fundamental} onChange={(event)=>setFundamental(Number(event.target.value))}/></label><label><span>{tr(locale,"تعداد هارمونیک بازسازی","Reconstruction harmonics")} <b>{harmonics}</b></span><input type="range" min="1" max="32" step="1" value={harmonics} onChange={(event)=>setHarmonics(Number(event.target.value))}/></label></section>

    <section className="draw-card"><div className="fourier-section-head"><div><span>01 · DRAW</span><h2>{tr(locale,"یک دوره شکل موج را با ماوس رسم کن","Draw one waveform period")}</h2></div><p>{tr(locale,"محور عمودی دامنه نرمال‌شده و محور افقی یک دوره T است.","The vertical axis is normalized amplitude; the horizontal axis is one period T.")}</p></div><div className="draw-surface"><svg viewBox="0 0 1000 300" preserveAspectRatio="none" onPointerDown={startDraw} onPointerMove={draw} onPointerUp={stopDraw} onPointerCancel={stopDraw}><defs><pattern id="draw-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50"/></pattern></defs><rect width="1000" height="300" fill="url(#draw-grid)"/><line x1="0" x2="1000" y1="150" y2="150"/><path d={path(values)}/></svg><span className="amp-label">+A<br/><br/>0<br/><br/>−A</span><span className="period-label">0 <b>{tr(locale,"یک دوره T","one period T")}</b> T</span></div></section>

    <section className="rebuild-card"><div className="fourier-section-head"><div><span>02 · RECONSTRUCT</span><h2>{tr(locale,"اصل و بازسازی سری فوریه","Original vs Fourier reconstruction")}</h2></div><div className="error-chip"><small>MSE</small><b>{mse.toExponential(2)}</b></div></div><div className="rebuild-chart"><svg viewBox="0 0 1000 300" preserveAspectRatio="none"><line x1="0" x2="1000" y1="150" y2="150"/><path className="original" d={path(values)}/><path className="reconstructed" d={path(reconstruction)}/></svg><div><span><i/> {tr(locale,"شکل رسم‌شده","Drawn signal")}</span><span><i/> {tr(locale,"جمع سینوس‌ها","Sinusoid sum")}</span></div></div><div className="series-equation" dir="ltr"><b>x(t) ≈ {analysis.dc/2 >= 0 ? "+" : ""}{(analysis.dc/2).toFixed(3)}</b>{ranked.slice(0,Math.min(6,ranked.length)).map((term)=><span key={term.harmonic}> + {term.amplitude.toFixed(3)} cos(2π·{term.harmonic*fundamental}t {term.phase>=0?"+":"−"} {Math.abs(term.phase).toFixed(2)})</span>)}</div></section>

    <section className="ingredient-card"><div className="fourier-section-head"><div><span>03 · INGREDIENTS</span><h2>{tr(locale,"سینوس‌های موردنیاز برای ساخت شکل","Sinusoids required to build the shape")}</h2></div><p>{tr(locale,"مرتب‌شده بر اساس بیشترین سهم دامنه؛ هارمونیک‌های ضعیف‌تر هم در جدول کامل هستند.","Ranked by amplitude contribution; weaker harmonics remain in the full table.")}</p></div><div className="component-grid">{ranked.slice(0,6).map((term,index)=>{const component=values.map((_,sample)=>term.amplitude*Math.cos(2*Math.PI*term.harmonic*sample/values.length+term.phase));return <article key={term.harmonic}><header><span>#{index+1}</span><b>n={term.harmonic}</b><em>{term.harmonic*fundamental} Hz</em></header><svg viewBox="0 0 260 85" preserveAspectRatio="none"><line x1="0" x2="260" y1="42.5" y2="42.5"/><path d={path(component,260,85)}/></svg><dl><div><dt>{tr(locale,"دامنه","Amplitude")}</dt><dd>{term.amplitude.toFixed(4)}</dd></div><div><dt>{tr(locale,"فاز","Phase")}</dt><dd>{(term.phase*180/Math.PI).toFixed(1)}°</dd></div></dl></article>})}</div><div className="coefficient-table"><table dir="ltr"><thead><tr><th>n</th><th>fₙ</th><th>aₙ · cos</th><th>bₙ · sin</th><th>Aₙ</th><th>φₙ</th></tr></thead><tbody>{analysis.terms.map((term)=><tr key={term.harmonic}><td>{term.harmonic}</td><td>{term.harmonic*fundamental} Hz</td><td>{term.a.toFixed(5)}</td><td>{term.b.toFixed(5)}</td><td>{term.amplitude.toFixed(5)}</td><td>{(term.phase*180/Math.PI).toFixed(2)}°</td></tr>)}</tbody></table></div></section>
  </main>;
}
