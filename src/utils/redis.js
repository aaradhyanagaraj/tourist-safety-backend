const Redis = require("ioredis");

// create redis client
const redisClient = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

// function to connect redis
async function connectRedis() {
  try {
    await redisClient.ping();
    console.log("✅ Connected to Redis");
  } catch (err) {
    console.error("❌ Redis connection error:", err);
  }
}

module.exports = { redisClient, connectRedis };
