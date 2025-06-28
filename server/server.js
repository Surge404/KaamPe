import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import connectCloudinary from "./configs/cloudinary.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

// Connect to the database and Cloudinary hi
connectDB();
connectCloudinary();

const app = express();

// Configure CORS to allow requests specifically from your frontend application's current origin.
// The origin 'https://kaam-pe.vercel.app' is the one your frontend is currently using.
app.use(
  cors({
    origin: "https://kaam-pe.vercel.app", // <--- THIS LINE IS UPDATED to match your current frontend origin
    credentials: true,
  })
);

// API to listen to Stripe Webhooks
// It's important to place this raw body parser BEFORE express.json()
// as Stripe webhooks require the raw request body for signature verification.
app.post("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// Middleware to parse JSON bodies for other routes
app.use(express.json());

// Clerk middleware for authentication
app.use(clerkMiddleware());

// API to listen to Clerk Webhooks
app.use("/api/clerk", clerkWebhooks);

// Basic route to check if API is working
app.get("/", (req, res) => res.send("API is working"));

// API routes for different resources
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

// Set the port for the server to listen on
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
