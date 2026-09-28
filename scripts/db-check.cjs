/**
 * Database connectivity check.
 * Run: npm run db:check
 * Verifies MONGO_URI is reachable, pings the server, and reports collection counts.
 * Never prints credentials (URI is masked in output).
 */
require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI || "";
const dbName = process.env.MONGO_DB_NAME || "eternitycrm_website";

function maskUri(u) {
  try {
    const parsed = new URL(u);
    const host = parsed.host;
    const user = parsed.username ? `${parsed.username}:***@` : "";
    const db = parsed.pathname ? parsed.pathname.slice(1) : "";
    return `${parsed.protocol}//${user}${host}${db ? "/" + db : ""}`;
  } catch {
    return "unparseable-uri";
  }
}

async function main() {
  if (!uri) {
    console.log("✗ MONGO_URI is not set in .env");
    process.exit(1);
  }

  const masked = maskUri(uri);
  console.log(`Target : ${masked}`);
  console.log(`DB name: ${dbName}`);
  console.log("Pinging…");

  const started = Date.now();
  try {
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    const ms = Date.now() - started;

    const admin = mongoose.connection.db.admin();
    const hello = await admin.command({ hello: 1 });
    const colls = await mongoose.connection.db.listCollections().toArray();
    const names = colls.map((c) => c.name);

    console.log(`✓ Connected in ${ms}ms`);
    console.log(`  Server : MongoDB ${hello.version || "?"} (${hello.msg === "isdbgrid" ? "Atlas/sharded" : "standalone/replica"})`);
    console.log(`  Collections: ${names.length ? names.join(", ") : "none yet (empty database)"}`);

    for (const n of ["registrations", "admins"]) {
      if (names.includes(n)) {
        const count = await mongoose.connection.db.collection(n).countDocuments();
        console.log(`  · ${n}: ${count} document${count === 1 ? "" : "s"}`);
      }
    }

    console.log("\n✓ Database is reachable. Admin portal will work.");
    process.exit(0);
  } catch (err) {
    console.log(`✗ Connection FAILED after ${Date.now() - started}ms`);
    console.log(`  ${err.message}`);
    if (/ENOTFOUND|ETIMEDOUT|ECONNREFUSED|querySrv/i.test(err.message)) {
      console.log("\nHints:");
      console.log("  · Atlas: Network Access must include 0.0.0.0/0 (Vercel uses dynamic IPs)");
      console.log("  · Check the hostname in MONGO_URI for typos");
      console.log("  · Corporate/sandbox networks sometimes block outbound 27017");
    }
    if (/bad auth|Authentication failed/i.test(err.message)) {
      console.log("\nHints:");
      console.log("  · Username/password wrong, or special characters not URL-encoded");
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main();
