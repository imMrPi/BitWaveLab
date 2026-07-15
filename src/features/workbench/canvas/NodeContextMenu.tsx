"use client";

import {
  categoryMeta,
  type AlgorithmCategory,
  type AlgorithmDefinition,
} from "@/lib/signal-engine";
import {
  localizeAlgorithm,
  localizeCategory,
  tr,
  type Locale,
} from "@/lib/i18n";

type ContextMenu = {
  clientX: number;
  clientY: number;
  x: number;
  y: number;
};

type Props = {
  locale: Locale;
  menu: ContextMenu;
  search: string;
  algorithms: AlgorithmDefinition[];
  onSearchChange: (value: string) => void;
  onAdd: (algorithmId: string, position: { x: number; y: number }) => void;
  onClose: () => void;
};

export function NodeContextMenu({
  locale,
  menu,
  search,
  algorithms,
  onSearchChange,
  onAdd,
  onClose,
}: Props) {
  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 border-0 bg-black/20"
        aria-label={tr(locale, "بستن منو", "Close menu")}
        onClick={onClose}
      />
      <div
        className="fixed z-50 grid max-h-[min(500px,calc(100dvh-24px))] w-[min(580px,calc(100vw-24px))] grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden rounded-2xl border border-white/10 bg-[#11151c] shadow-2xl shadow-black/70"
        style={{
          left: Math.max(12, Math.min(menu.clientX, window.innerWidth - 590)),
          top: Math.max(12, Math.min(menu.clientY, window.innerHeight - 500)),
        }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <span className="block font-mono text-[7px] font-black tracking-[.16em] text-amber-400">
              ADD COMPONENT
            </span>
            <b className="mt-1 block text-xs text-slate-100">
              {tr(
                locale,
                "یک بلوک به Canvas اضافه کن",
                "Add a block to the canvas",
              )}
            </b>
          </div>
          <kbd className="rounded-md border border-white/10 bg-black/20 px-2 py-1 font-mono text-[7px] text-slate-500">
            ESC
          </kbd>
        </div>
        <label className="m-3 flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 text-slate-600 focus-within:border-amber-400/30">
          <span aria-hidden="true">⌕</span>
          <input
            autoFocus
            className="min-w-0 flex-1 border-0 bg-transparent text-[10px] text-slate-200 outline-none placeholder:text-slate-600"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={tr(
              locale,
              "جست‌وجوی modulation، ADC، FFT…",
              "Search modulation, ADC, FFT…",
            )}
          />
        </label>
        <div className="grid min-h-0 grid-cols-2 gap-3 overflow-y-auto px-3 pb-3 [scrollbar-color:rgba(148,163,184,.18)_transparent] [scrollbar-width:thin] max-[560px]:grid-cols-1">
          {(
            Object.entries(categoryMeta) as Array<
              [AlgorithmCategory, (typeof categoryMeta)[AlgorithmCategory]]
            >
          )
            .sort((a, b) => a[1].order - b[1].order)
            .map(([category, meta]) => {
              const items = algorithms.filter(
                (algorithm) => algorithm.category === category,
              );
              if (!items.length) return null;
              return (
                <section key={category}>
                  <h3 className="mb-1.5 flex items-center gap-2 px-1 text-[9px] text-slate-400">
                    <i
                      className="size-1.5 rounded-full"
                      style={{ background: meta.color }}
                    />
                    {localizeCategory(category, locale).name}
                    <small className="ms-auto text-[7px] text-slate-600">
                      {items.length}
                    </small>
                  </h3>
                  {items.map((algorithm) => {
                    const copy = localizeAlgorithm(algorithm, locale);
                    return (
                      <button
                        type="button"
                        key={algorithm.id}
                        className="group mb-1 grid w-full grid-cols-[30px_minmax(0,1fr)_16px] items-center gap-2 rounded-lg border border-transparent bg-white/[.02] p-1.5 text-start transition hover:border-white/10 hover:bg-white/[.05]"
                        onClick={() =>
                          onAdd(algorithm.id, { x: menu.x, y: menu.y })
                        }
                      >
                        <span className="grid size-7 place-items-center rounded-md bg-white/5 font-mono text-[7px] font-black text-slate-400">
                          {algorithm.shortName}
                        </span>
                        <span className="min-w-0">
                          <b className="block truncate text-[8px] text-slate-300">
                            {copy.name}
                          </b>
                          <small className="mt-0.5 block truncate text-[7px] text-slate-600">
                            {copy.summary}
                          </small>
                        </span>
                        <em className="not-italic text-slate-600 transition group-hover:text-amber-400">
                          ＋
                        </em>
                      </button>
                    );
                  })}
                </section>
              );
            })}
        </div>
      </div>
    </>
  );
}
