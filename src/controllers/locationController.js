  // src/controllers/locationController.js
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  const haversine = require("haversine-distance"); // optional small helper if you want

  /**
   * Validate and normalize a point object.
   * Returns { ok: true, point } or { ok: false, error }
   */
  function validatePoint(raw) {
    const { touristId, timestamp, latitude, longitude } = raw;
    if (!touristId) return { ok: false, error: "touristId required" };
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return { ok: false, error: "invalid lat/lon" };
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return { ok: false, error: "lat/lon out of range" };
    const ts = timestamp ? new Date(timestamp) : new Date();
    if (isNaN(ts.getTime())) return { ok: false, error: "invalid timestamp" };
    return { ok: true, point: { touristId, timestamp: ts, latitude: lat, longitude: lon, accuracy: raw.accuracy ? parseFloat(raw.accuracy) : null, speed: raw.speed ? parseFloat(raw.speed) : null, heading: raw.heading ? parseFloat(raw.heading) : null, provider: raw.provider || null, deviceId: raw.deviceId || null, batchId: raw.batchId || null } };
  }

  /**
   * POST /v1/locations  (single point)
   */
  exports.ingestPoint = async (req, res) => {
    try {
      const raw = req.body;
      const v = validatePoint(raw);
      if (!v.ok) return res.status(400).json({ error: v.error });

      // Resolve tourist numeric id (touristId is public string)
      const tourist = await prisma.tourist.findUnique({ where: { touristId: v.point.touristId }});
      if (!tourist) return res.status(404).json({ error: "tourist not found" });

      // Insert raw point
      const created = await prisma.locationRaw.create({
    data: {
      touristId: tourist.id,   // ✅ internal int
      timestamp: new Date(req.body.timestamp || Date.now()),
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      accuracy: req.body.accuracy || null,
      speed: req.body.speed || null,
      heading: req.body.heading || null,
      provider: req.body.provider || null,
      deviceId: req.body.deviceId || null,
      batchId: req.body.batchId || null
    }
  })
      // Upsert latest (atomic) — uses upsert to keep single row
      await prisma.locationLatest.upsert({
        where: { touristId: tourist.id },
        update: {
          timestamp: v.point.timestamp,
          latitude: v.point.latitude,
          longitude: v.point.longitude,
          accuracy: v.point.accuracy,
          speed: v.point.speed,
          heading: v.point.heading,
          provider: v.point.provider,
          deviceId: v.point.deviceId,
        },
        create: {
          touristId: tourist.id,
          timestamp: v.point.timestamp,
          latitude: v.point.latitude,
          longitude: v.point.longitude,
          accuracy: v.point.accuracy,
          speed: v.point.speed,
          heading: v.point.heading,
          provider: v.point.provider,
          deviceId: v.point.deviceId,
        }
      });

      if (req.app.get("io")) {
        req.app.get("io").emit("locationUpdate", {
          touristId: tourist.touristId,
          timestamp: created.timestamp,
          latitude: created.latitude,
          longitude: created.longitude,
          accuracy: created.accuracy,
          speed: created.speed,
          heading: created.heading
        });
      }

      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "ingest_failed", details: err.message });
    }
  };

  /**
   * POST /v1/locations/batch  (array of points)
   * Accepts { touristId, deviceId, points: [{timestamp, latitude, longitude, accuracy,...}, ...] }
   */
  exports.ingestBatch = async (req, res) => {
    try {
      const { touristId, deviceId, points } = req.body;
      if (!touristId || !Array.isArray(points)) return res.status(400).json({ error: "touristId & points[] required" });

      const tourist = await prisma.tourist.findUnique({ where: {  touristId: req.body.touristId }});
      if (!tourist) return res.status(404).json({ error: "tourist not found" });

      const toInsert = [];
      let latestPoint = null;

      for (const p of points) {
        const merged = { touristId, deviceId, ...p };
        const v = validatePoint(merged);
        if (!v.ok) continue; // skip invalid points quietly or collect errors
        toInsert.push({
          touristId: tourist.id,
          timestamp: v.point.timestamp,
          latitude: v.point.latitude,
          longitude: v.point.longitude,
          accuracy: v.point.accuracy,
          speed: v.point.speed,
          heading: v.point.heading,
          provider: v.point.provider,
          deviceId: v.point.deviceId,
          batchId: v.point.batchId
        });
        if (!latestPoint || v.point.timestamp > latestPoint.timestamp) latestPoint = v.point;
      }

      if (toInsert.length === 0) return res.status(400).json({ error: "no valid points" });

      // Bulk insert
      const created = await prisma.locationRaw.createMany({ data: toInsert });

      // Upsert latest using latestPoint
      if (latestPoint) {
        await prisma.locationLatest.upsert({
    where: { touristId: tourist.id },
    update: {
      timestamp: created.timestamp,
      latitude: created.latitude,
      longitude: created.longitude,
      accuracy: created.accuracy,
      speed: created.speed,
      heading: created.heading,
      provider: created.provider,
      deviceId: created.deviceId
    },
    create: {
      touristId: tourist.id,
      timestamp: created.timestamp,
      latitude: created.latitude,
      longitude: created.longitude,
      accuracy: created.accuracy,
      speed: created.speed,
      heading: created.heading,
      provider: created.provider,
      deviceId: created.deviceId
    }
  });

      }

      return res.json({ success: true, inserted: toInsert.length });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "ingest_batch_failed", details: err.message });
    }
  };

  // Returns all latest locations
  exports.getLatestLocations = async () => {
    return prisma.locationLatest.findMany({
      include: {
        tourist: true, // optional if you want touristId or other info
      },
      orderBy: { timestamp: "desc" }
    });
  };
