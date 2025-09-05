// src/controllers/locationController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.saveLocation = async (req, res, io) => {
  try {
    const { touristId, latitude, longitude } = req.body;

    if (!touristId || !latitude || !longitude) {
      return res.status(400).json({ error: "touristId, latitude, longitude are required" });
    }

    const tourist = await prisma.tourist.findUnique({
      where: { id: parseInt(touristId, 10) }
    });

    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }

const location = await prisma.location.create({
  data: {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    touristId: tourist.id,
  },
});

    // broadcast via WebSocket
    io.emit("locationUpdate", {
      touristId,
      latitude,
      longitude,
      timestamp: location.timestamp
    });

    res.status(201).json({ message: "Location saved successfully", location });
  } catch (err) {
    res.status(500).json({ error: "Failed to save location", details: err.message });
  }
};

exports.getAllLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: { tourist: true }, // join tourist table
      orderBy: { timestamp: "desc" },
      take: 100, // return last 100 records (adjust as needed)
    });

    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch locations", details: err.message });
  }
};

