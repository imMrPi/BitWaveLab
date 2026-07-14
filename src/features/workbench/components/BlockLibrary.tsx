import type { CSSProperties, DragEvent } from "react";
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
    <aside className="library-panel">
      <div className="mobile-pane-intro">
        <span>BLOCKS</span>
        <b>{tr(locale, "ساخت زنجیره سیگنال", "Build your signal chain")}</b>
        <small>
          {tr(
            locale,
            "یک بلوک را لمس کن تا به بوم اضافه شود",
            "Tap a block to add it to the canvas",
          )}
        </small>
      </div>
      <label className="search-box">
        <span>⌕</span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={tr(locale, "جست‌وجوی الگوریتم…", "Search algorithms…")}
        />
      </label>
      <div className="category-strip lab-scrollbar">
        <button
          type="button"
          className={activeCategory === "all" ? "active" : ""}
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
              className={activeCategory === id ? "active" : ""}
              onClick={() => onCategoryChange(id)}
            >
              {localizeCategory(id, locale).name}
              <small>{categoryCounts[id]}</small>
            </button>
          ))}
      </div>
      <div className="algorithm-list lab-scrollbar">
        {groups.map(([category, items]) => (
          <section key={category} className="algorithm-group">
            <div className="algorithm-group-title">
              <span style={{ background: categoryMeta[category].color }} />
              <div>
                <b>{localizeCategory(category, locale).name}</b>
                <small>{localizeCategory(category, locale).hint}</small>
              </div>
              <em>{items.length}</em>
            </div>
            {items.map((algorithm) => (
              <button
                type="button"
                draggable
                onDragStart={(event) => onDragStart(event, algorithm.id)}
                onClick={() => onAdd(algorithm.id)}
                key={algorithm.id}
                className="algorithm-item"
              >
                <span
                  className="algorithm-icon"
                  style={
                    {
                      "--algorithm-color":
                        categoryMeta[algorithm.category].color,
                    } as CSSProperties
                  }
                >
                  {algorithm.shortName.slice(0, 2)}
                </span>
                <span className="algorithm-copy">
                  <b>{localizeAlgorithm(algorithm, locale).name}</b>
                  <small>{localizeAlgorithm(algorithm, locale).summary}</small>
                </span>
                <span className="algorithm-add">＋</span>
              </button>
            ))}
          </section>
        ))}
        {!groups.length && (
          <div className="no-results">
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
