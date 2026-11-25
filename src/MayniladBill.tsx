import React from "react";
import {
  BUSINESS_AREAS,
  CUSTOMER_TYPES,
  METER_SIZES,
  RATES_AS_OF,
  SEWERAGE_OPTIONS,
  calculateBill,
  type MayniladSettings,
} from "./maynilad";
import { EmptyState, Field, Summary, num, peso } from "./shared";

export type BillTarget = "currentCharges" | "rentSubmeter";

interface Props {
  settings: MayniladSettings;
  setSettings: (s: MayniladSettings) => void;
  consumption: string;
  setConsumption: (value: string) => void;
  onUseTotal: (target: BillTarget, amount: string) => void;
}

const Select: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
}> = ({ label, value, onChange, options, placeholder, hint }) => (
  <div className="mb-3">
    <label className="form-label w-100 mb-0">
      {label}
      <select
        className="form-select mt-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
    {hint && <div className="form-text">{hint}</div>}
  </div>
);

const MayniladBill: React.FC<Props> = ({
  settings,
  setSettings,
  consumption,
  setConsumption,
  onUseTotal,
}) => {
  const set = (key: keyof MayniladSettings) => (value: string) =>
    setSettings({ ...settings, [key]: value });

  const cuM = num(consumption);
  const consumptionError =
    consumption.trim() !== "" && cuM === null
      ? "Enter a number."
      : cuM !== null && (!Number.isInteger(cuM) || cuM < 0)
        ? "Maynilad bills whole cubic meters, e.g. 25."
        : null;
  const bill =
    cuM !== null && !consumptionError ? calculateBill({ ...settings, consumption: cuM }) : null;

  return (
    <>
      <div className="row g-2">
        <div className="col-6">
          <Select
            label="Customer type"
            value={settings.customerType}
            onChange={set("customerType")}
            options={CUSTOMER_TYPES}
          />
        </div>
        <div className="col-6">
          <Select
            label="Sewerage"
            value={settings.sewerage}
            onChange={set("sewerage")}
            options={SEWERAGE_OPTIONS}
          />
        </div>
      </div>
      <Select
        label="Meter size"
        value={settings.meterSize}
        onChange={set("meterSize")}
        options={METER_SIZES.map((m) => ({
          value: m.value,
          label: `${m.label} · MSC ${peso(m.msc / 100)}`,
        }))}
        hint="Not sure? Match the MSC on your bill."
      />
      <Select
        label="Business area"
        value={settings.businessArea}
        onChange={set("businessArea")}
        options={BUSINESS_AREAS}
        placeholder="Select business area"
      />
      <Field
        label="Consumption"
        value={consumption}
        onChange={setConsumption}
        suffix="cu.m"
        placeholder="e.g. 25"
        inputMode="numeric"
        error={consumptionError}
      />

      {bill && cuM !== null ? (
        <Summary
          items={[
            { label: "Basic charge", amount: bill.basicCharge },
            { label: "FCDA", amount: bill.fcda },
            { label: "Environmental charge", amount: bill.environmentalCharge },
            ...(bill.sewerCharge ? [{ label: "Sewer charge", amount: bill.sewerCharge }] : []),
            { label: "Maintenance service charge", amount: bill.msc },
            { label: "Government taxes", amount: bill.governmentTaxes },
          ]}
          totalLabel="Estimated bill"
          total={bill.total}
        >
          {cuM > 0 && (
            <div className="summary-note">
              That's <strong>{peso(bill.total / cuM)}</strong> per cu.m. Tenant Due works
              this out for you from the water meter readings.
            </div>
          )}
          <div className="summary-note mt-3 mb-2">Send this total to Water Split as:</div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm flex-fill"
              onClick={() => onUseTotal("currentCharges", bill.total.toFixed(2))}
            >
              Current charges
            </button>
            <button
              className="btn btn-outline-primary btn-sm flex-fill"
              onClick={() => onUseTotal("rentSubmeter", bill.total.toFixed(2))}
            >
              Rent submeter
            </button>
          </div>
        </Summary>
      ) : (
        <EmptyState>
          {settings.businessArea
            ? "Enter the consumption to see the bill."
            : "Pick your business area, then enter the consumption."}
        </EmptyState>
      )}

      <p className="fine-print">
        Same rates as Maynilad's online calculator, as of {RATES_AS_OF}. This is an estimate;
        your actual bill takes precedence.
      </p>
    </>
  );
};

export default MayniladBill;
