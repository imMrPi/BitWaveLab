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
      className="node-local-recommender"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      dir={locale === "fa" ? "rtl" : "ltr"}
    >
      <header>
        <div>
          <span>LOCAL PATH</span>
          <b>
            {tr(
              locale,
              "گزینه‌های سازگار این اتصال",
              "Connection-aware alternatives",
            )}
          </b>
        </div>
        <button type="button" onClick={onClose}>
          ×
        </button>
      </header>
      <div className="local-contract" dir="ltr">
        <span>{previous?.shortName ?? "START"}</span>
        <i>
          {formatKind(recommendation.previous?.outputKind ?? "none", locale)}
        </i>
        <b>→</b>
        <strong>{current?.shortName}</strong>
        <b>→</b>
        <span>{next || "END"}</span>
      </div>
      <label>
        <span>
          {tr(
            locale,
            "عمل و الگوریتم را انتخاب کن",
            "Choose an action and algorithm",
          )}
        </span>
        <select
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
        <div className="local-choice">
          <span>
            {locale === "fa"
              ? roleInfo[selected.role].fa
              : roleInfo[selected.role].en}{" "}
            · {selected.score}
          </span>
          <p>{locale === "fa" ? selected.reasonFa : selected.reasonEn}</p>
          <code dir="ltr">
            {selected.inputKind} → {selected.outputKind}
          </code>
        </div>
      ) : (
        <p className="local-empty">
          {tr(
            locale,
            "فقط گزینه‌هایی نمایش داده می‌شوند که ورودی، خروجی و نودهای دو طرف آن‌ها با اتصال فعلی سازگار باشند.",
            "Only options compatible with the current input, output and both adjacent nodes are shown.",
          )}
        </p>
      )}
      <button
        type="button"
        className="local-apply"
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
