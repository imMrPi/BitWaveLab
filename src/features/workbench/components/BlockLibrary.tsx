import type { DragEvent } from "react";
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

type Group = [AlgorithmCategory, AlgorithmDefinition[]];

type Props = {
  locale: Locale;
  search: string;
  activeCategory: AlgorithmCategory | "all";
  categoryCounts: Record<string, number>;
  groups: Group[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: AlgorithmCategory | "all") => void;
  onAdd: (algorithmId: string) => void;
};

export function BlockLibrary({
  locale,
  search,
  activeCategory,
  categoryCounts,
  groups,
  onSearchChange,
  onCategoryChange,
  onAdd,
}: Props) {
  const onDragStart = (
    event: DragEvent<HTMLButtonElement>,
    algorithmId: string,
  ) =>
    event.dataTransfer.setData("application/x-bitwave-algorithm", algorithmId);
  return (
    <aside className="flex h-full min-h-0 min-w-0 flex-col border-r border-white/10 bg-[#0c0f14] [direction:rtl] max-[840px]:border-0">
      <div className="hidden border-b border-white/10 px-4 py-3 max-[840px]:grid max-[840px]:gap-0.5">
        <span className="font-mono text-[8px] font-black tracking-[.16em] text-amber-400">BLOCKS</span>
        <b className="text-xs text-slate-100">{tr(locale, "ساخت زنجیره سیگنال", "Build your signal chain")}</b>
        <small className="text-[9px] leading-5 text-slate-500">
          {tr(
            locale,
            "یک بلوک را لمس کن تا به بوم اضافه شود",
            "Tap a block to add it to the canvas",
          )}
        </small>
      </div>
      <label className="mx-3 mb-2 mt-2.5 flex h-9 shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-[#090c10] px-2.5 text-slate-600 focus-within:border-amber-400/35">
        <span aria-hidden="true">⌕</span>
        <input
          className="min-w-0 flex-1 border-0 bg-transparent text-[10px] text-slate-200 outline-none placeholder:text-slate-600"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={tr(locale, "جست‌وجوی الگوریتم…", "Search algorithms…")}
        />
      </label>
      <div className="flex shrink-0 gap-1.5 overflow-x-auto px-3 pb-2.5 [scrollbar-color:rgba(148,163,184,.18)_transparent] [scrollbar-width:thin]">
        <button
          type="button"
          className={`h-7 shrink-0 whitespace-nowrap rounded-lg border px-2.5 text-[8px] font-bold transition ${activeCategory === "all" ? "border-amber-400/20 bg-amber-400/10 text-amber-300" : "border-transparent bg-white/[.035] text-slate-500 hover:text-slate-300"}`}
          onClick={() => onCategoryChange("all")}
        >
          {tr(locale, "همه", "All")}
        </button>
        {(
          Object.entries(categoryMeta) as Array<
            [AlgorithmCategory, (typeof categoryMeta)[AlgorithmCategory]]
          >
        )
          .sort((a, b) => a[1].order - b[1].order)
          .map(([id]) => (
            <button
              type="button"
              key={id}
              className={`h-7 shrink-0 whitespace-nowrap rounded-lg border px-2.5 text-[8px] font-bold transition ${activeCategory === id ? "border-amber-400/20 bg-amber-400/10 text-amber-300" : "border-transparent bg-white/[.035] text-slate-500 hover:text-slate-300"}`}
              onClick={() => onCategoryChange(id)}
            >
              {localizeCategory(id, locale).name}
              <small className="ms-1.5 text-[7px] opacity-60">{categoryCounts[id]}</small>
            </button>
          ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-6 pt-1 [scrollbar-color:rgba(148,163,184,.18)_transparent] [scrollbar-width:thin]">
        {groups.map(([category, items]) => (
          <section key={category} className="mb-4">
            <div className="grid h-10 grid-cols-[7px_minmax(0,1fr)_auto] items-center gap-2 px-1">
              <span className="h-6 w-1.5 rounded-full opacity-75" style={{ background: categoryMeta[category].color }} />
              <div className="min-w-0">
                <b className="block text-[9px] text-slate-300">{localizeCategory(category, locale).name}</b>
                <small className="mt-0.5 block truncate text-[7px] text-slate-600">{localizeCategory(category, locale).hint}</small>
              </div>
              <em className="text-[8px] not-italic text-slate-600">{items.length}</em>
            </div>
            {items.map((algorithm) => (
              <button
                type="button"
                draggable
                onDragStart={(event) => onDragStart(event, algorithm.id)}
                onClick={() => onAdd(algorithm.id)}
                key={algorithm.id}
                className="group mb-1.5 grid min-h-14 w-full grid-cols-[36px_minmax(0,1fr)_20px] items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.018] p-2 text-right text-slate-200 transition hover:-translate-x-0.5 hover:border-white/20 hover:bg-white/[.04]"
              >
                <span
                  className="grid size-9 place-items-center rounded-lg border text-[8px] font-black [direction:ltr]"
                  style={{
                    color: categoryMeta[algorithm.category].color,
                    borderColor: `color-mix(in srgb, ${categoryMeta[algorithm.category].color} 25%, transparent)`,
                    background: `color-mix(in srgb, ${categoryMeta[algorithm.category].color} 8%, transparent)`,
                  }}
                >
                  {algorithm.shortName.slice(0, 2)}
                </span>
                <span className="min-w-0">
                  <b className="block truncate text-[9px]">{localizeAlgorithm(algorithm, locale).name}</b>
                  <small className="mt-1 block truncate text-[7px] font-medium text-slate-500">{localizeAlgorithm(algorithm, locale).summary}</small>
                </span>
                <span className="text-base text-slate-600 transition group-hover:text-amber-400">＋</span>
              </button>
            ))}
          </section>
        ))}
        {!groups.length && (
          <div className="px-4 py-7 text-center text-[9px] leading-7 text-slate-500">
            {tr(
              locale,
              "الگوریتمی با این عبارت پیدا نشد.",
              "No algorithm matched this query.",
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
