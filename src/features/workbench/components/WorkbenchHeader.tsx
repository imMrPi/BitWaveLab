import Link from "next/link";
import { useRef, type ChangeEvent } from "react";
import { learningPhases, templates } from "@/lib/signal-engine";
import { localizeTemplate, tr, type Locale } from "@/lib/i18n";

type TemplateId = keyof typeof templates;

type Props = {
  locale: Locale;
  activeTemplate: TemplateId;
  templateMenuOpen: boolean;
  toolsMenuOpen: boolean;
  live: boolean;
  running: boolean;
  canUndo: boolean;
  canRedo: boolean;
  projectNotice: string;
  onTemplateMenuChange: (open: boolean) => void;
  onToolsMenuChange: (open: boolean) => void;
  onTemplateLoad: (id: TemplateId) => void;
  onLocaleToggle: () => void;
  onLiveToggle: () => void;
  onRun: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onProjectExport: () => void;
  onProjectImport: (file?: File) => void;
  onNoticeClose: () => void;
};

export function WorkbenchHeader(props: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const copy = localizeTemplate(
    props.activeTemplate,
    templates[props.activeTemplate],
    props.locale,
  );
  const importFile = (event: ChangeEvent<HTMLInputElement>) => {
    props.onProjectImport(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
    <header className="relative z-30 grid h-16 grid-cols-[270px_minmax(260px,1fr)_auto] items-center gap-4 border-b border-white/10 bg-[#0a0c11]/95 px-4 shadow-xl shadow-black/20 [direction:ltr] max-[840px]:h-12 max-[840px]:grid-cols-[1fr_auto] max-[840px]:gap-2 max-[840px]:px-2">
      <div className="flex items-center gap-3 [direction:ltr]">
        <div className="relative grid size-9 place-items-center overflow-hidden rounded-xl border border-amber-400/35 bg-amber-400/10 font-mono text-base font-black text-amber-400 max-[840px]:size-8">
          ∿
        </div>
        <div>
          <h1 className="m-0 text-base font-black leading-none tracking-tight max-[840px]:text-sm">
            BitWave<span className="text-amber-400">Lab</span>
          </h1>
          <span className="mt-1 block text-[8px] font-bold tracking-wide text-slate-300 max-[840px]:hidden">Mahdi Khodaie</span>
        </div>
      </div>
      
      <div className="flex min-w-0 items-center justify-center [direction:rtl] max-[840px]:hidden">
        <button
          type="button"
          className="flex h-10 min-w-60 max-w-lg items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[.025] px-3 text-slate-200 transition hover:border-white/20 hover:bg-white/[.04]"
          aria-expanded={props.templateMenuOpen}
          onClick={() => props.onTemplateMenuChange(!props.templateMenuOpen)}
        >
          <span className="min-w-0 text-start">
            <small className="block text-[7px] font-black uppercase tracking-[.14em] text-slate-600">{tr(props.locale, "آزمایش آماده", "Ready workflow")}</small>
            <b className="mt-0.5 block truncate text-[10px]">{copy.name}</b>
          </span>

          <svg
            className={`shrink-0 text-slate-500 transition ${props.templateMenuOpen ? "rotate-180" : ""}`}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-1.5 [direction:ltr]">
        <div className="flex items-center overflow-hidden rounded-lg border border-white/10 max-[840px]:hidden">
          <button
            type="button"
            disabled={!props.canUndo}
            onClick={props.onUndo}
            className="grid size-9 place-items-center border-0 border-r border-white/10 bg-[#11151c] text-sm text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            title="Undo · Ctrl+Z"
          >
            ↶
          </button>
          <button
            type="button"
            disabled={!props.canRedo}
            onClick={props.onRedo}
            className="grid size-9 place-items-center border-0 bg-[#11151c] text-sm text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            title="Redo · Ctrl+Shift+Z"
          >
            ↷
          </button>
        </div>
        <button
          type="button"
          className={`flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[9px] font-bold transition max-[840px]:hidden ${props.live ? "border-emerald-400/20 bg-emerald-400/[.06] text-emerald-300" : "border-white/10 bg-[#11151c] text-slate-400"}`}
          onClick={props.onLiveToggle}
        >
          <span className={`size-1.5 rounded-full ${props.live ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.65)]" : "bg-slate-500"}`} />
          {tr(props.locale, "در حال اجرا", "Running")}
        </button>
        <button
          type="button"
          className={`flex h-9 min-w-24 items-center justify-center rounded-lg border border-amber-300 bg-amber-400 px-3 text-[9px] font-black text-[#181205] shadow-lg shadow-amber-400/10 transition hover:bg-amber-300 max-[840px]:min-w-20 ${props.running ? "animate-pulse" : ""}`}
          onClick={props.onRun}
        >
          <svg className="me-1 size-3" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>

          <span>
            {props.running
              ? tr(props.locale, "در حال اجرا", "Running")
              : tr(props.locale, "اجرا", "Run")}
          </span>
        </button>
        <button
          type="button"
          className={`grid size-9 place-content-center gap-1 rounded-lg border bg-[#11151c] transition ${props.toolsMenuOpen ? "border-amber-400/30 text-amber-300" : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"}`}
          aria-expanded={props.toolsMenuOpen}
          aria-label={tr(props.locale, "منوی ابزارها", "Tools menu")}
          onClick={() => props.onToolsMenuChange(!props.toolsMenuOpen)}
        >
          <span className="block h-px w-3.5 bg-current" />
          <span className="block h-px w-3.5 bg-current" />
          <span className="block h-px w-3.5 bg-current" />
        </button>
      </div>

      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept="application/json,.json"
        onChange={importFile}
      />
      {props.toolsMenuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 border-0 bg-black/20"
            aria-label={tr(props.locale, "بستن منو", "Close menu")}
            onClick={() => props.onToolsMenuChange(false)}
          />
          <nav className="absolute right-3 top-[calc(100%+8px)] z-50 grid w-80 gap-1 rounded-2xl border border-white/10 bg-[#11151c] p-2 shadow-2xl shadow-black/60 max-[840px]:fixed max-[840px]:inset-x-2 max-[840px]:top-14 max-[840px]:w-auto">
            <header className="border-b border-white/10 px-3 py-2.5">
              <span className="block font-mono text-[7px] font-black tracking-[.16em] text-amber-400">WORKSPACE TOOLS</span>
              <b className="mt-1 block text-xs text-slate-100">
                {tr(
                  props.locale,
                  "میانبرهای آزمایشگاه",
                  "Laboratory shortcuts",
                )}
              </b>
            </header>
            <Link className="grid grid-cols-[32px_1fr] items-center gap-2 rounded-xl px-2 py-2 text-slate-300 no-underline transition hover:bg-white/5" href="/docs">
              <i className="grid size-8 place-items-center rounded-lg bg-white/5 not-italic text-amber-300">?</i>
              <span className="min-w-0">
                <b className="block text-[10px]">{tr(props.locale, "مستندات", "Documentation")}</b>
                <small className="mt-0.5 block text-[8px] text-slate-500">
                  {tr(
                    props.locale,
                    "مفاهیم و مرجع الگوریتم‌ها",
                    "Concepts and algorithm reference",
                  )}
                </small>
              </span>
            </Link>
            <Link className="grid grid-cols-[32px_1fr] items-center gap-2 rounded-xl px-2 py-2 text-slate-300 no-underline transition hover:bg-white/5" href="/fourier-lab">
              <i className="grid size-8 place-items-center rounded-lg bg-white/5 not-italic text-cyan-300">∿</i>
              <span className="min-w-0">
                <b className="block text-[10px]">
                  {tr(props.locale, "آزمایشگاه فوریه", "Fourier laboratory")}
                </b>
                <small className="mt-0.5 block text-[8px] text-slate-500">
                  {tr(
                    props.locale,
                    "بازسازی یک‌بعدی و دوبعدی",
                    "1D and 2D reconstruction",
                  )}
                </small>
              </span>
            </Link>
            <button className="grid grid-cols-[32px_1fr] items-center gap-2 rounded-xl border-0 bg-transparent px-2 py-2 text-start text-slate-300 transition hover:bg-white/5" type="button" onClick={props.onLocaleToggle}>
              <i className="grid size-8 place-items-center rounded-lg bg-white/5 text-[9px] not-italic text-emerald-300">{props.locale === "fa" ? "EN" : "فا"}</i>
              <span className="min-w-0">
                <b className="block text-[10px]">{props.locale === "fa" ? "English" : "فارسی"}</b>
                <small className="mt-0.5 block text-[8px] text-slate-500">
                  {tr(
                    props.locale,
                    "تغییر زبان رابط",
                    "Change interface language",
                  )}
                </small>
              </span>
            </button>
            <div className="mt-1 grid grid-cols-2 gap-1.5 border-t border-white/10 pt-2">
              <button className="h-9 rounded-lg border border-white/10 bg-white/[.03] text-[9px] text-slate-300 hover:bg-white/[.06]" type="button" onClick={() => inputRef.current?.click()}>
                ⇧ {tr(props.locale, "آپلود پروژه", "Import project")}
              </button>
              <button className="h-9 rounded-lg border border-white/10 bg-white/[.03] text-[9px] text-slate-300 hover:bg-white/[.06]" type="button" onClick={props.onProjectExport}>
                ⇩ {tr(props.locale, "دانلود پروژه", "Export project")}
              </button>
            </div>
          </nav>
        </>
      )}

      {props.projectNotice && (
        <button
          type="button"
          className="absolute left-1/2 top-[calc(100%+8px)] z-[60] flex -translate-x-1/2 items-center gap-3 rounded-xl border border-emerald-400/20 bg-[#11151c] px-4 py-2 text-[9px] text-emerald-300 shadow-xl"
          onClick={props.onNoticeClose}
        >
          {props.projectNotice}
          <span>×</span>
        </button>
      )}

      {props.templateMenuOpen && (
        <>
          <button
            className="fixed inset-0 z-40 border-0 bg-black/30 backdrop-blur-[2px]"
            aria-label={tr(props.locale, "بستن", "Close")}
            onClick={() => props.onTemplateMenuChange(false)}
          />
          <div className="absolute inset-x-4 top-[calc(100%+8px)] z-50 max-h-[min(76vh,720px)] overflow-hidden rounded-2xl border border-white/10 bg-[#0e1117] shadow-2xl shadow-black/70 max-[840px]:fixed max-[840px]:inset-2 max-[840px]:top-14">
            <div className="grid grid-cols-[1fr_minmax(240px,420px)] gap-6 border-b border-white/10 px-5 py-4 max-[840px]:grid-cols-1 max-[840px]:gap-2 max-[840px]:px-4 max-[840px]:py-3">
              <div>
                <span className="font-mono text-[7px] font-black tracking-[.16em] text-amber-400">GUIDED LEARNING PATH</span>
                <h2 className="mt-1 text-sm text-white">
                  {tr(
                    props.locale,
                    "مسیر یادگیری از صفر تا سیستم واقعی",
                    "Learning path: foundations to a real system",
                  )}
                </h2>
              </div>
              <p className="m-0 text-[9px] leading-5 text-slate-500">
                {tr(
                  props.locale,
                  "مرحله‌ها را به‌ترتیب جلو برو و خروجی هر تبدیل را روی بوم مقایسه کن.",
                  "Follow the levels in order and compare every transform on the canvas.",
                )}
              </p>
            </div>
            <div className="grid max-h-[calc(min(76vh,720px)-82px)] grid-cols-4 gap-3 overflow-y-auto p-4 [scrollbar-color:rgba(148,163,184,.18)_transparent] [scrollbar-width:thin] max-[1200px]:grid-cols-3 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
              {learningPhases.map((phase) => {
                const items = phase.templateIds
                  .map((id) => [id, templates[id as TemplateId]] as const)
                  .filter(([, template]) => Boolean(template));
                return (
                  <section key={phase.id} className="rounded-xl border border-white/[.08] bg-white/[.018] p-3">
                    <h3 className="mb-2 flex items-center justify-between text-[10px] text-slate-200">
                      <span>
                        <em className="me-1.5 rounded bg-amber-400/10 px-1.5 py-1 text-[7px] not-italic text-amber-300">L{phase.level}</em>
                        {props.locale === "fa" ? phase.name : phase.english}
                      </span>
                      <small className="text-[8px] text-slate-600">{items.length}</small>
                    </h3>
                    <p className="mb-1 text-[8px] font-bold text-slate-400">
                      {props.locale === "fa" ? phase.hint : phase.hintEnglish}
                    </p>
                    <p className="mb-2 text-[8px] leading-4 text-slate-600">
                      {props.locale === "fa"
                        ? phase.description
                        : phase.descriptionEnglish}
                    </p>
                    <div className="mb-2 flex gap-1.5 rounded-lg bg-emerald-400/[.05] p-2 text-[8px] leading-4 text-emerald-300/80">
                      <span className="shrink-0">✓</span>
                      {props.locale === "fa"
                        ? phase.outcome
                        : phase.outcomeEnglish}
                    </div>
                    {items.map(([id, template]) => {
                      const itemCopy = localizeTemplate(
                        id,
                        template,
                        props.locale,
                      );
                      return (
                        <button
                          type="button"
                          key={id}
                          onClick={() => props.onTemplateLoad(id as TemplateId)}
                          className={`mb-1.5 block w-full rounded-lg border p-2 text-start transition ${props.activeTemplate === id ? "border-amber-400/25 bg-amber-400/[.07]" : "border-white/[.07] bg-black/10 hover:border-white/15 hover:bg-white/[.025]"}`}
                        >
                          <b className="block text-[9px] text-slate-200">{itemCopy.name}</b>
                          <span className="mt-1 block text-[7px] leading-4 text-slate-600">{itemCopy.description}</span>
                        </button>
                      );
                    })}
                  </section>
                );
              })}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
