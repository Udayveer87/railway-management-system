import { useState } from "react";
import api from "../api/client";

const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CLASS_OPTIONS = ["SL", "3AC", "2AC"];

const parseCsv = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function SearchTrains({ user }) {
  const [filters, setFilters] = useState({
    source: "",
    destination: "",
    station: "",
    day: "",
    class: "",
    excludeClass: "",
    allClasses: "",
    minSeats: "",
    maxSeats: "",
  });
  const [trains, setTrains] = useState([]);
  const [message, setMessage] = useState("");

  const toggleCsvValue = (fieldName, optionValue) => {
    const currentValues = parseCsv(filters[fieldName]);
    const exists = currentValues.includes(optionValue);
    const nextValues = exists
      ? currentValues.filter((value) => value !== optionValue)
      : [...currentValues, optionValue];

    setFilters({
      ...filters,
      [fieldName]: nextValues.join(","),
    });
  };

  const isChecked = (fieldName, optionValue) =>
    parseCsv(filters[fieldName]).includes(optionValue);

  const setCsvValues = (fieldName, values) => {
    setFilters({
      ...filters,
      [fieldName]: values.join(","),
    });
  };

  const clearFilters = () => {
    setFilters({
      source: "",
      destination: "",
      station: "",
      day: "",
      class: "",
      excludeClass: "",
      allClasses: "",
      minSeats: "",
      maxSeats: "",
    });
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setMessage("");

    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== ""),
    );

    try {
      const response = await api.get("/api/trains", { params });
      setTrains(response.data.trains || []);
      setMessage(`Found ${response.data.count || 0} train(s)`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to fetch trains");
      setTrains([]);
    }
  };

  if (!user?._id) {
    return (
      <div>
        <h2 className="section-title">Search Trains</h2>
        <div className="message">Please login first to search trains.</div>
      </div>
    );
  }

  if (user.role !== "user") {
    return (
      <div>
        <h2 className="section-title">Search Trains</h2>
        <div className="message">
          Train search is available in user mode. Login with a user account to
          use this section.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title">Search Trains</h2>
      <p className="muted">
        Use only the filters you need. Source + Destination is the most common
        search.
      </p>

      <form onSubmit={handleSearch}>
        <div className="form-grid">
          <label className="input-group">
            <span>Source</span>
            <input
              placeholder="Example: Mumbai"
              value={filters.source}
              onChange={(e) =>
                setFilters({ ...filters, source: e.target.value })
              }
            />
          </label>

          <label className="input-group">
            <span>Destination</span>
            <input
              placeholder="Example: Delhi"
              value={filters.destination}
              onChange={(e) =>
                setFilters({ ...filters, destination: e.target.value })
              }
            />
          </label>

          <label className="input-group">
            <span>Station</span>
            <input
              placeholder="Example: Surat"
              value={filters.station}
              onChange={(e) =>
                setFilters({ ...filters, station: e.target.value })
              }
            />
          </label>

          <label className="input-group">
            <span>Day (multi-select)</span>
            <div className="checkbox-grid">
              {DAY_OPTIONS.map((dayOption) => (
                <label className="checkbox-item" key={dayOption}>
                  <input
                    type="checkbox"
                    checked={isChecked("day", dayOption)}
                    onChange={() => toggleCsvValue("day", dayOption)}
                  />
                  <span>{dayOption}</span>
                </label>
              ))}
            </div>
            <div className="checkbox-actions">
              <button
                type="button"
                className="chip-action-btn"
                onClick={() => setCsvValues("day", DAY_OPTIONS)}
              >
                Select All Days
              </button>
              <button
                type="button"
                className="chip-action-btn"
                onClick={() => setCsvValues("day", [])}
              >
                Clear
              </button>
            </div>
            <small className="input-help">
              Matches trains running on any selected day.
            </small>
          </label>

          <label className="input-group">
            <span>Class Include (multi-select)</span>
            <div className="checkbox-grid">
              {CLASS_OPTIONS.map((classOption) => (
                <label className="checkbox-item" key={`include-${classOption}`}>
                  <input
                    type="checkbox"
                    checked={isChecked("class", classOption)}
                    onChange={() => toggleCsvValue("class", classOption)}
                  />
                  <span>{classOption}</span>
                </label>
              ))}
            </div>
            <div className="checkbox-actions">
              <button
                type="button"
                className="chip-action-btn"
                onClick={() => setCsvValues("class", CLASS_OPTIONS)}
              >
                Select All Classes
              </button>
              <button
                type="button"
                className="chip-action-btn"
                onClick={() => setCsvValues("class", [])}
              >
                Clear
              </button>
            </div>
            <small className="input-help">Uses MongoDB $in on classes.</small>
          </label>

          <label className="input-group">
            <span>Class Exclude (multi-select)</span>
            <div className="checkbox-grid">
              {CLASS_OPTIONS.map((classOption) => (
                <label className="checkbox-item" key={`exclude-${classOption}`}>
                  <input
                    type="checkbox"
                    checked={isChecked("excludeClass", classOption)}
                    onChange={() => toggleCsvValue("excludeClass", classOption)}
                  />
                  <span>{classOption}</span>
                </label>
              ))}
            </div>
            <div className="checkbox-actions">
              <button
                type="button"
                className="chip-action-btn"
                onClick={() => setCsvValues("excludeClass", CLASS_OPTIONS)}
              >
                Exclude All Classes
              </button>
              <button
                type="button"
                className="chip-action-btn"
                onClick={() => setCsvValues("excludeClass", [])}
              >
                Clear
              </button>
            </div>
            <small className="input-help">Uses MongoDB $nin on classes.</small>
          </label>

          <label className="input-group">
            <span>All Classes Required</span>
            <div className="checkbox-grid">
              {CLASS_OPTIONS.map((classOption) => (
                <label className="checkbox-item" key={`all-${classOption}`}>
                  <input
                    type="checkbox"
                    checked={isChecked("allClasses", classOption)}
                    onChange={() => toggleCsvValue("allClasses", classOption)}
                  />
                  <span>{classOption}</span>
                </label>
              ))}
            </div>
            <div className="checkbox-actions">
              <button
                type="button"
                className="chip-action-btn"
                onClick={() => setCsvValues("allClasses", CLASS_OPTIONS)}
              >
                Require All Classes
              </button>
              <button
                type="button"
                className="chip-action-btn"
                onClick={() => setCsvValues("allClasses", [])}
              >
                Clear
              </button>
            </div>
            <small className="input-help">Uses MongoDB $all on classes.</small>
          </label>

          <label className="input-group">
            <span>Min Available Seats</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={filters.minSeats}
              onChange={(e) =>
                setFilters({ ...filters, minSeats: e.target.value })
              }
            />
          </label>

          <label className="input-group">
            <span>Max Available Seats</span>
            <input
              type="number"
              min="0"
              placeholder="200"
              value={filters.maxSeats}
              onChange={(e) =>
                setFilters({ ...filters, maxSeats: e.target.value })
              }
            />
          </label>
        </div>

        <div className="form-actions">
          <button type="submit">Search Trains</button>
          <button type="button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </form>

      {message && <div className="message">{message}</div>}

      <div className="card-list">
        {trains.map((train) => (
          <div className="item-card" key={train._id}>
            <h4>
              {train.name} ({train.number})
            </h4>
            <p>
              {train.source} to {train.destination}
            </p>
            <p>Runs: {train.runsOn?.join(", ")}</p>
            <p>Classes: {train.classes?.join(", ")}</p>
            <p>
              Seats: {train.availableSeats}/{train.totalSeats}
            </p>
            <p className="muted">Train ID: {train._id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchTrains;
