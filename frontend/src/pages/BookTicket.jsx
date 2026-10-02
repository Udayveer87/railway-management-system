import { useState } from "react";
import api from "../api/client";

function BookTicket({ user }) {
  const [form, setForm] = useState({
    trainId: "",
    date: "",
    passengers: [{ name: "", age: "", gender: "", seatNumber: "" }],
  });
  const [message, setMessage] = useState("");

  const updatePassenger = (index, key, value) => {
    const updated = [...form.passengers];
    updated[index] = { ...updated[index], [key]: value };
    setForm({ ...form, passengers: updated });
  };

  const addPassengerRow = () => {
    setForm({
      ...form,
      passengers: [
        ...form.passengers,
        { name: "", age: "", gender: "", seatNumber: "" },
      ],
    });
  };

  const removePassengerRow = (index) => {
    if (form.passengers.length === 1) return;
    const updated = form.passengers.filter((_, rowIndex) => rowIndex !== index);
    setForm({ ...form, passengers: updated });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!user?._id) {
      setMessage("Please login first");
      return;
    }

    try {
      const payload = {
        userId: user._id,
        trainId: form.trainId,
        date: form.date,
        passengers: form.passengers,
      };

      const response = await api.post("/api/bookings", payload);
      setMessage(response.data.message || "Booking created");
      setForm({
        trainId: "",
        date: "",
        passengers: [{ name: "", age: "", gender: "", seatNumber: "" }],
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Booking failed");
    }
  };

  if (!user?._id) {
    return (
      <div>
        <h2 className="section-title">Book Ticket</h2>
        <div className="message">
          Please login first. After login, this page will show booking form
          fields.
        </div>
      </div>
    );
  }

  if (user.role !== "user") {
    return (
      <div>
        <h2 className="section-title">Book Ticket</h2>
        <div className="message">
          Ticket booking is available in user mode only. Admin accounts should
          use Admin Add Train.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title">Book Ticket</h2>
      <p className="muted">
        Logged in as: {user.name} ({user.role}) | User ID: {user._id}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="input-group">
            <span>Train ID</span>
            <input
              required
              placeholder="Paste train _id from search results"
              value={form.trainId}
              onChange={(e) => setForm({ ...form, trainId: e.target.value })}
            />
          </label>

          <label className="input-group">
            <span>Journey Date</span>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
        </div>

        <h4>Passengers</h4>
        <div className="card-list">
          {form.passengers.map((passenger, index) => (
            <div className="passenger-box" key={index}>
              <p>
                <strong>Passenger {index + 1}</strong>
              </p>
              <div className="form-grid">
                <label className="input-group">
                  <span>Name</span>
                  <input
                    required
                    placeholder="Passenger name"
                    value={passenger.name}
                    onChange={(e) =>
                      updatePassenger(index, "name", e.target.value)
                    }
                  />
                </label>

                <label className="input-group">
                  <span>Age</span>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="Age"
                    value={passenger.age}
                    onChange={(e) =>
                      updatePassenger(index, "age", e.target.value)
                    }
                  />
                </label>

                <label className="input-group">
                  <span>Gender</span>
                  <input
                    required
                    placeholder="M/F/O"
                    value={passenger.gender}
                    onChange={(e) =>
                      updatePassenger(index, "gender", e.target.value)
                    }
                  />
                </label>

                <label className="input-group">
                  <span>Seat Number</span>
                  <input
                    required
                    placeholder="Example: S1"
                    value={passenger.seatNumber}
                    onChange={(e) =>
                      updatePassenger(index, "seatNumber", e.target.value)
                    }
                  />
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => removePassengerRow(index)}>
                  Remove This Passenger
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" onClick={addPassengerRow}>
            Add Passenger Row
          </button>
          <button type="submit">Create Booking</button>
        </div>
      </form>

      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default BookTicket;
