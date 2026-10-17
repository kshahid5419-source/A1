import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "medigo_medicines_v1";

const demoMedicines = [
  {
    id: 1,
    name: "Vitamin D",
    dose: "1 tablet",
    time: "09:00",
    taken: false,
  },
  {
    id: 2,
    name: "Sample medication",
    dose: "As prescribed",
    time: "14:00",
    taken: false,
  },
];

function loadMedicines() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error(error);
  }

  return demoMedicines;
}

function App() {
  const [medicines, setMedicines] = useState(loadMedicines);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState("09:00");

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(medicines)
      );
    } catch (error) {
      console.error(error);
    }
  }, [medicines]);

  function addMedicine(event) {
    event.preventDefault();

    if (!name.trim() || !dose.trim() || !time) {
      return;
    }

    const newMedicine = {
      id: Date.now(),
      name: name.trim(),
      dose: dose.trim(),
      time: time,
      taken: false,
    };

    setMedicines((previous) =>
      [...previous, newMedicine].sort((a, b) =>
        a.time.localeCompare(b.time)
      )
    );

    setName("");
    setDose("");
    setTime("09:00");
  }

  function toggleTaken(id) {
    setMedicines((previous) =>
      previous.map((medicine) =>
        medicine.id === id
          ? { ...medicine, taken: !medicine.taken }
          : medicine
      )
    );
  }

  function deleteMedicine(id) {
    setMedicines((previous) =>
      previous.filter((medicine) => medicine.id !== id)
    );
  }

  function formatTime(value) {
    if (!value) return "";

    const parts = value.split(":");
    const hour = Number(parts[0]);
    const minutes = parts[1];
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} `;
  }

  const total = medicines.length;
  const takenCount = medicines.filter(
    (medicine) => medicine.taken
  ).length;
  const remaining = total - takenCount;

  const hourNow = new Date().getHours();
  let greeting = "Good evening";

  if (hourNow < 12) {
    greeting = "Good morning";
  } else if (hourNow < 18) {
    greeting = "Good afternoon";
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✚</div>
          <div>
            <h2>MediGo</h2>
            <p>Your health companion</p>
          </div>
        </div>

        <nav className="navigation">
          <a href="#dashboard" className="nav-link active">
            <span>⌂</span> Dashboard
          </a>
          <a href="#medications" className="nav-link">
            <span>♡</span> My Medications
          </a>
          <a href="#add-medication" className="nav-link">
            <span>＋</span> Add Medication
          </a>
        </nav>

        <div className="sidebar-note">
          <span className="note-icon">🌱</span>
          <h3>One day at a time</h3>
          <p>
            Small steps toward better health are worth celebrating.
          </p>
        </div>

        <p className="sidebar-footer">Made with care ♡</p>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR PERSONAL HEALTH SPACE</p>
            <h1>My Dashboard</h1>
          </div>
          <div className="profile-circle">M</div>
        </header>

        <section className="welcome-card">
          <div className="welcome-text">
            <p className="welcome-label">A LITTLE CHECK-IN</p>
            <h2>{greeting}, take care of yourself 💚</h2>
            <p>
              Every little step counts. Keep track of your medications
              and give yourself credit for showing up for your health.
            </p>
            <a href="#medications" className="welcome-button">
              View my medications →
            </a>
          </div>

          <div className="welcome-art" aria-hidden="true">
            <div className="art-circle">
              <span>✚</span>
              <span className="art-heart">♥️</span>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon green">♡</div>
            <p>Total medications</p>
            <h2>{total}</h2>
            <span>In your list</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">✓</div>
            <p>Marked as taken</p>
            <h2>{takenCount}</h2>
            <span>You've checked off</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon peach">◷</div>
            <p>Still remaining</p>
            <h2>{remaining}</h2>
            <span>Not marked as taken</span>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel medication-panel" id="medications">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">YOUR DAILY ROUTINE</p>
                <h2>My medications</h2>
              </div>
              <span className="count-pill">{total} total</span>
            </div>

            {medicines.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">♡</div>
                <h3>Your list starts here</h3>
                <p>
                  Add a medication using the form to keep your list
                  organized.
                </p>
              </div>
            ) : (
              <div className="medicine-list">
                {[...medicines]
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((medicine) => (
                    <div
                      className={`medicine-item ${
                        medicine.taken ? "medicine-taken" : ""
                      }`}
                      key={medicine.id}
                    >
                      <div className="medicine-icon">✚</div>

                      <div className="medicine-details">
                        <h3>{medicine.name}</h3>
                        <p>{medicine.dose}</p>
                        <span className="medicine-time">
                          ◷ {formatTime(medicine.time)}
                        </span>
                      </div>

                      <div className="medicine-actions">
                        <button
                          type="button"
                          className={
                            medicine.taken
                              ? "taken-button"
                              : "mark-button"
                          }
                          onClick={() => toggleTaken(medicine.id)}
                        >
                          {medicine.taken ? "✓ Taken" : "Mark taken"}
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteMedicine(medicine.id)}
                          aria-label={`Delete ${medicine.name}`}
                          title="Delete medication"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <p className="support-message">
              🌿 Remember, you're doing your best. Keep going!
            </p>
          </div>

          <div className="panel add-panel" id="add-medication">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">BUILD YOUR ROUTINE</p>
                <h2>Add medication</h2>
              </div>
              <div className="add-icon">＋</div>
            </div>

            <form onSubmit={addMedicine} className="medicine-form">
              <label htmlFor="medicine-name">Medication name</label>
              <input
                id="medicine-name"
                type="text"
                placeholder="e.g. Vitamin D"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />

              <label htmlFor="medicine-dose">Dose instructions</label>
              <input
                id="medicine-dose"
                type="text"
                placeholder="e.g. 1 tablet"
                value={dose}
                onChange={(event) => setDose(event.target.value)}
                required
              />

              <label htmlFor="medicine-time">Medication time</label>
              <input
                id="medicine-time"
                type="time"
                step={60}
                value={time}
                onChange={(event) => setTime(event.target.value)}
                required
              />

              <p className="form-hint">
                Choose the time specified in your medication instructions.
              </p>

              <button type="submit" className="submit-button">
                + Add medication
              </button>
            </form>

            <div className="privacy-note">
              <span>🔒</span>
              <p>Your list is saved in this browser on this device.</p>
            </div>
          </div>
        </section>

        <footer className="page-footer">
          <p>MediGo · A little care goes a long way 💚</p>
        </footer>
      </main>
    </div>
  );
}

export default App;