// locationRoutes.js
const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

module.exports = (io) => {
  // POST routes
  router.post("/v1/locations", (req, res, next) => {
    req.app.set("io", io);
    next();
  }, locationController.ingestPoint);

  router.post("/v1/locations/batch", (req, res, next) => {
    req.app.set("io", io);
    next();
  }, locationController.ingestBatch);

  // ✅ GET route for fetching latest locations
  router.get("/v1/locations", async (req, res) => {
    try {
      const latestLocations = await locationController.getLatestLocations();
      return res.json(latestLocations);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "failed_to_fetch_locations", details: err.message });
    }
  });

  return router;
};
