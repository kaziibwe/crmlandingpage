/**
 * Idempotent seed: creates the default administrator if missing.
 * Run: npm run db:seed
 * Override credentials with SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD before production.
 * Password is always stored hashed (scrypt) — never plain text.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { Admin } from "../lib/models/Admin";
import { hashPassword } from "../lib/password";

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set. Configure it in .env (see .env.example).");
    process.exit(1);
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB_NAME || "eternitycrm_website",
  });

  const email = (process.env.SEED_ADMIN_EMAIL || "admin@eternitycrm.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "password";

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`Seed: administrator already exists (${email}) — nothing to do.`);
  } else {
    await Admin.create({
      name: "Primary Administrator",
      email,
      passwordHash: hashPassword(password),
      role: "SUPER_ADMIN",
      isActive: true,
      createdBy: "seed",
    });
    console.log(`Seed: default administrator created (${email}, SUPER_ADMIN).`);
    console.log("Seed: change this password before production!");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
