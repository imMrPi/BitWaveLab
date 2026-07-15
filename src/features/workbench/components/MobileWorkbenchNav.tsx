import Link from "next/link";
import { tr, type Locale } from "@/lib/i18n";
import type { MobilePane } from "../module/workbench.types";

type Props = {
  locale: Locale;
  activePane: MobilePane;
  onPaneChange: (pane: MobilePane) => void;
};

const items: Array<{ id: MobilePane; icon: string; fa: string; en: string }> = [
  { id: "canvas", icon: "⌁", fa: "بوم", en: "Canvas" },
];

export function MobileWorkbenchNav({
  locale,
  activePane,
  onPaneChange,
}: Props) {
  return (
    <nav
      className="fixed inset-x-2 bottom-2 z-50 hidden h-14 grid-cols-2 items-stretch rounded-2xl border border-white/10 bg-[#11151c]/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl max-[840px]:grid"
      aria-label={tr(locale, "ناوبری آزمایشگاه", "Laboratory navigation")}
    >
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          className={`grid place-items-center gap-0.5 rounded-xl border-0 bg-transparent py-1 text-slate-500 transition ${activePane === item.id ? "bg-amber-400/10 text-amber-300" : "hover:bg-white/5 hover:text-slate-300"}`}
          onClick={() => onPaneChange(item.id)}
        >
          <span className="text-base leading-none">{item.icon}</span>
          <b className="text-[8px]">{locale === "fa" ? item.fa : item.en}</b>
        </button>
      ))}
      <Link className="grid place-items-center gap-0.5 rounded-xl py-1 text-slate-500 no-underline transition hover:bg-white/5 hover:text-slate-300" href="/fourier-lab">
        <span className="text-base leading-none">∿</span>
        <b className="text-[8px]">{tr(locale, "فوریه", "Fourier")}</b>
      </Link>
    </nav>
  );
}
