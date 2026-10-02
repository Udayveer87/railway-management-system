# IRCTC MongoDB Demo - Testing Guide

This guide provides a complete walkthrough to test all features of the simplified IRCTC train booking demo.
The application relies strictly on standard, easy-to-understand MongoDB CRUD operations rather than complex aggregation pipelines.

## 1) One-Time Setup

1. Ensure MongoDB is running locally.
2. Install dependencies:

```bash
cd backend && npm install
cd frontend && npm install
```

3. Seed the demo data (Warning: this deletes existing collections!):

```bash
cd backend && node scripts/seedDemoData.js
```

4. Start both servers:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 2) Demo Credentials

The database is seeded with these roles:

**Admin Role:**

- **Email:** `admin.demo@railway.local`
- **Password:** `admin123`

**User Role (Choose any):**

- **Email:** `priya.user@railway.local`
- **Password:** `user123`
- **Email:** `arjun.user@railway.local`
- **Password:** `user123`

---

## 3) Seeded Trains Reference

- `D1001` (Demo Rajdhani): Mumbai -> Delhi | Stations: Mumbai, Surat, Vadodara, Delhi | Runs: Mon, Wed, Fri | 120 Total Seats
- `D1002` (Demo Shatabdi): Delhi -> Chandigarh | Stations: Delhi, Panipat, Ambala, Chandigarh | Runs: Tue, Thu, Sat | 80 Total Seats
- `D1003` (Demo Coastal): Chennai -> Bengaluru | Stations: Chennai, Katpadi, Bengaluru | Runs: Mon, Tue, Wed, Thu, Fri | 90 Total Seats
- `D1004` (Demo Desert): Jaipur -> Ahmedabad | Stations: Jaipur, Ajmer, Udaipur, Ahmedabad | Runs: Sun, Mon, Thu | 70 Total Seats

---

## 4) Feature Testing Walkthrough

### A) Role-Based Routing & Authentication

1. Go to **Login / Signup**.
2. **Login as Admin** (`admin.demo@railway.local`).
   - _Verify:_ You can only see the "Add Train" and "Search Trains" tabs.
3. Logout and **Login as User** (`priya.user@railway.local`).
   - _Verify:_ You can see "Search Trains", "Book Ticket", and "View Bookings".

### B) Admin: Add a Train (Simple Create)

1. Login as **Admin**.
2. Go to the **Admin Add Train** tab.
3. Submit a new train payload:
   - Name: `Demo Regional`
   - Number: `D5005`
   - Source: `Pune`
   - Destination: `Nagpur`
   - Stations CSV: `Pune,Solapur,Nagpur`
   - Runs On: `Tue, Thu`
   - Classes: `SL, 3AC`
   - Total Seats: `60`
4. _Verify:_ You get a success message. The new train is written via a simple `Train.create()` query.

### C) Dynamic Seat Availability (Simple Read & Math)

1. Login as **User** (`priya.user@railway.local`).
2. Go to **Search Trains**.
3. Search for: **Mumbai** to **Delhi**.
4. Set **Journey Date** to an upcoming **Monday**.
5. _Verify:_ You see `D1001` with accurately calculated dynamic seats (Total Seats minus confirmed passengers for _that specific date_).

### D) Booking Validation Constraints (Read + Create)

1. Copy the Train ID for `D1001`.
2. Go to **Book Ticket**.
3. **Test 1:** Try booking for a past date. (Fails)
4. **Test 2:** Try booking for a **Tuesday** (D1001 only runs Mon/Wed/Fri). (Fails: Invalid day mismatch)
5. **Test 3:** Add two passengers with the _exact same_ Seat Number. (Fails: duplicate seat logic)
6. **Test 4:** Add two valid passengers (Name, Age, Gender, Unique Seat).
7. _Verify:_ Booking succeeds via `Booking.create()`.

### E) Viewing & Modifying Bookings (Simple Update)

1. Go to **View Bookings**. Click "Fetch Bookings".
2. Find the booking you just made.
3. **Cancel Booking:**
   - Click "Cancel Full Booking".
   - _Verify:_ The status updates to `cancelled` for the booking and all its passengers via `$set`.
4. **Add Passengers:**
   - Find a different `confirmed` booking (or make a new one).
   - Enter a new valid passenger payload (Name, Age, Gender, Seat).
   - _Verify:_ Passenger is added securely using the `$push` operator.

---

_Note: This course project explicitly avoids complex MongoDB aggregation pipelines (`$lookup`, `$unwind`, etc.) in favor of straightforward, understandable CRUD queries mapped closely to realistic business logic._
