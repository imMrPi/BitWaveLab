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
  return <div className="shared-lab-nav">
    <button type="button" className="lab-back-button" onClick={goBack}>← <span>{tr(locale,"بازگشت","Back")}</span></button>
    <button type="button" className={`tool-menu-trigger ${open ? "active" : ""}`} aria-expanded={open} aria-label={tr(locale,"منوی ابزارها","Tools menu")} onClick={() => setOpen((value) => !value)}><span/><span/><span/></button>
    {open && <><button type="button" className="tool-menu-dismiss" aria-label={tr(locale,"بستن منو","Close menu")} onClick={() => setOpen(false)}/><nav className="tool-header-menu fourier-tool-menu">
      <header><span>BITWAVE LABS</span><b>{tr(locale,"آزمایشگاه‌های تعاملی","Interactive laboratories")}</b></header>
      <Link href="/" onClick={() => setOpen(false)}><i>⌁</i><span><b>Node Lab</b><small>{tr(locale,"بازگشت به محیط طراحی گراف","Return to the graph workspace")}</small></span></Link>
      <Link href="/docs" onClick={() => setOpen(false)}><i>?</i><span><b>{tr(locale,"مستندات","Documentation")}</b><small>{tr(locale,"مفاهیم و مرجع الگوریتم‌ها","Concepts and algorithm reference")}</small></span></Link>
      {current !== "epicycles" && <Link href="/fourier-lab" onClick={() => setOpen(false)}><i>◉</i><span><b>Fourier Epicycles</b><small>{tr(locale,"بازسازی مسیر دوبعدی","2D path reconstruction")}</small></span></Link>}
      {current !== "series" && <Link href="/fourier-series" onClick={() => setOpen(false)}><i>∿</i><span><b>Fourier Series</b><small>{tr(locale,"ترکیب هارمونیک‌های یک‌بعدی","1D harmonic synthesis")}</small></span></Link>}
      <button type="button" onClick={() => { onLocaleToggle(); setOpen(false); }}><i>{locale === "fa" ? "EN" : "فا"}</i><span><b>{locale === "fa" ? "English" : "فارسی"}</b><small>{tr(locale,"تغییر زبان رابط","Change interface language")}</small></span></button>
    </nav></>}
  </div>;
}
