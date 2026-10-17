import { useState, useEffect } from "react";
import "./App.css";

const HEAT_SENSITIVE_MEDS = [
  "insulin",
  "amoxicillin",
  "augmentin",
  "eye drops",
  "thyroxine",
  "levothyroxine"
];

const INTERACTION_PAIRS = [
  {
    meds: ["aspirin", "warfarin"],
    warning:
      "High Bleeding Risk: Taking Aspirin and Warfarin together increases internal bleeding risk. Consult a doctor immediately."
  },
  {
    meds: ["ibuprofen", "lisinopril"],
    warning:
      "Kidney & Blood Pressure Alert: Ibuprofen can reduce the effectiveness of Lisinopril and strain the kidneys."
  },
  {
    meds: ["calcium", "levothyroxine"],
    warning:
      "Absorption Clash: Calcium blocks Levothyroxine from working properly. Space these doses at least 4 hours apart."
  }
];

export default function App() {
  const [medicines, setMedicines] = useState(() => {
    const saved = localStorage.getItem("medtrack_data");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        name: "Lisinopril",
        dosage: "10mg • Morning with water",
        time: "08:00",
        taken: true
      },
      {
        id: 2,
        name: "Insulin Glargine",
        dosage: "15 Units • Subcutaneous",
        time: "13:00",
        taken: false
      },
      {
        id: 3,
        name: "Aspirin",
        dosage: "75mg • After dinner",
        time: "20:00",
        taken: false
      }
    ];
  });

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("09:00");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showDoctorReport, setShowDoctorReport] = useState(false);
  const [localTemp, setLocalTemp] = useState(34);

  useEffect(() => {
    localStorage.setItem("medtrack_data", JSON.stringify(medicines));
  }, [medicines]);

  const totalMeds = medicines.length;
  const takenCount = medicines.filter((m) => m.taken).length;
  const adherenceRate =
    totalMeds === 0 ? 0 : Math.round((takenCount / totalMeds) * 100);

  const activeWarnings = INTERACTION_PAIRS.filter((pair) =>
    pair.meds.every((medKeyword) =>
      medicines.some((m) => m.name.toLowerCase().includes(medKeyword))
    )
  );

  const isHeatSensitive = (medName) =>
    HEAT_SENSITIVE_MEDS.some((keyword) =>
      medName.toLowerCase().includes(keyword)
    );

  const heatAtRiskMeds = medicines.filter((m) => isHeatSensitive(m.name));

  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    const newMed = {
      id: Date.now(),
      name: name.trim(),
      dosage: dosage.trim(),
      time: time || "09:00",
      taken: false
    };

    setMedicines([...medicines, newMed]);
    setName("");
    setDosage("");
    setTime("09:00");
  };

  const toggleTaken = (id) => {
    setMedicines(
      medicines.map((med) =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  const deleteMedicine = (id) => {
    setMedicines(medicines.filter((med) => med.id !== id));
  };

  const speakMedicine = (med) => {
    if (!("speechSynthesis" in window)) {
      alert("Voice reading is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const statusText = med.taken
      ? "Already taken today."
      : "Scheduled dose pending.";
    const heatText = isHeatSensitive(med.name)
      ? "Warning: Store in a cool place below 25 degrees Celsius."
      : "";
    const utterance = new SpeechSynthesisUtterance(
      `Medicine: ${med.name}. Dosage: ${med.dosage}. Time: ${med.time}. ${statusText} ${heatText}`
    );
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const loadDemoInteraction = () => {
    const hasWarfarin = medicines.some((m) =>
      m.name.toLowerCase().includes("warfarin")
    );
    if (!hasWarfarin) {
      setMedicines([
        ...medicines,
        {
          id: Date.now(),
          name: "Warfarin",
          dosage: "5mg • Evening dose",
          time: "21:00",
          taken: false
        }
      ]);
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✚</div>
          <div>
            <h2>MedTrack</h2>
            <p>Smart Care Companion</p>
          </div>
        </div>

        <nav className="navigation">
          <a
            href="#dashboard"
            className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span>🌿</span> Daily Schedule
          </a>
          <a
            href="#safety"
            className={`nav-link ${activeTab === "safety" ? "active" : ""}`}
            onClick={() => setActiveTab("safety")}
          >
            <span>🛡️</span> Safety & Climate (
            {activeWarnings.length + (heatAtRiskMeds.length > 0 ? 1 : 0)})
          </a>
          <a
            href="#report"
            className={`nav-link ${showDoctorReport ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setShowDoctorReport(!showDoctorReport);
            }}
          >
            <span>📋</span> Doctor Triage Card
          </a>
        </nav>

        <div className="sidebar-note">
          <div className="note-icon">🌡️</div>
          <h3>Climate Storage Watch</h3>
          <p>
            Local temp: <strong>{localTemp}°C</strong>.{" "}
            {heatAtRiskMeds.length > 0
              ? `${heatAtRiskMeds.length} medicine(s) require cool storage today.`
              : "All medicines safe at room temperature."}
          </p>
        </div>

        <p className="sidebar-footer">Offline-First • 100% Private</p>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">INTERNATIONAL HEALTHCARE HACKATHON EDITION</p>
            <h1>Your Daily Wellness</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="temp-control" title="Simulate Weather for Judges">
              🌡️ {localTemp}°C
              <button
                type="button"
                onClick={() => setLocalTemp(localTemp === 34 ? 22 : 34)}
                style={{
                  border: "none",
                  background: "#e5eee4",
                  borderRadius: "6px",
                  padding: "3px 7px",
                  fontSize: "10px",
                  fontWeight: "700"
                }}
              >
                {localTemp >= 30 ? "Cool Down" : "Simulate Heatwave"}
              </button>
            </div>
            <div className="profile-circle">SK</div>
          </div>
        </header>

        <section className="welcome-card">
          <div className="welcome-text">
            <p className="welcome-label">INTELLIGENT ADHERENCE & SAFETY</p>
            <h2>Stay consistent, stay protected.</h2>
            <p>
              MedTrack actively scans for dangerous drug interactions, protects
              heat-sensitive medicines during warm weather, and reads
              instructions aloud for elderly and low-vision patients.
            </p>
            <div className="action-bar">
              <a href="#add-form" className="welcome-button">
                + Add Medication
              </a>
              <button
                type="button"
                className="welcome-button secondary"
                onClick={loadDemoInteraction}
              >
                ⚡ Simulate Drug Clash (Judge Demo)
              </button>
              <button
                type="button"
                className="welcome-button secondary"
                onClick={() => setShowDoctorReport(!showDoctorReport)}
              >
                🩺 {showDoctorReport ? "Hide" : "View"} 10-Sec Doctor Report
              </button>
            </div>
          </div>

          <div className="welcome-art">
            <div className="art-circle">
              💊
              <span className="art-heart">💚</span>
            </div>
          </div>
        </section>

        <div id="safety">
          {activeWarnings.map((item, idx) => (
            <div key={idx} className="alert-banner">
              <span>⚠️</span>
              <div>
                <h4>Drug Interaction Detected</h4>
                <p>{item.warning}</p>
              </div>
            </div>
          ))}

          {localTemp >= 30 && heatAtRiskMeds.length > 0 && (
            <div className="alert-banner climate">
              <span>☀️</span>
              <div>
                <h4>Heatwave Potency Alert ({localTemp}°C Outdoors)</h4>
                <p>
                  <strong>
                    {heatAtRiskMeds.map((m) => m.name).join(", ")}
                  </strong>{" "}
                  can lose effectiveness above 25°C. Store in a refrigerator or
                  cool shaded container immediately.
                </p>
              </div>
            </div>
          )}
        </div>

        {showDoctorReport && (
          <div className="doctor-report">
            <h3>🩺 Clinical Triage Snapshot (10-Second Doctor Summary)</h3>
            <p
              style={{
                fontSize: "13px",
                color: "#526159",
                lineHeight: "1.6",
                margin: 0
              }}
            >
              <strong>Adherence Score:</strong> {adherenceRate}% ({takenCount}{" "}
              of {totalMeds} doses completed today) <br />
              <strong>Active Prescriptions:</strong>{" "}
              {medicines
                .map((m) => `${m.name} (${m.dosage} at ${m.time})`)
                .join(" | ") || "None"}{" "}
              <br />
              <strong>Safety Status:</strong>{" "}
              {activeWarnings.length > 0
                ? `${activeWarnings.length} potential drug clash(es) flagged for review.`
                : "No drug-to-drug interactions detected."}
            </p>
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <p>Completed Doses</p>
            <h2>
              {takenCount} / {totalMeds}
            </h2>
            <span>
              {takenCount === totalMeds && totalMeds > 0
                ? "All done for today!"
                : "Keep going steadily"}
            </span>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">📊</div>
            <p>Adherence Score</p>
            <h2>{adherenceRate}%</h2>
            <span>
              {adherenceRate >= 80
                ? "Optimal clinical range"
                : "Caregiver backup active"}
            </span>
          </div>

          <div className="stat-card">
            <div className="stat-icon peach">🛡️</div>
            <p>Safety & Storage Checks</p>
            <h2>
              {activeWarnings.length === 0
                ? "Clear"
                : `${activeWarnings.length} Alert`}
            </h2>
            <span>{heatAtRiskMeds.length} heat-sensitive item(s)</span>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">TODAY&apos;S TIMELINE</p>
                <h2>Medication Schedule</h2>
              </div>
              <span className="count-pill">{totalMeds} Prescriptions</span>
            </div>

            {medicines.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🌿</div>
                <h3>Your schedule is clear</h3>
                <p>
                  Add your first medicine on the right to start smart tracking.
                </p>
              </div>
            ) : (
              <div className="medicine-list">
                {medicines.map((med) => (
                  <div
                    key={med.id}
                    className={`medicine-item ${
                      med.taken ? "medicine-taken" : ""
                    }`}
                  >
                    <div className="medicine-icon">
                      {med.taken ? "✓" : "💊"}
                    </div>

                    <div className="medicine-details">
                      <h3>{med.name}</h3>
                      <p>{med.dosage}</p>
                      <span className="medicine-time">
                        ⏰ Scheduled for {med.time}
                      </span>

                      <div className="badge-row">
                        {isHeatSensitive(med.name) && (
                          <span className="safety-badge heat">
                            ❄️ Cool Storage Required (&lt;25°C)
                          </span>
                        )}
                        <span className="safety-badge food">
                          🔊 Voice Enabled
                        </span>
                      </div>
                    </div>

                    <div className="medicine-actions">
                      <button
                        type="button"
                        className="voice-button"
                        onClick={() => speakMedicine(med)}
                        title="Read instructions aloud"
                      >
                        🔊
                      </button>

                      <button
                        type="button"
                        className={med.taken ? "taken-button" : "mark-button"}
                        onClick={() => toggleTaken(med.id)}
                      >
                        {med.taken ? "✓ Taken" : "Mark Taken"}
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => deleteMedicine(med.id)}
                        title="Remove medication"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="support-message">
              💡 Tip: Click the 🔊 speaker icon on any medicine to hear
              instructions read aloud.
            </div>
          </div>

          <div className="panel" id="add-form">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">NEW ENTRY</p>
                <h2>Add Medication</h2>
              </div>
              <div className="add-icon">+</div>
            </div>

            <form className="medicine-form" onSubmit={handleAddMedicine}>
              <label htmlFor="med-name">Medicine Name</label>
              <input
                id="med-name"
                type="text"
                placeholder="e.g., Amoxicillin, Warfarin, Insulin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label htmlFor="med-dosage">Dosage & Instructions</label>
              <input
                id="med-dosage"
                type="text"
                placeholder="e.g., 500mg • 1 tablet after meal"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                required
              />

              <label htmlFor="med-time">Reminder Time</label>
              <input
                id="med-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
              <p className="form-hint">
                Our safety engine automatically checks for drug clashes and
                heat-storage needs as soon as you add a medicine.
              </p>

              <button type="submit" className="submit-button">
                Save to Daily Schedule
              </button>

              <div className="privacy-note">
                <span>🔒</span>
                <p>
                  Stored locally on your device for offline reliability and
                  complete medical privacy.
                </p>
              </div>
            </form>
          </div>
        </section>

        <footer className="page-footer">
          MedTrack • Built for Global Healthcare Accessibility & Climate
          Resilience
        </footer>
      </main>
    </div>
  );
}
