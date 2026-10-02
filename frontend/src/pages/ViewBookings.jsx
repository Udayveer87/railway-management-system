import { useState } from "react";
import api from "../api/client";

const STATUS_OPTIONS = ["confirmed", "cancelled"];

const parseCsv = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function ViewBookings({ user }) {
  const [filters, setFilters] = useState({
    userId: user?._id || "",
    status: "",
    statusOr: "",
    fromDate: "",
    toDate: "",
    minPassengers: "",
    maxPassengers: "",
    exactPassengers: "",
    passengerAgeMin: "",
    passengerAgeMax: "",
    sort: "desc",
  });
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [actionInputByBooking, setActionInputByBooking] = useState({});

  const toggleStatusOr = (statusValue) => {
    const currentValues = parseCsv(filters.statusOr);
    const exists = currentValues.includes(statusValue);
    const nextValues = exists
      ? currentValues.filter((value) => value !== statusValue)
      : [...currentValues, statusValue];

    setFilters({
      ...filters,
      statusOr: nextValues.join(","),
    });
  };

  const isStatusOrChecked = (statusValue) =>
    parseCsv(filters.statusOr).includes(statusValue);

  const setStatusOr = (values) => {
    setFilters({
      ...filters,
      statusOr: values.join(","),
    });
  };

  const getActionInput = (bookingId) =>
    actionInputByBooking[bookingId] || {
      addName: "",
      addAge: "",
      addGender: "",
      addSeat: "",
      removeSeat: "",
      cancelSeat: "",
    };

  const updateActionInput = (bookingId, key, value) => {
    const existing = getActionInput(bookingId);
    setActionInputByBooking({
      ...actionInputByBooking,
      [bookingId]: {
        ...existing,
        [key]: value,
      },
    });
  };

  const fetchBookings = async () => {
    setMessage("");
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== ""),
      );
      const response = await api.get("/api/bookings", { params });
      setBookings(response.data.bookings || []);
      setMessage(`Found ${response.data.count || 0} booking(s)`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to fetch bookings");
      setBookings([]);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await api.patch(`/api/bookings/${bookingId}/cancel`);
      fetchBookings();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const addPassenger = async (bookingId) => {
    try {
      const data = getActionInput(bookingId);

      if (!data.addName || !data.addAge || !data.addGender || !data.addSeat) {
        setMessage("Please fill all Add Passenger fields for this booking");
        return;
      }

      await api.patch(`/api/bookings/${bookingId}/passengers`, {
        passenger: {
          name: data.addName,
          age: Number(data.addAge),
          gender: data.addGender,
          seatNumber: data.addSeat,
        },
      });

      fetchBookings();
      updateActionInput(bookingId, "addName", "");
      updateActionInput(bookingId, "addAge", "");
      updateActionInput(bookingId, "addGender", "");
      updateActionInput(bookingId, "addSeat", "");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to add passenger");
    }
  };

  const removePassenger = async (bookingId) => {
    try {
      const data = getActionInput(bookingId);

      if (!data.removeSeat) {
        setMessage("Please enter seat number to remove");
        return;
      }

      await api.patch(`/api/bookings/${bookingId}/remove-passenger`, {
        seatNumber: data.removeSeat,
      });

      fetchBookings();
      updateActionInput(bookingId, "removeSeat", "");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to remove passenger");
    }
  };

  const cancelPassenger = async (bookingId) => {
    try {
      const data = getActionInput(bookingId);

      if (!data.cancelSeat) {
        setMessage("Please enter seat number to cancel");
        return;
      }

      await api.patch(
        `/api/bookings/${bookingId}/passengers/${data.cancelSeat}/cancel`,
      );
      fetchBookings();
      updateActionInput(bookingId, "cancelSeat", "");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to cancel passenger");
    }
  };

  if (!user?._id) {
    return (
      <div>
        <h2 className="section-title">View Bookings</h2>
        <div className="message">
          Please login first to view and manage bookings.
        </div>
      </div>
    );
  }

  if (user.role !== "user") {
    return (
      <div>
        <h2 className="section-title">View Bookings</h2>
        <div className="message">
          Booking management is available in user mode only. Admin accounts
          should manage trains.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title">View Bookings</h2>

      <div className="item-card">
        <h4>Filters</h4>
        <div className="form-grid">
          <label className="input-group">
            <span>User ID</span>
            <input
              placeholder="User _id"
              value={filters.userId}
              onChange={(e) =>
                setFilters({ ...filters, userId: e.target.value })
              }
            />
          </label>

          <label className="input-group">
            <span>Status</span>
            <input
              placeholder="confirmed or cancelled"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            />
          </label>

          <label className="input-group">
            <span>Status OR</span>
            <div className="checkbox-grid">
              {STATUS_OPTIONS.map((statusOption) => (
                <label className="checkbox-item" key={statusOption}>
                  <input
                    type="checkbox"
                    checked={isStatusOrChecked(statusOption)}
                    onChange={() => toggleStatusOr(statusOption)}
                  />
                  <span>{statusOption}</span>
                </label>
              ))}
            </div>
            <div className="checkbox-actions">
              <button
                type="button"
                className="chip-action-btn"
                onClick={() => setStatusOr(STATUS_OPTIONS)}
              >
                Select Both
              </button>
              <button
                type="button"
                className="chip-action-btn"
                onClick={() => setStatusOr([])}
              >
                Clear
              </button>
            </div>
            <small className="input-help">
              Uses MongoDB $or for selected statuses.
            </small>
          </label>

          <label className="input-group">
            <span>From Date</span>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
            />
          </label>

          <label className="input-group">
            <span>To Date</span>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
            />
          </label>

          <label className="input-group">
            <span>Min Passengers</span>
            <input
              type="number"
              min="0"
              value={filters.minPassengers}
              onChange={(e) =>
                setFilters({ ...filters, minPassengers: e.target.value })
              }
            />
          </label>

          <label className="input-group">
            <span>Max Passengers</span>
            <input
              type="number"
              min="0"
              value={filters.maxPassengers}
              onChange={(e) =>
                setFilters({ ...filters, maxPassengers: e.target.value })
              }
            />
          </label>

          <label className="input-group">
            <span>Exact Passengers</span>
            <input
              type="number"
              min="0"
              value={filters.exactPassengers}
              onChange={(e) =>
                setFilters({ ...filters, exactPassengers: e.target.value })
              }
            />
          </label>

          <label className="input-group">
            <span>Passenger Age Min</span>
            <input
              type="number"
              min="0"
              value={filters.passengerAgeMin}
              onChange={(e) =>
                setFilters({ ...filters, passengerAgeMin: e.target.value })
              }
            />
          </label>

          <label className="input-group">
            <span>Passenger Age Max</span>
            <input
              type="number"
              min="0"
              value={filters.passengerAgeMax}
              onChange={(e) =>
                setFilters({ ...filters, passengerAgeMax: e.target.value })
              }
            />
          </label>

          <label className="input-group">
            <span>Sort by Created Date</span>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" onClick={fetchBookings}>
            Fetch Bookings
          </button>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="card-list">
        {bookings.map((booking) => {
          const actionInput = getActionInput(booking._id);

          return (
            <div className="item-card" key={booking._id}>
              <h4>Booking: {booking._id}</h4>
              <p>Status: {booking.bookingStatus}</p>
              <p>Total Passengers: {booking.totalPassengers}</p>
              <p>Date: {new Date(booking.date).toLocaleDateString()}</p>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => cancelBooking(booking._id)}
                >
                  Cancel Full Booking
                </button>
              </div>

              <div className="passenger-box">
                <h4>Add Passenger</h4>
                <div className="form-grid">
                  <label className="input-group">
                    <span>Name</span>
                    <input
                      value={actionInput.addName}
                      onChange={(e) =>
                        updateActionInput(
                          booking._id,
                          "addName",
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <label className="input-group">
                    <span>Age</span>
                    <input
                      type="number"
                      min="0"
                      value={actionInput.addAge}
                      onChange={(e) =>
                        updateActionInput(booking._id, "addAge", e.target.value)
                      }
                    />
                  </label>
                  <label className="input-group">
                    <span>Gender</span>
                    <input
                      value={actionInput.addGender}
                      onChange={(e) =>
                        updateActionInput(
                          booking._id,
                          "addGender",
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <label className="input-group">
                    <span>Seat Number</span>
                    <input
                      value={actionInput.addSeat}
                      onChange={(e) =>
                        updateActionInput(
                          booking._id,
                          "addSeat",
                          e.target.value,
                        )
                      }
                    />
                  </label>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => addPassenger(booking._id)}
                  >
                    Add Passenger
                  </button>
                </div>
              </div>

              <div className="passenger-box">
                <h4>Remove Passenger</h4>
                <div className="inline-row">
                  <label className="input-group">
                    <span>Seat Number</span>
                    <input
                      value={actionInput.removeSeat}
                      onChange={(e) =>
                        updateActionInput(
                          booking._id,
                          "removeSeat",
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removePassenger(booking._id)}
                  >
                    Remove Passenger
                  </button>
                </div>
              </div>

              <div className="passenger-box">
                <h4>Cancel One Passenger</h4>
                <div className="inline-row">
                  <label className="input-group">
                    <span>Seat Number</span>
                    <input
                      value={actionInput.cancelSeat}
                      onChange={(e) =>
                        updateActionInput(
                          booking._id,
                          "cancelSeat",
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => cancelPassenger(booking._id)}
                  >
                    Cancel Passenger
                  </button>
                </div>
              </div>

              <ul>
                {booking.passengers.map((passenger, index) => (
                  <li key={`${booking._id}-${passenger.seatNumber}-${index}`}>
                    {passenger.name} | age: {passenger.age} | seat:{" "}
                    {passenger.seatNumber} | status: {passenger.status}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ViewBookings;
