import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const WaterCalculator: React.FC = () => {
  const [currentCharges, setCurrentCharges] = useState("");
  const [rentSubmeter, setRentSubmeter] = useState("");
  const [firstFloorPeople, setFirstFloorPeople] = useState("3");
  const [secondFloorPeople, setSecondFloorPeople] = useState("5");
  const [perHeadCharge, setPerHeadCharge] = useState<number | null>(null);
  const [firstFloorShare, setFirstFloorShare] = useState<number | null>(null);
  const [secondFloorShare, setSecondFloorShare] = useState<number | null>(null);
  const [calculationDetails, setCalculationDetails] = useState<string>("");

  const calculateShares = () => {
    const charges = parseFloat(currentCharges);
    const submeter = parseFloat(rentSubmeter) || 0;
    const firstFloor = parseFloat(firstFloorPeople);
    const secondFloor = parseFloat(secondFloorPeople);

    if (isNaN(charges) || isNaN(firstFloor) || isNaN(secondFloor)) {
      alert("Please enter valid numbers");
      return;
    }

    const netCharges = charges - submeter;
    if (netCharges < 0) {
      alert("Net charges cannot be negative");
      return;
    }

    const totalPeople = firstFloor + secondFloor;
    if (totalPeople === 0) {
      alert("Total number of people cannot be zero");
      return;
    }

    const perHead = netCharges / totalPeople;
    const firstShare = perHead * firstFloor;
    const secondShare = perHead * secondFloor;

    setPerHeadCharge(perHead);
    setFirstFloorShare(firstShare);
    setSecondFloorShare(secondShare);

    const details = `${charges} - ${submeter} / ${totalPeople} = ${perHead.toFixed(4)}`;
    setCalculationDetails(details);
  };

  return (
    <div className="card p-4 shadow-sm w-100" style={{ maxWidth: "500px" }}>
      <h2 className="card-title text-center mb-4">Monthly Water Consumption</h2>
      <div className="mb-3">
        <label className="form-label">Current Charges:</label>
        <input
          type="text"
          value={currentCharges}
          onChange={(e) => setCurrentCharges(e.target.value)}
          className="form-control"
          placeholder="e.g. 4531.22"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Rent Submeter:</label>
        <input
          type="text"
          value={rentSubmeter}
          onChange={(e) => setRentSubmeter(e.target.value)}
          className="form-control"
          placeholder="e.g. 500.50"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">1st Floor No. of People:</label>
        <input
          type="text"
          value={firstFloorPeople}
          onChange={(e) => setFirstFloorPeople(e.target.value)}
          className="form-control"
          placeholder="e.g. 3"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">2nd Floor No. of People:</label>
        <input
          type="text"
          value={secondFloorPeople}
          onChange={(e) => setSecondFloorPeople(e.target.value)}
          className="form-control"
          placeholder="e.g. 5"
        />
      </div>
      <button onClick={calculateShares} className="btn btn-primary w-100">
        Calculate
      </button>
      {perHeadCharge !== null && (
        <div className="mt-4">
          <div className="mb-2">
            <span className="fw-bold">Calculation Details:</span> {calculationDetails}
          </div>
          <div className="mb-2">
            <span className="fw-bold">Per Head Charge:</span> {perHeadCharge.toFixed(4)}
          </div>
          <div className="mb-2">
            <span className="fw-bold">1st Floor Share:</span> {firstFloorShare!.toFixed(4)}
          </div>
          <div className="mb-2">
            <span className="fw-bold">2nd Floor Share:</span> {secondFloorShare!.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
};

const AnotherCalculator: React.FC = () => {
  const [roomReading, setRoomReading] = useState({ current: "", previous: "" });
  const [commonAreaReading, setCommonAreaReading] = useState({ current: "", previous: "" });
  const [waterReading, setWaterReading] = useState({ current: "", previous: "" });
  const [electricityRate, setElectricityRate] = useState("13.17");
  const [waterRate, setWaterRate] = useState("32.125");
  const [totalPax, setTotalPax] = useState("3");
  const [tenantPax, setTenantPax] = useState("2");
  const [internetCharge, setInternetCharge] = useState("250");
  const [totalDue, setTotalDue] = useState<number | null>(null);

  const calculateTotalDue = () => {
    const roomUsage = parseFloat(roomReading.current) - parseFloat(roomReading.previous);
    const commonAreaUsage = parseFloat(commonAreaReading.current) - parseFloat(commonAreaReading.previous);
    const waterUsage = parseFloat(waterReading.current) - parseFloat(waterReading.previous);
    const totalPeople = parseInt(totalPax);
    const tenantPeople = parseInt(tenantPax);

    if (
      isNaN(roomUsage) ||
      isNaN(commonAreaUsage) ||
      isNaN(waterUsage) ||
      isNaN(totalPeople) ||
      isNaN(tenantPeople)
    ) {
      alert("Please enter valid numbers");
      return;
    }

    if (roomUsage < 0 || commonAreaUsage < 0 || waterUsage < 0) {
      alert("Readings must not result in negative usage");
      return;
    }

    const roomElectricityCost = roomUsage * parseFloat(electricityRate);
    const commonAreaCost = (commonAreaUsage * parseFloat(electricityRate)) / totalPeople * tenantPeople;
    const waterCost = (waterUsage * parseFloat(waterRate)) / totalPeople * tenantPeople;
    const internetCost = tenantPeople * parseFloat(internetCharge);

    const totalAmountDue = roomElectricityCost + commonAreaCost + waterCost + internetCost;

    setTotalDue(totalAmountDue);
  };

  return (
    <div className="card p-4 shadow-sm w-100" style={{ maxWidth: "500px" }}>
      <h2 className="card-title text-center mb-4">Monthly Tenant Due</h2>
      <div className="mb-3">
        <label className="form-label">Room Electricity Submeter:</label>
        <input
          type="text"
          value={roomReading.current}
          onChange={(e) => setRoomReading({ ...roomReading, current: e.target.value })}
          className="form-control mb-2"
          placeholder="Current Reading"
        />
        <input
          type="text"
          value={roomReading.previous}
          onChange={(e) => setRoomReading({ ...roomReading, previous: e.target.value })}
          className="form-control"
          placeholder="Previous Reading"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Common Area Electricity Submeter:</label>
        <input
          type="text"
          value={commonAreaReading.current}
          onChange={(e) => setCommonAreaReading({ ...commonAreaReading, current: e.target.value })}
          className="form-control mb-2"
          placeholder="Current Reading"
        />
        <input
          type="text"
          value={commonAreaReading.previous}
          onChange={(e) => setCommonAreaReading({ ...commonAreaReading, previous: e.target.value })}
          className="form-control"
          placeholder="Previous Reading"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Water Meter:</label>
        <input
          type="text"
          value={waterReading.current}
          onChange={(e) => setWaterReading({ ...waterReading, current: e.target.value })}
          className="form-control mb-2"
          placeholder="Current Reading"
        />
        <input
          type="text"
          value={waterReading.previous}
          onChange={(e) => setWaterReading({ ...waterReading, previous: e.target.value })}
          className="form-control"
          placeholder="Previous Reading"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Electricity Rate (per kWh):</label>
        <input
          type="text"
          value={electricityRate}
          onChange={(e) => setElectricityRate(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Water Rate (per cu.m):</label>
        <input
          type="text"
          value={waterRate}
          onChange={(e) => setWaterRate(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Total Pax:</label>
        <input
          type="text"
          value={totalPax}
          onChange={(e) => setTotalPax(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Tenant Pax:</label>
        <input
          type="text"
          value={tenantPax}
          onChange={(e) => setTenantPax(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Internet Charge per Head:</label>
        <input
          type="text"
          value={internetCharge}
          onChange={(e) => setInternetCharge(e.target.value)}
          className="form-control"
        />
      </div>
      <button onClick={calculateTotalDue} className="btn btn-primary w-100">
        Calculate Total Due
      </button>
      {totalDue !== null && (
        <div className="mt-4">
          <div className="mb-2">
            <span className="fw-bold">Total Amount Due:</span> {totalDue.toFixed(2)} PHP
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("water");

  return (
    <div className="d-flex flex-column align-items-center bg-light min-vh-100 py-4">
      <div className="mb-3">
        <button
          className={`btn ${activeTab === "water" ? "btn-primary" : "btn-outline-primary"} me-2`}
          onClick={() => setActiveTab("water")}
        >
          Water Calculator
        </button>
        <button
          className={`btn ${activeTab === "another" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("another")}
        >
          Tenant Due Calculator
        </button>
      </div>
      {activeTab === "water" ? <WaterCalculator /> : <AnotherCalculator />}
    </div>
  );
};

export default App;
