const express = require("express");
const { getTouristStatus } = require("../controllers/statusController");
const router = express.Router();

router.get("/:id/status", getTouristStatus);

module.exports = router;
