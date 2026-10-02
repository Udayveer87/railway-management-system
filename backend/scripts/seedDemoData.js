const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/User");
const Train = require("../models/Train");
const Booking = require("../models/Booking");

const DEMO_USERS = [
  {
    name: "Demo Admin",
    email: "admin.demo@railway.local",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Priya Mehta",
    email: "priya.user@railway.local",
    password: "user123",
    role: "user",
  },
  {
    name: "Arjun Verma",
    email: "arjun.user@railway.local",
    password: "user123",
    role: "user",
  },
  {
    name: "Neha Singh",
    email: "neha.user@railway.local",
    password: "user123",
    role: "user",
  },
];

const DEMO_TRAINS = [
  {
    name: "Demo Rajdhani",
    number: "D1001",
    source: "Mumbai",
    destination: "Delhi",
    stations: ["Mumbai", "Surat", "Vadodara", "Delhi"],
    runsOn: ["Mon", "Wed", "Fri"],
    classes: ["SL", "3AC", "2AC"],
    totalSeats: 120,
    availableSeats: 120,
    bookingCount: 0,
  },
  {
    name: "Demo Shatabdi",
    number: "D1002",
    source: "Delhi",
    destination: "Chandigarh",
    stations: ["Delhi", "Panipat", "Ambala", "Chandigarh"],
    runsOn: ["Tue", "Thu", "Sat"],
    classes: ["3AC", "2AC"],
    totalSeats: 80,
    availableSeats: 80,
    bookingCount: 0,
  },
  {
    name: "Demo Coastal",
    number: "D1003",
    source: "Chennai",
    destination: "Bengaluru",
    stations: ["Chennai", "Katpadi", "Bengaluru"],
    runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    classes: ["SL", "3AC"],
    totalSeats: 90,
    availableSeats: 90,
    bookingCount: 0,
  },
  {
    name: "Demo Desert",
    number: "D1004",
    source: "Jaipur",
    destination: "Ahmedabad",
    stations: ["Jaipur", "Ajmer", "Udaipur", "Ahmedabad"],
    runsOn: ["Sun", "Mon", "Thu"],
    classes: ["SL", "2AC"],
    totalSeats: 70,
    availableSeats: 70,
    bookingCount: 0,
  },
];

const DAY_TO_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const addDays = (daysAhead) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysAhead);
  return date;
};

const getNextDateForDay = (dayCode, minimumDaysAhead = 1) => {
  const targetDayIndex = DAY_TO_INDEX[dayCode];
  if (targetDayIndex === undefined) {
    return addDays(minimumDaysAhead);
  }

  const date = addDays(minimumDaysAhead);
  while (date.getDay() !== targetDayIndex) {
    date.setDate(date.getDate() + 1);
  }
  return date;
};

const makePassenger = (
  name,
  age,
  gender,
  seatNumber,
  status = "confirmed",
) => ({
  name,
  age,
  gender,
  seatNumber,
  status,
});

const upsertUsers = async () => {
  const usersByEmail = {};

  for (const demoUser of DEMO_USERS) {
    const user = await User.findOneAndUpdate(
      { email: demoUser.email.toLowerCase() },
      { $set: demoUser },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    usersByEmail[demoUser.email] = user;
  }

  return usersByEmail;
};

const upsertTrains = async () => {
  const trainsByNumber = {};

  for (const demoTrain of DEMO_TRAINS) {
    const trainPayload = { ...demoTrain };

    const train = await Train.findOneAndUpdate(
      { number: demoTrain.number },
      { $set: trainPayload },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    trainsByNumber[demoTrain.number] = train;
  }

  return trainsByNumber;
};

const buildDemoBookings = (usersByEmail, trainsByNumber) => [
  {
    userId: usersByEmail["priya.user@railway.local"]._id,
    trainId: trainsByNumber.D1001._id,
    date: getNextDateForDay("Mon", 1),
    passengers: [
      makePassenger("Priya Mehta", 27, "F", "S1"),
      makePassenger("Kunal Mehta", 30, "M", "S2"),
    ],
    totalPassengers: 2,
    bookingStatus: "confirmed",
  },
  {
    userId: usersByEmail["priya.user@railway.local"]._id,
    trainId: trainsByNumber.D1002._id,
    date: getNextDateForDay("Tue", 2),
    passengers: [
      makePassenger("Priya Mehta", 27, "F", "C1", "cancelled"),
      makePassenger("Maya Patel", 26, "F", "C2", "cancelled"),
    ],
    totalPassengers: 2,
    bookingStatus: "cancelled",
  },
  {
    userId: usersByEmail["arjun.user@railway.local"]._id,
    trainId: trainsByNumber.D1001._id,
    date: getNextDateForDay("Wed", 3),
    passengers: [
      makePassenger("Arjun Verma", 31, "M", "S10"),
      makePassenger("Rohit Verma", 18, "M", "S11"),
      makePassenger("Anita Verma", 58, "F", "S12", "cancelled"),
    ],
    totalPassengers: 3,
    bookingStatus: "confirmed",
  },
  {
    userId: usersByEmail["arjun.user@railway.local"]._id,
    trainId: trainsByNumber.D1003._id,
    date: getNextDateForDay("Thu", 4),
    passengers: [makePassenger("Arjun Verma", 31, "M", "B1")],
    totalPassengers: 1,
    bookingStatus: "confirmed",
  },
  {
    userId: usersByEmail["neha.user@railway.local"]._id,
    trainId: trainsByNumber.D1004._id,
    date: getNextDateForDay("Sun", 5),
    passengers: [
      makePassenger("Neha Singh", 24, "F", "J1"),
      makePassenger("Isha Singh", 21, "F", "J2"),
    ],
    totalPassengers: 2,
    bookingStatus: "confirmed",
  },
  {
    userId: usersByEmail["neha.user@railway.local"]._id,
    trainId: trainsByNumber.D1003._id,
    date: getNextDateForDay("Fri", 6),
    passengers: [
      makePassenger("Neha Singh", 24, "F", "B7"),
      makePassenger("Dev Singh", 29, "M", "B8"),
    ],
    totalPassengers: 2,
    bookingStatus: "confirmed",
  },
];

const seedDemoData = async () => {
  // Clear all data first
  await User.deleteMany({});
  await Train.deleteMany({});
  await Booking.deleteMany({});

  const usersByEmail = await upsertUsers();
  const trainsByNumber = await upsertTrains();

  const demoTrainIds = Object.values(trainsByNumber).map((train) => train._id);

  const bookingPayload = buildDemoBookings(usersByEmail, trainsByNumber);
  const createdBookings = await Booking.insertMany(bookingPayload);

  const bookingStatsByTrain = createdBookings.reduce((acc, booking) => {
    const trainId = booking.trainId.toString();

    if (!acc[trainId]) {
      acc[trainId] = {
        bookingCount: 0,
        confirmedPassengers: 0,
      };
    }

    acc[trainId].bookingCount += 1;

    if (booking.bookingStatus !== "cancelled") {
      const confirmedPassengers = booking.passengers.filter(
        (passenger) => passenger.status === "confirmed",
      ).length;
      acc[trainId].confirmedPassengers += confirmedPassengers;
    }

    return acc;
  }, {});

  for (const train of Object.values(trainsByNumber)) {
    const trainId = train._id.toString();
    const stats = bookingStatsByTrain[trainId] || {
      bookingCount: 0,
      confirmedPassengers: 0,
    };

    const availableSeats = Math.max(
      train.totalSeats - stats.confirmedPassengers,
      0,
    );

    await Train.updateOne(
      { _id: train._id },
      {
        $set: {
          bookingCount: stats.bookingCount,
          availableSeats,
        },
      },
    );
  }

  const refreshedTrains = await Train.find({ _id: { $in: demoTrainIds } })
    .select("name number source destination totalSeats availableSeats")
    .sort({ number: 1 })
    .lean();

  console.log("\nDemo users (login credentials):");
  console.table(
    DEMO_USERS.map((user) => ({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
    })),
  );

  console.log("\nDemo trains:");
  console.table(
    refreshedTrains.map((train) => ({
      id: train._id.toString(),
      name: train.name,
      number: train.number,
      route: `${train.source} -> ${train.destination}`,
      seats: `${train.availableSeats}/${train.totalSeats}`,
    })),
  );

  console.log("\nDemo bookings created:");
  console.table(
    createdBookings.map((booking) => ({
      id: booking._id.toString(),
      trainId: booking.trainId.toString(),
      userId: booking.userId.toString(),
      status: booking.bookingStatus,
      totalPassengers: booking.totalPassengers,
      date: booking.date.toISOString().slice(0, 10),
    })),
  );

  console.log(
    "\nSeed complete. You can now test full demo flows in frontend and APIs.",
  );
};

const run = async () => {
  let exitCode = 0;

  try {
    await connectDB();
    await seedDemoData();
  } catch (error) {
    exitCode = 1;
    console.error("Demo seed failed:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(exitCode);
  }
};

run();
