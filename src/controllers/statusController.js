const { prisma } = require("../utils/prisma");

exports.getTouristStatus = async (req, res) => {
  try {
    const { id } = req.params; // touristId
    const tourist = await prisma.tourist.findUnique({
      where: { touristId: id },
      include: { blockchainLogs: { orderBy: { createdAt: "desc" }, take: 1 } }
    });
    if (!tourist) return res.status(404).json({ error: "Not found" });

    const latest = tourist.blockchainLogs[0];
    return res.json({
      tourist_id: tourist.touristId,
      blockchain_status: latest?.status || "UNKNOWN",
      txHash: latest?.txHash || null
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal error" });
  }
};
