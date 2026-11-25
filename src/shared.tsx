import React, { useEffect, useId, useState } from "react";

const pesoFormat = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
export const peso = (n: number): string => pesoFormat.format(n);

/** Formats a quantity like 1,234.5 (no trailing zeros). */
export const qty = (n: number, digits = 2): string =>
  n.toLocaleString("en-PH", { maximumFractionDigits: digits });

/** Parses user input ("1,234.50") into a number; null when blank or invalid. */
export const num = (s: string): number | null => {
  const t = s.replace(/,/g, "").trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

/** useState that is saved in this browser so values survive a reload. */
export function useStoredState<T>(
  key: string,
  initial: T,
  normalize: (raw: unknown) => T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : normalize(JSON.parse(raw));
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable (private browsing); the app still works.
    }
  }, [key, value]);
  return [value, setValue];
}

/** Normalizer for flat objects of strings: keeps known keys, fills in defaults. */
export const stringFields =
  <T extends Record<string, string>>(defaults: T) =>
  (raw: unknown): T => {
    const saved = (raw ?? {}) as Record<string, unknown>;
    const out = { ...defaults };
    for (const k of Object.keys(defaults) as (keyof T)[]) {
      const v = saved[k as string];
      if (typeof v === "string") out[k] = v as T[keyof T];
    }
    return out;
  };

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  hint?: React.ReactNode;
  error?: string | null;
  inputMode?: "decimal" | "numeric";
}

export const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
  hint,
  error,
  inputMode = "decimal",
}) => {
  const id = useId();
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className={`input-group ${error ? "has-validation" : ""}`}>
        {prefix && <span className="input-group-text">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          className={`form-control ${error ? "is-invalid" : ""}`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span className="input-group-text">{suffix}</span>}
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
      {hint && !error && <div className="form-text">{hint}</div>}
    </div>
  );
};

interface ReadingProps {
  label: string;
  unit: string;
  previous: string;
  current: string;
  onPrevious: (value: string) => void;
  onCurrent: (value: string) => void;
}

/** Previous / current meter readings side by side, with the usage below. */
export const ReadingPair: React.FC<ReadingProps> = ({
  label,
  unit,
  previous,
  current,
  onPrevious,
  onCurrent,
}) => {
  const prevId = useId();
  const curId = useId();
  const p = num(previous);
  const c = num(current);
  const usage = p !== null && c !== null ? c - p : null;
  return (
    <fieldset className="mb-3">
      <legend className="form-label mb-1">{label}</legend>
      <div className="row g-2">
        <div className="col-6">
          <label htmlFor={prevId} className="form-text mt-0 mb-1 d-block">
            Previous
          </label>
          <input
            id={prevId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className="form-control"
            value={previous}
            onChange={(e) => onPrevious(e.target.value)}
          />
        </div>
        <div className="col-6">
          <label htmlFor={curId} className="form-text mt-0 mb-1 d-block">
            Current
          </label>
          <input
            id={curId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className={`form-control ${usage !== null && usage < 0 ? "is-invalid" : ""}`}
            value={current}
            onChange={(e) => onCurrent(e.target.value)}
          />
        </div>
      </div>
      {usage !== null && (
        <div className={`form-text ${usage < 0 ? "text-danger" : ""}`}>
          {usage < 0
            ? "Current reading is lower than the previous one."
            : `Used ${qty(usage)} ${unit}`}
        </div>
      )}
    </fieldset>
  );
};

export interface LineItem {
  label: string;
  detail?: string;
  amount: number;
  /** Shows this line as the key number of the result. */
  highlight?: boolean;
}

/** The result panel: line items and a highlighted total. */
export const Summary: React.FC<{
  items: LineItem[];
  totalLabel: string;
  total: number;
  /** Shows the total as the key number of the result. */
  highlightTotal?: boolean;
  children?: React.ReactNode;
}> = ({ items, totalLabel, total, highlightTotal, children }) => (
  <section className="summary" aria-live="polite">
    <ul className="list-unstyled mb-0">
      {items.map((item) => (
        <li key={item.label} className={`summary-row ${item.highlight ? "highlight" : ""}`}>
          <div>
            <div>{item.label}</div>
            {item.detail && <div className="summary-detail">{item.detail}</div>}
          </div>
          <div className="text-nowrap">{peso(item.amount)}</div>
        </li>
      ))}
    </ul>
    <div className={`summary-total ${highlightTotal ? "highlight" : ""}`}>
      <span>{totalLabel}</span>
      <span>{peso(total)}</span>
    </div>
    {children}
  </section>
);

export const EmptyState: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="summary summary-empty">{children}</div>
);
