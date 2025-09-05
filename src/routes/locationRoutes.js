// src/routes/locationRoutes.js
const express = require("express");
const { saveLocation, getAllLocations } = require("../controllers/locationController");

module.exports = (io) => {
  const router = express.Router();

  router.post("/", (req, res) => saveLocation(req, res, io));
  router.get("/", getAllLocations);

  return router;
};
