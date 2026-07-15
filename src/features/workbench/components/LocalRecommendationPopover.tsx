"use client";

import { useState } from "react";
import { algorithmById, formatKind } from "@/lib/signal-engine";
import { localizeAlgorithm, tr, type Locale } from "@/lib/i18n";
import { roleInfo } from "@/lib/recommendation-engine";
import type {
  LocalNodeAlternative,
  LocalNodeRecommendation,
} from "@/lib/node-recommendation-engine";

type Props = {
  recommendation: LocalNodeRecommendation;
  locale: Locale;
  onApply: (alternative: LocalNodeAlternative) => void;
  onClose: () => void;
};

export function LocalRecommendationPopover({
  recommendation,
  locale,
  onApply,
  onClose,
}: Props) {
  const [selectedId, setSelectedId] = useState("");
  const selected = recommendation.alternatives.find(
    (alternative) => alternative.id === selectedId,
  );
  const actionLabels = {
    replace: tr(locale, "جایگزینی همین نود", "Replace this node"),
    "insert-before": tr(
      locale,
      "درج بین نود قبلی و این نود",
      "Insert before this node",
    ),
    "insert-after": tr(
      locale,
      "درج بین این نود و نود بعدی",
      "Insert after this node",
    ),
  } as const;
  const previous = recommendation.previous
    ? algorithmById.get(recommendation.previous.algorithmId)
    : undefined;
  const current = algorithmById.get(recommendation.current.algorithmId);
  const next = recommendation.next
    .map(
      (item) =>
        algorithmById.get(item.algorithmId)?.shortName ?? item.algorithmId,
    )
    .join("، ");
  return (
    <section
      className="absolute left-1/2 top-[calc(100%+8px)] z-30 grid w-80 -translate-x-1/2 gap-3 rounded-2xl border border-violet-400/20 bg-[#11151c] p-3 shadow-2xl shadow-black/60"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      <header className="flex items-center justify-between border-b border-white/10 pb-2">
        <div>
          <span className="block font-mono text-[7px] font-black tracking-[.14em] text-violet-300">LOCAL PATH</span>
          <b className="mt-1 block text-[10px] text-slate-200">
            {tr(
              locale,
              "گزینه‌های سازگار این اتصال",
              "Connection-aware alternatives",
            )}
          </b>
        </div>
        <button className="grid size-7 place-items-center rounded-lg border border-white/10 bg-white/[.03] text-slate-500 hover:text-white" type="button" onClick={onClose}>
          ×
        </button>
      </header>
      <div className="flex items-center justify-center gap-1.5 rounded-lg border border-white/[.07] bg-black/20 p-2 font-mono text-[7px]" dir="ltr">
        <span className="text-slate-500">{previous?.shortName ?? "START"}</span>
        <i className="not-italic text-slate-700">
          {formatKind(recommendation.previous?.outputKind ?? "none", locale)}
        </i>
        <b className="text-slate-700">→</b>
        <strong className="text-violet-300">{current?.shortName}</strong>
        <b className="text-slate-700">→</b>
        <span className="truncate text-slate-500">{next || "END"}</span>
      </div>
      <label className="grid gap-1.5">
        <span className="text-[8px] font-bold text-slate-500">
          {tr(
            locale,
            "عمل و الگوریتم را انتخاب کن",
            "Choose an action and algorithm",
          )}
        </span>
        <select
          className="h-9 w-full rounded-lg border border-white/10 bg-[#090c10] px-2 text-[8px] text-slate-200 outline-none focus:border-violet-400/30"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          <option value="">
            {tr(locale, "انتخاب گزینه سازگار…", "Select a compatible option…")}
          </option>
          {(["replace", "insert-before", "insert-after"] as const).map(
            (action) => {
              const items = recommendation.alternatives.filter(
                (alternative) => alternative.action === action,
              );
              return items.length ? (
                <optgroup key={action} label={actionLabels[action]}>
                  {items.map((alternative) => {
                    const algorithm = algorithmById.get(
                      alternative.algorithmId,
                    );
                    return (
                      <option key={alternative.id} value={alternative.id}>
                        {algorithm
                          ? localizeAlgorithm(algorithm, locale).name
                          : alternative.algorithmId}{" "}
                        · {formatKind(alternative.outputKind, locale)}
                      </option>
                    );
                  })}
                </optgroup>
              ) : null;
            },
          )}
        </select>
      </label>
      {selected ? (
        <div className="rounded-lg border border-violet-400/15 bg-violet-400/[.04] p-2.5">
          <span className="text-[8px] font-bold text-violet-300">
            {locale === "fa"
              ? roleInfo[selected.role].fa
              : roleInfo[selected.role].en}{" "}
            · {selected.score}
          </span>
          <p className="my-1.5 text-[8px] leading-4 text-slate-400">{locale === "fa" ? selected.reasonFa : selected.reasonEn}</p>
          <code className="font-mono text-[7px] text-slate-600" dir="ltr">
            {selected.inputKind} → {selected.outputKind}
          </code>
        </div>
      ) : (
        <p className="m-0 rounded-lg bg-white/[.02] p-2.5 text-[8px] leading-4 text-slate-600">
          {tr(
            locale,
            "فقط گزینه‌هایی نمایش داده می‌شوند که ورودی، خروجی و نودهای دو طرف آن‌ها با اتصال فعلی سازگار باشند.",
            "Only options compatible with the current input, output and both adjacent nodes are shown.",
          )}
        </p>
      )}
      <button
        type="button"
        className="h-9 rounded-lg border border-violet-400/20 bg-violet-400/10 text-[8px] font-bold text-violet-300 transition hover:bg-violet-400/15 disabled:cursor-not-allowed disabled:opacity-35"
        disabled={!selected}
        onClick={() => selected && onApply(selected)}
      >
        ↳{" "}
        {selected
          ? actionLabels[selected.action]
          : tr(locale, "ابتدا یک گزینه انتخاب کن", "Choose an option first")}
      </button>
    </section>
  );
}
