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
    <header className="topbar">
      <div className="brand-lockup">
        <div className="brand-mark">
          <span />
          <i />
        </div>
        <div>
          <h1>
            BitWave<span>Lab</span>
          </h1>
          <span className="text-white text-md">Mahdi Khodaie</span>
        </div>
      </div>
      
      <div className="template-switcher">
        <button
          type="button"
          className="template-trigger"
          aria-expanded={props.templateMenuOpen}
          onClick={() => props.onTemplateMenuChange(!props.templateMenuOpen)}
        >
          <span>
            <small>{tr(props.locale, "آزمایش آماده", "Ready workflow")}</small>
            <b>{copy.name}</b>
          </span>

          <svg
            className="template-trigger-icon"
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

      <div className="run-controls">
        <div className="history-controls">
          <button
            type="button"
            disabled={!props.canUndo}
            onClick={props.onUndo}
            title="Undo · Ctrl+Z"
          >
            ↶
          </button>
          <button
            type="button"
            disabled={!props.canRedo}
            onClick={props.onRedo}
            title="Redo · Ctrl+Shift+Z"
          >
            ↷
          </button>
        </div>
        <button
          type="button"
          className={`live-button ${props.live ? "active" : ""}`}
          onClick={props.onLiveToggle}
        >
          <span className="live-dot" />
          {tr(props.locale, "در حال اجرا", "Running")}
        </button>
        <button
          type="button"
          className={`run-button ${props.running ? "running" : ""}`}
          onClick={props.onRun}
        >
          <svg className="play-icon" viewBox="0 0 24 24" aria-hidden="true">
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
          className={`tool-menu-trigger ${props.toolsMenuOpen ? "active" : ""}`}
          aria-expanded={props.toolsMenuOpen}
          aria-label={tr(props.locale, "منوی ابزارها", "Tools menu")}
          onClick={() => props.onToolsMenuChange(!props.toolsMenuOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <input
        ref={inputRef}
        className="project-file-input"
        type="file"
        accept="application/json,.json"
        onChange={importFile}
      />
      {props.toolsMenuOpen && (
        <>
          <button
            type="button"
            className="tool-menu-dismiss"
            aria-label={tr(props.locale, "بستن منو", "Close menu")}
            onClick={() => props.onToolsMenuChange(false)}
          />
          <nav className="tool-header-menu">
            <header>
              <span>WORKSPACE TOOLS</span>
              <b>
                {tr(
                  props.locale,
                  "میانبرهای آزمایشگاه",
                  "Laboratory shortcuts",
                )}
              </b>
            </header>
            <Link href="/docs">
              <i>?</i>
              <span>
                <b>{tr(props.locale, "مستندات", "Documentation")}</b>
                <small>
                  {tr(
                    props.locale,
                    "مفاهیم و مرجع الگوریتم‌ها",
                    "Concepts and algorithm reference",
                  )}
                </small>
              </span>
            </Link>
            <Link href="/fourier-lab">
              <i>∿</i>
              <span>
                <b>
                  {tr(props.locale, "آزمایشگاه فوریه", "Fourier laboratory")}
                </b>
                <small>
                  {tr(
                    props.locale,
                    "بازسازی یک‌بعدی و دوبعدی",
                    "1D and 2D reconstruction",
                  )}
                </small>
              </span>
            </Link>
            <button type="button" onClick={props.onLocaleToggle}>
              <i>{props.locale === "fa" ? "EN" : "فا"}</i>
              <span>
                <b>{props.locale === "fa" ? "English" : "فارسی"}</b>
                <small>
                  {tr(
                    props.locale,
                    "تغییر زبان رابط",
                    "Change interface language",
                  )}
                </small>
              </span>
            </button>
            <div className="tool-menu-project">
              <button type="button" onClick={() => inputRef.current?.click()}>
                ⇧ {tr(props.locale, "آپلود پروژه", "Import project")}
              </button>
              <button type="button" onClick={props.onProjectExport}>
                ⇩ {tr(props.locale, "دانلود پروژه", "Export project")}
              </button>
            </div>
          </nav>
        </>
      )}

      {props.projectNotice && (
        <button
          type="button"
          className="project-notice"
          onClick={props.onNoticeClose}
        >
          {props.projectNotice}
          <span>×</span>
        </button>
      )}

      {props.templateMenuOpen && (
        <>
          <button
            className="menu-dismiss"
            aria-label={tr(props.locale, "بستن", "Close")}
            onClick={() => props.onTemplateMenuChange(false)}
          />
          <div className="template-mega-menu">
            <div className="mega-heading">
              <div>
                <span>GUIDED LEARNING PATH</span>
                <h2>
                  {tr(
                    props.locale,
                    "مسیر یادگیری از صفر تا سیستم واقعی",
                    "Learning path: foundations to a real system",
                  )}
                </h2>
              </div>
              <p>
                {tr(
                  props.locale,
                  "مرحله‌ها را به‌ترتیب جلو برو و خروجی هر تبدیل را روی بوم مقایسه کن.",
                  "Follow the levels in order and compare every transform on the canvas.",
                )}
              </p>
            </div>
            <div className="mega-grid lab-scrollbar">
              {learningPhases.map((phase) => {
                const items = phase.templateIds
                  .map((id) => [id, templates[id as TemplateId]] as const)
                  .filter(([, template]) => Boolean(template));
                return (
                  <section key={phase.id} className="learning-phase">
                    <h3>
                      <span>
                        <em>L{phase.level}</em>
                        {props.locale === "fa" ? phase.name : phase.english}
                      </span>
                      <small>{items.length}</small>
                    </h3>
                    <p className="phase-hint">
                      {props.locale === "fa" ? phase.hint : phase.hintEnglish}
                    </p>
                    <p className="phase-description">
                      {props.locale === "fa"
                        ? phase.description
                        : phase.descriptionEnglish}
                    </p>
                    <div className="phase-outcome">
                      <span>✓</span>
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
                          className={
                            props.activeTemplate === id ? "active" : ""
                          }
                        >
                          <b>{itemCopy.name}</b>
                          <span>{itemCopy.description}</span>
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
