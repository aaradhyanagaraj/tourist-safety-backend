const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const touristRoutes = require("./src/routes/touristRoutes");
const authRoutes = require("./src/routes/authRoutes");
const createLocationRoutes = require("./src/routes/locationRoutes"); // renamed for clarity
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "1mb" }));

// Test route
app.get("/", (req, res) => res.send("Backend running ✅"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tourists", touristRoutes);
app.use("/api/locations", createLocationRoutes(io)); // pass io into location routes

// WebSocket connection
io.on("connection", (socket) => {
  console.log("📡 Dashboard connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Dashboard disconnected:", socket.id);
  });
});



// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
