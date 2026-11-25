import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import MayniladBill, { type BillTarget } from "./MayniladBill";
import TenantDue, { DEFAULT_TENANT } from "./TenantDue";
import WaterSplit, { DEFAULT_SPLIT } from "./WaterSplit";
import { DEFAULT_SETTINGS, normalizeSettings } from "./maynilad";
import { stringFields, useStoredState } from "./shared";

type Tab = "tenant" | "split" | "maynilad";

const TABS: { key: Tab; label: string; title: string; subtitle: string }[] = [
  { key: "tenant", label: "Tenant Due", title: "Monthly tenant due", subtitle: "Electricity, water and internet for the tenant." },
  { key: "split", label: "Water Split", title: "Water bill split", subtitle: "Share the Maynilad bill per head between floors." },
  { key: "maynilad", label: "Maynilad Bill", title: "Maynilad bill", subtitle: "Estimate a bill without visiting Maynilad's site." },
];

const App: React.FC = () => {
  const [tab, setTab] = useStoredState<Tab>("rental.tab", "tenant", (raw) =>
    TABS.some((t) => t.key === raw) ? (raw as Tab) : "tenant",
  );
  const [settings, setSettings] = useStoredState("maynilad-bill-settings", DEFAULT_SETTINGS, normalizeSettings);
  const [tenant, setTenant] = useStoredState("rental.tenant", DEFAULT_TENANT, stringFields(DEFAULT_TENANT));
  const [split, setSplit] = useStoredState("rental.split", DEFAULT_SPLIT, stringFields(DEFAULT_SPLIT));
  const [consumption, setConsumption] = useState("");

  const handleMayniladTotal = (target: BillTarget, amount: string) => {
    setSplit({ ...split, [target]: amount });
    setTab("split");
  };

  const active = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <div className="app">
      <nav className="tabs" aria-label="Calculators">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`tab ${tab === t.key ? "active" : ""}`}
            aria-current={tab === t.key ? "page" : undefined}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="panel">
        <header className="mb-4">
          <h1 className="panel-title">{active.title}</h1>
          <p className="panel-subtitle">{active.subtitle}</p>
        </header>
        {tab === "tenant" && (
          <TenantDue
            inputs={tenant}
            setInputs={setTenant}
            mayniladSettings={settings}
            onEditMaynilad={() => setTab("maynilad")}
          />
        )}
        {tab === "split" && <WaterSplit inputs={split} setInputs={setSplit} />}
        {tab === "maynilad" && (
          <MayniladBill
            settings={settings}
            setSettings={setSettings}
            consumption={consumption}
            setConsumption={setConsumption}
            onUseTotal={handleMayniladTotal}
          />
        )}
      </main>

      <p className="fine-print text-center">Entries are saved on this device.</p>
    </div>
  );
};

export default App;
