import React from "react";
import { EmptyState, Field, Summary, num, peso, qty } from "./shared";

export interface SplitInputs extends Record<string, string> {
  currentCharges: string;
  rentSubmeter: string;
  rentSubmeterMode: string; // "tenant" | "manual"
  firstFloor: string;
  secondFloor: string;
}

export const DEFAULT_SPLIT: SplitInputs = {
  currentCharges: "",
  rentSubmeter: "",
  rentSubmeterMode: "tenant",
  firstFloor: "3",
  secondFloor: "5",
};

interface Props {
  inputs: SplitInputs;
  setInputs: (inputs: SplitInputs) => void;
  /** The whole water meter's cost from Tenant Due, or null if it can't be worked out yet. */
  tenantWater: number | null;
  onOpenTenant: () => void;
}

const WaterSplit: React.FC<Props> = ({ inputs, setInputs, tenantWater, onOpenTenant }) => {
  const set = (key: keyof SplitInputs) => (value: string) =>
    setInputs({ ...inputs, [key]: value });

  const charges = num(inputs.currentCharges);
  const fromTenant = inputs.rentSubmeterMode !== "manual";
  const submeter = fromTenant ? tenantWater : num(inputs.rentSubmeter) ?? 0;
  const first = num(inputs.firstFloor);
  const second = num(inputs.secondFloor);
  const net = charges !== null && submeter !== null ? charges - submeter : null;
  const people = first !== null && second !== null ? first + second : null;

  let message: string | null = null;
  if (charges === null) message = "Enter the current charges from the Maynilad bill.";
  else if (submeter === null) message = "Finish Tenant Due first so the rent submeter can be filled in.";
  else if (net !== null && net < 0) message = "The rent submeter is more than the current charges.";
  else if (people === null || people <= 0) message = "Enter how many people are on each floor.";

  const perHead = !message && net !== null && people ? net / people : null;

  return (
    <>
      <Field
        label="Current charges"
        value={inputs.currentCharges}
        onChange={set("currentCharges")}
        prefix="₱"
        placeholder="4,531.22"
        hint="The amount on this month's Maynilad bill."
      />
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="form-label mb-0">Rent submeter</span>
          <div className="btn-group btn-group-sm" role="group" aria-label="Rent submeter source">
            <button
              type="button"
              className={`btn ${fromTenant ? "btn-primary" : "btn-outline-primary"}`}
              aria-pressed={fromTenant}
              onClick={() => set("rentSubmeterMode")("tenant")}
            >
              From Tenant Due
            </button>
            <button
              type="button"
              className={`btn ${!fromTenant ? "btn-primary" : "btn-outline-primary"}`}
              aria-pressed={!fromTenant}
              onClick={() => set("rentSubmeterMode")("manual")}
            >
              Manual
            </button>
          </div>
        </div>
        <div className="input-group">
          <span className="input-group-text">₱</span>
          {fromTenant ? (
            <output className="form-control bg-body-tertiary">
              {tenantWater !== null ? tenantWater.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
            </output>
          ) : (
            <input
              type="text"
              inputMode="decimal"
              aria-label="Rent submeter amount"
              className="form-control"
              value={inputs.rentSubmeter}
              placeholder="500.50"
              onChange={(e) => set("rentSubmeter")(e.target.value)}
            />
          )}
        </div>
        <div className="form-text">
          {fromTenant ? (
            <>
              Water meter cost for all pax from{" "}
              <button type="button" className="btn btn-link p-0 align-baseline" onClick={onOpenTenant}>
                Tenant Due
              </button>
              ; taken off before splitting.
            </>
          ) : (
            "Paid by the tenant; taken off before splitting."
          )}
        </div>
      </div>
      <div className="row g-2">
        <div className="col-6">
          <Field
            label="1st floor"
            value={inputs.firstFloor}
            onChange={set("firstFloor")}
            suffix="people"
            inputMode="numeric"
          />
        </div>
        <div className="col-6">
          <Field
            label="2nd floor"
            value={inputs.secondFloor}
            onChange={set("secondFloor")}
            suffix="people"
            inputMode="numeric"
          />
        </div>
      </div>

      {perHead !== null && net !== null && first !== null && second !== null ? (
        <Summary
          items={[
            { label: "1st floor share", detail: `${qty(first)} × ${peso(perHead)}`, amount: perHead * first },
            { label: "2nd floor share", detail: `${qty(second)} × ${peso(perHead)}`, amount: perHead * second },
          ]}
          totalLabel="Per head"
          total={perHead}
        >
          <div className="summary-note">
            ({peso(charges ?? 0)} − {peso(submeter ?? 0)}) ÷ {qty(people ?? 0)} people ={" "}
            {qty(perHead, 4)}
          </div>
        </Summary>
      ) : (
        <EmptyState>{message}</EmptyState>
      )}
    </>
  );
};

export default WaterSplit;
