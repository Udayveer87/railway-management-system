# Railway Management System (MongoDB Learning Project)

Backend-focused IRCTC-like project to demonstrate MongoDB queries/operators in a realistic but simple booking flow.

## 1) Tech Stack

- Backend: Node.js + Express
- Database: MongoDB (local)
- ODM: Mongoose
- Frontend: React (Vite) + Axios (minimal API caller UI)

## 2) Scope

This is an academic learning project.

Not included:

- JWT auth
- Sessions
- Payments
- Waitlist
- Seat locking/concurrency systems
- Microservices

## 3) Folder Structure

```text
mongodb_project/
  backend/
    config/
      db.js
      indexSetup.js
    models/
      User.js
      Train.js
      Booking.js
    controllers/
      authController.js
      trainController.js
      bookingController.js
      analyticsController.js
    routes/
      authRoutes.js
      trainRoutes.js
      bookingRoutes.js
      analyticsRoutes.js
    server.js
    .env.example
  frontend/
    src/
      api/
        client.js
      pages/
        LoginSignup.jsx
        SearchTrains.jsx
        BookTicket.jsx
        ViewBookings.jsx
        AdminAddTrain.jsx
      App.jsx
      main.jsx
  README.md
```

## 4) Setup and Run

### Prerequisites

- Node.js 18+
- MongoDB running locally

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: http://localhost:5173

Backend default URL: http://localhost:5000

## 5) Data Models

### User

- name
- email (unique)
- password
- role (admin or user)
- createdAt

### Train

- name
- number
- source
- destination
- stations[]
- runsOn[]
- classes[]
- totalSeats
- availableSeats
- bookingCount (default 0)
- createdAt

### Booking

- userId (ref User)
- trainId (ref Train)
- date
- passengers[]
  - name
  - age
  - gender
  - seatNumber
  - status (confirmed or cancelled)
- totalPassengers
- bookingStatus (confirmed or cancelled)
- createdAt

## 6) Consistency Rules Implemented

1. Booking create:

- Train.availableSeats decreases
- Train.bookingCount increments using $inc

2. Passenger cancel:

- passenger.status set to cancelled
- Train.availableSeats increments by 1

3. Booking cancel:

- bookingStatus set to cancelled
- all passenger statuses set to cancelled
- Train.availableSeats increments by confirmed passenger count

4. Seat consistency checks:

- New booking and add-passenger require available seats
- Double-cancel is prevented at booking and passenger levels

## 7) API Endpoints

### Auth

- POST /api/auth/signup
- POST /api/auth/login

### Trains

- POST /api/trains
- GET /api/trains?source=&destination=
- GET /api/trains?station=
- GET /api/trains?day=
- GET /api/trains?class=

### Bookings

- POST /api/bookings
- GET /api/bookings?userId=&trainId=&status=&statusOr=&date=&fromDate=&toDate=&minPassengers=&maxPassengers=&exactPassengers=&passengerAgeMin=&passengerAgeMax=&sort=
- PATCH /api/bookings/:id/cancel
- PATCH /api/bookings/:id/passengers
- PATCH /api/bookings/:id/remove-passenger
- PATCH /api/bookings/:id/passengers/:seatNumber/cancel

### Utility

- GET /api/analytics/indexes

## 8) Sample API Calls

### Signup

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Madhav",
    "email":"madhav@example.com",
    "password":"123456",
    "role":"admin"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"madhav@example.com",
    "password":"123456"
  }'
```

### Add Train (admin role check from payload)

```bash
curl -X POST http://localhost:5000/api/trains \
  -H "Content-Type: application/json" \
  -d '{
    "role":"admin",
    "name":"Rajdhani Express",
    "number":"12951",
    "source":"Mumbai",
    "destination":"Delhi",
    "stations":["Mumbai","Surat","Vadodara","Delhi"],
    "runsOn":["Mon","Wed","Fri"],
    "classes":["SL","3AC","2AC"],
    "totalSeats":100,
    "availableSeats":100
  }'
```

### Search Trains ($and source+destination)

```bash
curl "http://localhost:5000/api/trains?source=Mumbai&destination=Delhi"
```

### Search by Class ($in)

```bash
curl "http://localhost:5000/api/trains?class=3AC"
```

### Search by allClasses ($all)

```bash
curl "http://localhost:5000/api/trains?allClasses=SL,3AC"
```

### Create Booking

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"<USER_ID>",
    "trainId":"<TRAIN_ID>",
    "date":"2026-04-25",
    "passengers":[
      {"name":"Aman","age":22,"gender":"M","seatNumber":"S1"},
      {"name":"Riya","age":21,"gender":"F","seatNumber":"S2"}
    ]
  }'
```

### Filter Bookings (date + minPassengers + exactPassengers + sort)

```bash
curl "http://localhost:5000/api/bookings?userId=<USER_ID>&fromDate=2026-04-01&toDate=2026-04-30&minPassengers=2&exactPassengers=2&sort=desc"
```

### Cancel One Passenger

```bash
curl -X PATCH "http://localhost:5000/api/bookings/<BOOKING_ID>/passengers/S1/cancel"
```

### Add Passenger ($push)

```bash
curl -X PATCH http://localhost:5000/api/bookings/<BOOKING_ID>/passengers \
  -H "Content-Type: application/json" \
  -d '{
    "passenger": {"name":"Kunal","age":30,"gender":"M","seatNumber":"S3"}
  }'
```

### Remove Passenger ($pull)

```bash
curl -X PATCH http://localhost:5000/api/bookings/<BOOKING_ID>/remove-passenger \
  -H "Content-Type: application/json" \
  -d '{"seatNumber":"S3"}'
```

### Cancel Booking ($set)

```bash
curl -X PATCH http://localhost:5000/api/bookings/<BOOKING_ID>/cancel
```

### Show Indexes (getIndexes)

```bash
curl "http://localhost:5000/api/analytics/indexes"
```

## 9) MongoDB Operator Mapping

| Operator   | Where used                                                            |
| ---------- | --------------------------------------------------------------------- |
| $eq        | train source/destination filters                                      |
| $ne        | train sourceNot/destinationNot, active-booking seat checks            |
| $gte       | booking fromDate/minPassengers, train minSeats                        |
| $lt        | booking date range and train/day seat checks                          |
| $lte       | booking toDate/maxPassengers, train maxSeats                          |
| $and       | train and booking query composition                                   |
| $or        | train keyword search, booking statusOr                                |
| $in        | train day/class include filters                                       |
| $nin       | train excludeClass                                                    |
| $all       | train allClasses                                                      |
| $elemMatch | booking passengerAgeMin/passengerAgeMax                               |
| $exists    | train stationsExists                                                  |
| $set       | booking cancel and passenger cancel                                   |
| $inc       | train availableSeats/bookingCount and booking totalPassengers updates |
| $push      | add passengers                                                        |
| $each      | add multiple passengers in one update                                 |
| $pull      | remove passenger                                                      |

## 10) Indexes

Declared in Mongoose schemas and also explicitly ensured with createIndex() in startup helper.

Train indexes:

- { source: 1, destination: 1 }
- { stations: 1 }
- { runsOn: 1 }
- { classes: 1 }

Booking indexes:

- { trainId: 1, date: 1 }
- { userId: 1 }

The API /api/analytics/indexes shows getIndexes() output for demo.
