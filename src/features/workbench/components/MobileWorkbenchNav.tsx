import Link from "next/link";
import { tr, type Locale } from "@/lib/i18n";
import type { MobilePane } from "../module/workbench.types";

type Props = {
  locale: Locale;
  activePane: MobilePane;
  onPaneChange: (pane: MobilePane) => void;
};

const items: Array<{ id: MobilePane; icon: string; fa: string; en: string }> = [
  { id: "library", icon: "＋", fa: "بلوک‌ها", en: "Blocks" },
  { id: "canvas", icon: "⌁", fa: "بوم", en: "Canvas" },
  { id: "inspector", icon: "⚙", fa: "تنظیمات", en: "Inspect" },
];

export function MobileWorkbenchNav({
  locale,
  activePane,
  onPaneChange,
}: Props) {
  return (
    <nav
      className="mobile-workbench-nav"
      aria-label={tr(locale, "ناوبری آزمایشگاه", "Laboratory navigation")}
    >
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          className={activePane === item.id ? "active" : ""}
          onClick={() => onPaneChange(item.id)}
        >
          <span>{item.icon}</span>
          <b>{locale === "fa" ? item.fa : item.en}</b>
        </button>
      ))}
      <Link href="/fourier-lab">
        <span>∿</span>
        <b>{tr(locale, "فوریه", "Fourier")}</b>
      </Link>
    </nav>
  );
}
