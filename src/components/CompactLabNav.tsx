"use client";

import Link from "next/link";
import { useState } from "react";
import { tr, type Locale } from "../lib/i18n";

export default function CompactLabNav({ locale, current, onLocaleToggle }: { locale: Locale; current: "epicycles" | "series"; onLocaleToggle: () => void }) {
  const [open, setOpen] = useState(false);
  function goBack() {
    if (window.history.length > 1) window.history.back();
    else window.location.assign("/");
  }
  const itemClass = "grid grid-cols-[34px_minmax(0,1fr)] items-center gap-2 rounded-xl px-2 py-2 text-start text-slate-300 no-underline transition hover:bg-white/5";
  return <div className="relative z-30 flex items-center gap-1.5 [direction:ltr]">
    <button type="button" className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[.03] px-3 text-[8px] text-slate-400 transition hover:bg-white/[.06] hover:text-white" onClick={goBack}>← <span>{tr(locale,"بازگشت","Back")}</span></button>
    <button type="button" className={`grid size-9 place-content-center gap-1 rounded-lg border bg-white/[.03] transition ${open ? "border-amber-400/30 text-amber-300" : "border-white/10 text-slate-400 hover:bg-white/[.06] hover:text-white"} [&>span]:block [&>span]:h-px [&>span]:w-3.5 [&>span]:bg-current`} aria-expanded={open} aria-label={tr(locale,"منوی ابزارها","Tools menu")} onClick={() => setOpen((value) => !value)}><span/><span/><span/></button>
    {open && <>
      <button type="button" className="fixed inset-0 z-40 border-0 bg-black/40 backdrop-blur-[2px]" aria-label={tr(locale,"بستن منو","Close menu")} onClick={() => setOpen(false)}/>
      <nav className="absolute right-0 top-[calc(100%+8px)] z-50 grid w-80 gap-1 rounded-2xl border border-white/10 bg-[#11151c] p-2 shadow-2xl shadow-black/70 max-[420px]:fixed max-[420px]:inset-x-2 max-[420px]:top-14 max-[420px]:w-auto">
        <header className="border-b border-white/10 px-3 py-2.5"><span className="block font-mono text-[7px] font-black tracking-[.16em] text-amber-400">BITWAVE LABS</span><b className="mt-1 block text-[10px] text-slate-200">{tr(locale,"آزمایشگاه‌های تعاملی","Interactive laboratories")}</b></header>
        <Link className={itemClass} href="/" onClick={() => setOpen(false)}><i className="grid size-8 place-items-center rounded-lg bg-white/5 not-italic text-amber-300">⌁</i><span><b className="block text-[9px]">Node Lab</b><small className="mt-0.5 block text-[7px] text-slate-600">{tr(locale,"بازگشت به محیط طراحی گراف","Return to the graph workspace")}</small></span></Link>
        <Link className={itemClass} href="/docs" onClick={() => setOpen(false)}><i className="grid size-8 place-items-center rounded-lg bg-white/5 not-italic text-cyan-300">?</i><span><b className="block text-[9px]">{tr(locale,"مستندات","Documentation")}</b><small className="mt-0.5 block text-[7px] text-slate-600">{tr(locale,"مفاهیم و مرجع الگوریتم‌ها","Concepts and algorithm reference")}</small></span></Link>
        {current !== "epicycles" && <Link className={itemClass} href="/fourier-lab" onClick={() => setOpen(false)}><i className="grid size-8 place-items-center rounded-lg bg-white/5 not-italic text-violet-300">◉</i><span><b className="block text-[9px]">Fourier Epicycles</b><small className="mt-0.5 block text-[7px] text-slate-600">{tr(locale,"بازسازی مسیر دوبعدی","2D path reconstruction")}</small></span></Link>}
        {current !== "series" && <Link className={itemClass} href="/fourier-series" onClick={() => setOpen(false)}><i className="grid size-8 place-items-center rounded-lg bg-white/5 not-italic text-emerald-300">∿</i><span><b className="block text-[9px]">Fourier Series</b><small className="mt-0.5 block text-[7px] text-slate-600">{tr(locale,"ترکیب هارمونیک‌های یک‌بعدی","1D harmonic synthesis")}</small></span></Link>}
        <button className={`${itemClass} border-0 bg-transparent`} type="button" onClick={() => { onLocaleToggle(); setOpen(false); }}><i className="grid size-8 place-items-center rounded-lg bg-white/5 text-[8px] not-italic text-emerald-300">{locale === "fa" ? "EN" : "فا"}</i><span><b className="block text-[9px]">{locale === "fa" ? "English" : "فارسی"}</b><small className="mt-0.5 block text-[7px] text-slate-600">{tr(locale,"تغییر زبان رابط","Change interface language")}</small></span></button>
      </nav>
    </>}
  </div>;
}
