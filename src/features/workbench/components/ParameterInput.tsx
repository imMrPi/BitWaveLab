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
        className={`toggle ${value ? "on" : ""}`}
        onClick={() => onChange(!value)}
      >
        <span />
      </button>
    );
  if (definition.type === "text" && /body|outcome/i.test(definition.key))
    return (
      <textarea
        value={String(value)}
        rows={3}
        dir="auto"
        onChange={(event) => onChange(event.target.value)}
      />
    );
  return (
    <input
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
