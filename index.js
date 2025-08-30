// index.js (CommonJS style)

const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// =============================
// Root Test Route
// =============================
app.get("/", (req, res) => {
  res.send("Tourist Safety Backend is running ✅");
});


// =============================
// Indian Tourist Registration
// =============================
app.post("/indiantourists", async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      aadhaarNumber,
      mobile,
      email,
      emergencyContact,
      placeOfOrigin,
      travelStart,
      travelEnd,
      accommodation,
      consent
    } = req.body;

    // Aadhaar validation (12 digits)
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({ error: "Invalid Aadhaar number" });
    }

    // Prevent duplicate entry for same Aadhaar + same travel dates
    const duplicate = await prisma.indianTourist.findFirst({
      where: {
        aadhaarNumber,
        travelStart: new Date(travelStart),
        travelEnd: new Date(travelEnd),
      },
    });

    if (duplicate) {
      return res.status(400).json({ error: "Tourist already registered for these dates" });
    }

    const newTourist = await prisma.indianTourist.create({
      data: {
        name,
        age,
        gender,
        aadhaarNumber,
        mobile,
        email,
        emergencyContact,
        placeOfOrigin,
        travelStart: new Date(travelStart),
        travelEnd: new Date(travelEnd),
        accommodation,
        consent,
      },
    });

    res.status(201).json(newTourist);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to register tourist",
      details: error.message,
    });
  }
});


// =============================
// Foreign Tourist Registration
// =============================
app.post("/foreigntourists", async (req, res) => {
  try {
    const {
      name,
      passportNo,
      nationality,
      visaType,
      visaNumber,
      travelStart,
      travelEnd,
      consent
    } = req.body;

    // Passport format validation (basic check)
    const passportRegex = /^[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9]$/;
    if (!passportRegex.test(passportNo)) {
      return res.status(400).json({ error: "Invalid passport number format" });
    }

    // Prevent duplicate by passport
    const duplicate = await prisma.foreignTourist.findFirst({
      where: { passportNo },
    });

    if (duplicate) {
      return res.status(400).json({ error: "Tourist already registered with this passport" });
    }

    const newTourist = await prisma.foreignTourist.create({
      data: {
        name,
        passportNo,
        nationality,
        visaType,
        visaNumber,
        travelStart: new Date(travelStart),
        travelEnd: new Date(travelEnd),
        consent,
      },
    });

    res.status(201).json(newTourist);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to register foreign tourist",
      details: error.message,
    });
  }
});


// =============================
// Start server
// =============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
