import React from "react";
import { EmptyState, Field, Summary, num, peso, qty } from "./shared";

export interface SplitInputs extends Record<string, string> {
  currentCharges: string;
  rentSubmeter: string;
  firstFloor: string;
  secondFloor: string;
}

export const DEFAULT_SPLIT: SplitInputs = {
  currentCharges: "",
  rentSubmeter: "",
  firstFloor: "3",
  secondFloor: "5",
};

interface Props {
  inputs: SplitInputs;
  setInputs: (inputs: SplitInputs) => void;
}

const WaterSplit: React.FC<Props> = ({ inputs, setInputs }) => {
  const set = (key: keyof SplitInputs) => (value: string) =>
    setInputs({ ...inputs, [key]: value });

  const charges = num(inputs.currentCharges);
  const submeter = num(inputs.rentSubmeter) ?? 0;
  const first = num(inputs.firstFloor);
  const second = num(inputs.secondFloor);
  const net = charges !== null ? charges - submeter : null;
  const people = first !== null && second !== null ? first + second : null;

  let message: string | null = null;
  if (charges === null) message = "Enter the current charges from the Maynilad bill.";
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
      <Field
        label="Rent submeter"
        value={inputs.rentSubmeter}
        onChange={set("rentSubmeter")}
        prefix="₱"
        placeholder="500.50"
        hint="Paid by the tenant; taken off before splitting."
      />
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
            ({peso(charges ?? 0)} − {peso(submeter)}) ÷ {qty(people ?? 0)} people ={" "}
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
