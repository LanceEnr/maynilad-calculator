import React, { useEffect, useState } from "react";
import {
  BUSINESS_AREAS,
  CUSTOMER_TYPES,
  METER_SIZES,
  RATES_AS_OF,
  SEWERAGE_OPTIONS,
  calculateBill,
  type CustomerType,
  type Sewerage,
} from "./maynilad";

export type BillTarget = "currentCharges" | "rentSubmeter";

interface Settings {
  customerType: CustomerType;
  sewerage: Sewerage;
  meterSize: string;
  businessArea: string;
}

const STORAGE_KEY = "maynilad-bill-settings";

const DEFAULT_SETTINGS: Settings = {
  customerType: "1",
  sewerage: "0",
  meterSize: "1",
  businessArea: "",
};

// Remember the dropdowns between visits so only the cu.m needs typing.
const loadSettings = (): Settings => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return {
      customerType: CUSTOMER_TYPES.some((o) => o.value === saved.customerType)
        ? saved.customerType
        : DEFAULT_SETTINGS.customerType,
      sewerage: SEWERAGE_OPTIONS.some((o) => o.value === saved.sewerage)
        ? saved.sewerage
        : DEFAULT_SETTINGS.sewerage,
      meterSize: METER_SIZES.some((o) => o.value === saved.meterSize)
        ? saved.meterSize
        : DEFAULT_SETTINGS.meterSize,
      businessArea: BUSINESS_AREAS.some((o) => o.value === saved.businessArea)
        ? saved.businessArea
        : DEFAULT_SETTINGS.businessArea,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

interface Props {
  onUseTotal: (target: BillTarget, amount: string) => void;
}

const MayniladBill: React.FC<Props> = ({ onUseTotal }) => {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [consumption, setConsumption] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage can be unavailable (private browsing); the calculator still works.
    }
  }, [settings]);

  const update = (key: keyof Settings) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSettings({ ...settings, [key]: e.target.value });

  const cuM = consumption.trim() === "" ? null : Number(consumption);
  const consumptionError =
    cuM !== null && (!Number.isInteger(cuM) || cuM < 0)
      ? "Enter whole cubic meters (e.g. 25)."
      : null;

  const bill =
    cuM !== null && !consumptionError
      ? calculateBill({ ...settings, consumption: cuM })
      : null;

  const rows: [string, number][] = bill
    ? [
        ["Basic Charge", bill.basicCharge],
        ["FCDA", bill.fcda],
        ["Environmental Charge", bill.environmentalCharge],
        ["Sewer Charge", bill.sewerCharge],
        ["MSC", bill.msc],
        ["Government Taxes", bill.governmentTaxes],
      ]
    : [];

  return (
    <div className="card p-4 shadow-sm w-100" style={{ maxWidth: "500px" }}>
      <h2 className="card-title text-center mb-4">Maynilad Bill</h2>

      <div className="mb-3">
        <label className="form-label">Customer Type:</label>
        <select
          className="form-select"
          value={settings.customerType}
          onChange={update("customerType")}
        >
          {CUSTOMER_TYPES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Sewerage:</label>
        <select
          className="form-select"
          value={settings.sewerage}
          onChange={update("sewerage")}
        >
          {SEWERAGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Consumption (cu.m):</label>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={consumption}
          onChange={(e) => setConsumption(e.target.value)}
          className={`form-control ${consumptionError ? "is-invalid" : ""}`}
          placeholder="e.g. 25"
        />
        {consumptionError && (
          <div className="invalid-feedback">{consumptionError}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Meter Size:</label>
        <select
          className="form-select"
          value={settings.meterSize}
          onChange={update("meterSize")}
        >
          {METER_SIZES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} (MSC {peso.format(o.msc / 100)})
            </option>
          ))}
        </select>
        <div className="form-text">
          Not sure? Match the MSC on your bill to the amount in brackets.
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Business Area:</label>
        <select
          className="form-select"
          value={settings.businessArea}
          onChange={update("businessArea")}
        >
          <option value="" disabled>
            Select business area
          </option>
          {BUSINESS_AREAS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {bill && (
        <div className="mt-2">
          <ul className="list-group mb-3">
            {rows.map(([label, amount]) => (
              <li
                key={label}
                className="list-group-item d-flex justify-content-between"
              >
                <span>{label}</span>
                <span>{peso.format(amount)}</span>
              </li>
            ))}
            <li className="list-group-item d-flex justify-content-between fw-bold">
              <span>TOTAL</span>
              <span>{peso.format(bill.total)}</span>
            </li>
          </ul>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary flex-fill"
              onClick={() => onUseTotal("currentCharges", bill.total.toFixed(2))}
            >
              Use as Current Charges
            </button>
            <button
              className="btn btn-outline-primary flex-fill"
              onClick={() => onUseTotal("rentSubmeter", bill.total.toFixed(2))}
            >
              Use as Rent Submeter
            </button>
          </div>
        </div>
      )}

      {!bill && !settings.businessArea && (
        <div className="form-text">Pick a business area to see the bill.</div>
      )}

      <div className="form-text mt-3">
        Estimate only; your actual Maynilad bill takes precedence. Rates as of{" "}
        {RATES_AS_OF}.
      </div>
    </div>
  );
};

export default MayniladBill;
