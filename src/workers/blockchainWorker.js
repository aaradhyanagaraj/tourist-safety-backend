const { Queue, Worker } = require("bullmq");
const { prisma } = require("../utils/prisma");
const crypto = require("crypto");

const connection = { host: "127.0.0.1", port: 6379 };
const queueName = "blockchainQueue";

// consumer: process blockchain anchoring
const worker = new Worker(queueName, async job => {
  const { blockchainLogId, auditHash } = job.data;
  console.log("⚡ Anchoring audit hash:", auditHash);

  try {
    // Mock blockchain txHash (in real app: call Hyperledger/Quorum SDK)
    const txHash = crypto.randomBytes(16).toString("hex");

    await prisma.blockchainLog.update({
      where: { id: blockchainLogId },
      data: { status: "CONFIRMED", txHash }
    });

    console.log("✅ Blockchain anchored:", txHash);
  } catch (err) {
    console.error("❌ Blockchain worker error:", err);
    await prisma.blockchainLog.update({
      where: { id: blockchainLogId },
      data: { status: "FAILED", error: err.message }
    });
  }
}, { connection });

console.log("🚀 Blockchain Worker started");
