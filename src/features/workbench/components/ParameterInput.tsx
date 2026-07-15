import type { ParameterDefinition, ParameterValue } from "@/lib/signal-engine";

type Props = {
  definition: ParameterDefinition;
  value: ParameterValue;
  onChange: (value: ParameterValue) => void;
};

export function ParameterInput({ definition, value, onChange }: Props) {
  if (definition.type === "select")
    return (
      <select
        className="h-9 w-full rounded-lg border border-white/10 bg-[#090c10] px-2.5 text-[9px] text-slate-200 outline-none focus:border-amber-400/35"
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
      >
        {definition.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  if (definition.type === "toggle")
    return (
      <button
        type="button"
        className={`relative h-6 w-11 rounded-full border transition ${value ? "border-emerald-400/30 bg-emerald-400/15" : "border-white/10 bg-black/30"}`}
        onClick={() => onChange(!value)}
      >
        <span className={`absolute top-1/2 size-4 -translate-y-1/2 rounded-full transition ${value ? "left-1 bg-emerald-300" : "left-6 bg-slate-500"}`} />
      </button>
    );
  if (definition.type === "text" && /body|outcome/i.test(definition.key))
    return (
      <textarea
        className="min-h-20 w-full resize-y rounded-lg border border-white/10 bg-[#090c10] p-2.5 text-[9px] leading-5 text-slate-200 outline-none focus:border-amber-400/35"
        value={String(value)}
        rows={3}
        dir="auto"
        onChange={(event) => onChange(event.target.value)}
      />
    );
  return (
    <input
      className="h-9 w-full rounded-lg border border-white/10 bg-[#090c10] px-2.5 text-[9px] text-slate-200 outline-none focus:border-amber-400/35"
      type={definition.type === "text" ? "text" : definition.type}
      value={String(value)}
      min={definition.min}
      max={definition.max}
      step={definition.step}
      dir={definition.type === "text" ? "ltr" : undefined}
      onChange={(event) =>
        onChange(
          definition.type === "text"
            ? event.target.value
            : Number(event.target.value),
        )
      }
    />
  );
}
