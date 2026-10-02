import { useState } from "react";
import api from "../api/client";

const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CLASS_OPTIONS = ["SL", "3AC", "2AC"];

const parseCsv = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function AdminAddTrain({ user }) {
  const [form, setForm] = useState({
    name: "",
    number: "",
    source: "",
    destination: "",
    stations: "",
    runsOn: "",
    classes: "",
    totalSeats: "",
    availableSeats: "",
  });
  const [message, setMessage] = useState("");

  const isAdmin = user?.role === "admin";

  const toggleCsvValue = (fieldName, optionValue) => {
    const currentValues = parseCsv(form[fieldName]);
    const exists = currentValues.includes(optionValue);
    const nextValues = exists
      ? currentValues.filter((value) => value !== optionValue)
      : [...currentValues, optionValue];

    setForm({
      ...form,
      [fieldName]: nextValues.join(","),
    });
  };

  const isChecked = (fieldName, optionValue) =>
    parseCsv(form[fieldName]).includes(optionValue);

  const setCsvValues = (fieldName, values) => {
    setForm({
      ...form,
      [fieldName]: values.join(","),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!isAdmin) {
      setMessage("Login as admin to add trains");
      return;
    }

    try {
      const payload = {
        role: user.role,
        name: form.name,
        number: form.number,
        source: form.source,
        destination: form.destination,
        stations: parseCsv(form.stations),
        runsOn: parseCsv(form.runsOn),
        classes: parseCsv(form.classes),
        totalSeats: Number(form.totalSeats),
        availableSeats: Number(form.availableSeats),
      };

      const response = await api.post("/api/trains", payload);
      setMessage(response.data.message || "Train added");
      setForm({
        name: "",
        number: "",
        source: "",
        destination: "",
        stations: "",
        runsOn: "",
        classes: "",
        totalSeats: "",
        availableSeats: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add train");
    }
  };

  if (!isAdmin) {
    return (
      <div>
        <h2 className="section-title">Admin Add Train</h2>
        <div className="message">
          This page is admin-only. Login with an admin account to add trains.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title">Admin Add Train</h2>
      <p className="muted">Current role: {user?.role || "Not logged in"}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Train Name</span>
            <input
              required
              placeholder="Example: Rajdhani Express"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label className="input-group">
            <span>Train Number</span>
            <input
              required
              placeholder="Example: 12951"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
            />
          </label>

          <label className="input-group">
            <span>Source</span>
            <input
              required
              placeholder="Example: Mumbai"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />
          </label>

          <label className="input-group">
            <span>Destination</span>
            <input
              required
              placeholder="Example: Delhi"
              value={form.destination}
              onChange={(e) =>
                setForm({ ...form, destination: e.target.value })
              }
            />
          </label>

          <label className="input-group">
            <span>Stations CSV</span>
            <input
              placeholder="Mumbai,Surat,Vadodara,Delhi"
              value={form.stations}
              onChange={(e) => setForm({ ...form, stations: e.target.value })}
            />
          </label>

          <label className="input-group">
            <span>Runs On (multi-select)</span>
            <div className="checkbox-grid">
              {DAY_OPTIONS.map((dayOption) => (
                <label className="checkbox-item" key={dayOption}>
                  <input
                    type="checkbox"
                    checked={isChecked("runsOn", dayOption)}
                    onChange={() => toggleCsvValue("runsOn", dayOption)}
                  />
                  <span>{dayOption}</span>
                </label>
              ))}
            </div>
            <div className="checkbox-actions">
              <button
                type="button"
                className="chip-action-btn"
                onClick={() => setCsvValues("runsOn", DAY_OPTIONS)}
              >
                Select All Days
              </button>
              <button
                type="button"
                className="chip-action-btn"
                onClick={() => setCsvValues("runsOn", [])}
              >
                Clear
              </button>
            </div>
            <small className="input-help">
              Selected: {form.runsOn || "none"}
            </small>
          </label>

          <label className="input-group">
            <span>Classes (multi-select)</span>
            <div className="checkbox-grid">
              {CLASS_OPTIONS.map((classOption) => (
                <label className="checkbox-item" key={classOption}>
                  <input
                    type="checkbox"
                    checked={isChecked("classes", classOption)}
                    onChange={() => toggleCsvValue("classes", classOption)}
                  />
                  <span>{classOption}</span>
                </label>
              ))}
            </div>
            <div className="checkbox-actions">
              <button
                type="button"
                className="chip-action-btn"
                onClick={() => setCsvValues("classes", CLASS_OPTIONS)}
              >
                Select All Classes
              </button>
              <button
                type="button"
                className="chip-action-btn"
                onClick={() => setCsvValues("classes", [])}
              >
                Clear
              </button>
            </div>
            <small className="input-help">
              Selected: {form.classes || "none"}
            </small>
          </label>

          <label className="input-group">
            <span>Total Seats</span>
            <input
              required
              type="number"
              min="0"
              placeholder="100"
              value={form.totalSeats}
              onChange={(e) => setForm({ ...form, totalSeats: e.target.value })}
            />
          </label>

          <label className="input-group">
            <span>Available Seats</span>
            <input
              required
              type="number"
              min="0"
              placeholder="100"
              value={form.availableSeats}
              onChange={(e) =>
                setForm({ ...form, availableSeats: e.target.value })
              }
            />
            <small className="input-help">
              Keep this less than or equal to total seats.
            </small>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit">Add Train</button>
        </div>
      </form>

      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default AdminAddTrain;
