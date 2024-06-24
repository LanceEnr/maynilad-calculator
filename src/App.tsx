import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const App: React.FC = () => {
  const [currentCharges, setCurrentCharges] = useState("");
  const [numPeople, setNumPeople] = useState("");
  const [firstFloorPeople, setFirstFloorPeople] = useState("3");
  const [secondFloorPeople, setSecondFloorPeople] = useState("5");
  const [perHeadCharge, setPerHeadCharge] = useState<number | null>(null);
  const [firstFloorShare, setFirstFloorShare] = useState<number | null>(null);
  const [secondFloorShare, setSecondFloorShare] = useState<number | null>(null);

  const calculateShares = () => {
    const charges = parseFloat(currentCharges);
    const num = parseInt(numPeople);
    const firstFloor = parseInt(firstFloorPeople);
    const secondFloor = parseInt(secondFloorPeople);

    if (
      isNaN(charges) ||
      isNaN(num) ||
      isNaN(firstFloor) ||
      isNaN(secondFloor)
    ) {
      alert("Please enter valid numbers");
      return;
    }

    const perHead = charges / num;
    const firstShare = perHead * firstFloor;
    const secondShare = perHead * secondFloor;

    setPerHeadCharge(perHead);
    setFirstFloorShare(firstShare);
    setSecondFloorShare(secondShare);
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-light">
      <div
        className="card p-4 justify-content-center shadow-sm w-100"
        style={{ maxWidth: "500px" }}
      >
        <h2 className="card-title text-center mb-4">
          Monthly Water Consumption
        </h2>
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
          <label className="form-label">Number of People:</label>
          <input
            type="text"
            value={numPeople}
            onChange={(e) => setNumPeople(e.target.value)}
            className="form-control"
            placeholder="e.g. 8"
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
              <span className="fw-bold">Per Head Charge:</span>{" "}
              {perHeadCharge.toFixed(4)}
            </div>
            <div className="mb-2">
              <span className="fw-bold">1st Floor Share:</span>{" "}
              {firstFloorShare!.toFixed(4)}
            </div>
            <div className="mb-2">
              <span className="fw-bold">2nd Floor Share:</span>{" "}
              {secondFloorShare!.toFixed(4)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
