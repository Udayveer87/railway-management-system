# Railway Management System

An IRCTC-style train booking system built to practice real-world MongoDB query and update patterns. Users can search trains, book tickets with multiple passengers, and manage bookings; admins can add trains to the catalog.

## Screenshots

**Login / Signup**
<img width="1180" height="900" alt="mongodb-login" src="https://github.com/user-attachments/assets/cf1d2309-9435-4646-a5cb-7c636a6c0341" />

**Search Trains**
<img width="1180" height="924" alt="mongodb-search" src="https://github.com/user-attachments/assets/365f028e-d252-4469-9135-c3c1cc3a5e3b" />

**View Bookings**

## Tech Stack

Node.js, Express, Mongoose (MongoDB) · React (Vite) + Axios

## Features

- Role-based access (user vs. admin)
- Multi-passenger booking with seat conflict and duplicate-seat checks
- Cancel full booking, cancel one passenger, add/remove passengers
- Live seat availability tracking (`$inc` on create/cancel)
- Compound indexes on trains and bookings, with an endpoint to inspect them

## Setup

```bash
cd backend && cp .env.example .env && npm install && npm run dev
cd frontend && npm install && npm run dev
```

Backend: `http://localhost:5000` · Frontend: `http://localhost:5173`

Full API reference and demo credentials are in `TECHNICAL_DOCUMENTATION.md` and `FULL_DEMO_TEST_GUIDE.md`.
