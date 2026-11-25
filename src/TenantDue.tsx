import React, { useState } from "react";
import { calculateBill, describeSettings, type MayniladSettings } from "./maynilad";
import { EmptyState, Field, ReadingPair, Summary, num, peso, qty, type LineItem } from "./shared";

export interface TenantInputs extends Record<string, string> {
  roomPrevious: string;
  roomCurrent: string;
  commonPrevious: string;
  commonCurrent: string;
  waterPrevious: string;
  waterCurrent: string;
  electricityRate: string;
  waterRateMode: string; // "maynilad" | "manual"
  manualWaterRate: string;
  totalPax: string;
  tenantPax: string;
  internetCharge: string;
}

export const DEFAULT_TENANT: TenantInputs = {
  roomPrevious: "",
  roomCurrent: "",
  commonPrevious: "",
  commonCurrent: "",
  waterPrevious: "",
  waterCurrent: "",
  electricityRate: "13.17",
  waterRateMode: "maynilad",
  manualWaterRate: "32.125",
  totalPax: "3",
  tenantPax: "2",
  internetCharge: "250",
};

interface Props {
  inputs: TenantInputs;
  setInputs: (inputs: TenantInputs) => void;
  mayniladSettings: MayniladSettings;
  onEditMaynilad: () => void;
}

const usage = (previous: string, current: string): number | null => {
  const p = num(previous);
  const c = num(current);
  return p !== null && c !== null && c >= p ? c - p : null;
};

const TenantDue: React.FC<Props> = ({ inputs, setInputs, mayniladSettings, onEditMaynilad }) => {
  const [copied, setCopied] = useState(false);
  const set = (key: keyof TenantInputs) => (value: string) =>
    setInputs({ ...inputs, [key]: value });

  const roomUse = usage(inputs.roomPrevious, inputs.roomCurrent);
  const commonUse = usage(inputs.commonPrevious, inputs.commonCurrent);
  const waterUse = usage(inputs.waterPrevious, inputs.waterCurrent);
  const elecRate = num(inputs.electricityRate);
  const totalPax = num(inputs.totalPax);
  const tenantPax = num(inputs.tenantPax);
  const internet = num(inputs.internetCharge);
  const auto = inputs.waterRateMode !== "manual";

  // Water rate per cu.m: Maynilad's bill for the whole meter ÷ cu.m used.
  let waterRate: number | null = null;
  let waterRateNote: React.ReactNode = null;
  if (auto) {
    if (!mayniladSettings.businessArea) {
      waterRateNote = (
        <>
          Set your business area in{" "}
          <button type="button" className="btn btn-link p-0 align-baseline" onClick={onEditMaynilad}>
            Maynilad Bill
          </button>{" "}
          first.
        </>
      );
    } else if (waterUse === null) {
      waterRateNote = "Enter the water meter readings above.";
    } else if (!Number.isInteger(waterUse)) {
      waterRateNote = "Maynilad bills whole cu.m; use whole-number water readings.";
    } else if (waterUse === 0) {
      waterRate = 0;
      waterRateNote = "No water used this month.";
    } else {
      const bill = calculateBill({ ...mayniladSettings, consumption: waterUse });
      if (bill) {
        waterRate = bill.total / waterUse;
        waterRateNote = (
          <>
            Maynilad bill for {qty(waterUse)} cu.m is {peso(bill.total)}.{" "}
            <span className="text-body-tertiary">
              {describeSettings(mayniladSettings)} ·{" "}
              <button type="button" className="btn btn-link p-0 align-baseline" onClick={onEditMaynilad}>
                change
              </button>
            </span>
          </>
        );
      }
    }
  } else {
    waterRate = num(inputs.manualWaterRate);
  }

  const missing: string[] = [];
  if (roomUse === null) missing.push("room electricity readings");
  if (commonUse === null) missing.push("common area readings");
  if (waterUse === null) missing.push("water readings");
  if (elecRate === null) missing.push("electricity rate");
  if (waterRate === null && waterUse !== null) missing.push("water rate");
  if (!totalPax || tenantPax === null) missing.push("number of people");
  if (internet === null) missing.push("internet charge");

  let items: LineItem[] | null = null;
  if (
    !missing.length &&
    roomUse !== null && commonUse !== null && waterUse !== null &&
    elecRate !== null && waterRate !== null && totalPax && tenantPax !== null && internet !== null
  ) {
    const share = tenantPax / totalPax;
    const pax = `${qty(tenantPax)} of ${qty(totalPax)} people`;
    items = [
      { label: "Room electricity", detail: `${qty(roomUse)} kWh × ${peso(elecRate)}`, amount: roomUse * elecRate },
      { label: "Common area electricity", detail: `${qty(commonUse)} kWh × ${peso(elecRate)} · ${pax}`, amount: commonUse * elecRate * share },
      { label: "Water", detail: `${qty(waterUse)} cu.m × ${peso(waterRate)} · ${pax}`, amount: waterUse * waterRate * share },
      { label: "Internet", detail: `${qty(tenantPax)} × ${peso(internet)}`, amount: tenantPax * internet },
    ];
  }
  const total = items?.reduce((sum, i) => sum + i.amount, 0) ?? 0;

  const copySummary = async () => {
    if (!items) return;
    const lines = [
      "Monthly due",
      ...items.map((i) => `${i.label}: ${peso(i.amount)} (${i.detail})`),
      `Total: ${peso(total)}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; nothing else to do.
    }
  };

  const startNextMonth = () => {
    if (!window.confirm("Move this month's current readings to Previous and clear Current?")) return;
    setInputs({
      ...inputs,
      roomPrevious: inputs.roomCurrent,
      roomCurrent: "",
      commonPrevious: inputs.commonCurrent,
      commonCurrent: "",
      waterPrevious: inputs.waterCurrent,
      waterCurrent: "",
    });
  };

  return (
    <>
      <h2 className="section-title">Meter readings</h2>
      <ReadingPair
        label="Room electricity submeter"
        unit="kWh"
        previous={inputs.roomPrevious}
        current={inputs.roomCurrent}
        onPrevious={set("roomPrevious")}
        onCurrent={set("roomCurrent")}
      />
      <ReadingPair
        label="Common area electricity submeter"
        unit="kWh"
        previous={inputs.commonPrevious}
        current={inputs.commonCurrent}
        onPrevious={set("commonPrevious")}
        onCurrent={set("commonCurrent")}
      />
      <ReadingPair
        label="Water meter"
        unit="cu.m"
        previous={inputs.waterPrevious}
        current={inputs.waterCurrent}
        onPrevious={set("waterPrevious")}
        onCurrent={set("waterCurrent")}
      />

      <h2 className="section-title">Rates</h2>
      <Field
        label="Electricity rate"
        value={inputs.electricityRate}
        onChange={set("electricityRate")}
        prefix="₱"
        suffix="/ kWh"
      />

      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="form-label mb-0">Water rate</span>
          <div className="btn-group btn-group-sm" role="group" aria-label="Water rate source">
            <button
              type="button"
              className={`btn ${auto ? "btn-primary" : "btn-outline-primary"}`}
              aria-pressed={auto}
              onClick={() => set("waterRateMode")("maynilad")}
            >
              From Maynilad
            </button>
            <button
              type="button"
              className={`btn ${!auto ? "btn-primary" : "btn-outline-primary"}`}
              aria-pressed={!auto}
              onClick={() => set("waterRateMode")("manual")}
            >
              Manual
            </button>
          </div>
        </div>
        {auto ? (
          <>
            <div className="input-group">
              <span className="input-group-text">₱</span>
              <output className="form-control bg-body-tertiary">
                {waterRate !== null ? qty(waterRate, 4) : "—"}
              </output>
              <span className="input-group-text">/ cu.m</span>
            </div>
            <div className="form-text">{waterRateNote}</div>
          </>
        ) : (
          <div className="input-group">
            <span className="input-group-text">₱</span>
            <input
              type="text"
              inputMode="decimal"
              aria-label="Water rate per cu.m"
              className="form-control"
              value={inputs.manualWaterRate}
              onChange={(e) => set("manualWaterRate")(e.target.value)}
            />
            <span className="input-group-text">/ cu.m</span>
          </div>
        )}
      </div>

      <Field
        label="Internet charge"
        value={inputs.internetCharge}
        onChange={set("internetCharge")}
        prefix="₱"
        suffix="/ head"
      />

      <h2 className="section-title">People</h2>
      <div className="row g-2">
        <div className="col-6">
          <Field label="Total pax" value={inputs.totalPax} onChange={set("totalPax")} inputMode="numeric" />
        </div>
        <div className="col-6">
          <Field label="Tenant pax" value={inputs.tenantPax} onChange={set("tenantPax")} inputMode="numeric" />
        </div>
      </div>

      {items ? (
        <Summary items={items} totalLabel="Total due" total={total}>
          <div className="d-flex gap-2 mt-3">
            <button type="button" className="btn btn-outline-primary btn-sm flex-fill" onClick={copySummary}>
              {copied ? "Copied" : "Copy summary"}
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm flex-fill" onClick={startNextMonth}>
              Start next month
            </button>
          </div>
        </Summary>
      ) : (
        <EmptyState>Still needed: {missing.join(", ")}.</EmptyState>
      )}
    </>
  );
};

export default TenantDue;
