// Utility to safely convert BigInt to string in JSON responses
function jsonBigInt(obj) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

module.exports = { jsonBigInt };
