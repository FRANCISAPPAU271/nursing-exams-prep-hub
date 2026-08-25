#!/usr/bin/env node
/**
 * Create or promote an administrator account.
 *
 *   npm run admin -- you@example.com "Your Name" YourStrongPassword
 *
 * If the email already exists it is promoted to admin (and the password is
 * updated when one is supplied). Admins can verify Mobile Money payments at
 * /dashboard/admin.
 */
import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import pg from "pg";

const [email, name, password] = process.argv.slice(2);

if (!email || !email.includes("@")) {
  console.error(
    '\nUsage: npm run admin -- you@example.com "Your Name" YourStrongPassword\n',
  );
  process.exit(1);
}
if (password && password.length < 8) {
  console.error("\n✗ Admin password must be at least 8 characters.\n");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("\n✗ DATABASE_URL is not set.\n");
  process.exit(1);
}

function hashPassword(pw) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
}

const pool = new pg.Pool({
  connectionString: url,
  ssl: /neon\.tech|supabase|render\.com|amazonaws|railway/.test(url)
    ? { rejectUnauthorized: false }
    : undefined,
});

const existing = await pool.query("select id from users where email = $1", [
  email.toLowerCase(),
]);

if (existing.rows.length) {
  if (password) {
    await pool.query(
      "update users set role='admin', password_hash=$2 where email=$1",
      [email.toLowerCase(), hashPassword(password)],
    );
    console.log(`\n✓ ${email} promoted to admin and password updated.\n`);
  } else {
    await pool.query("update users set role='admin' where email=$1", [
      email.toLowerCase(),
    ]);
    console.log(`\n✓ ${email} promoted to admin (password unchanged).\n`);
  }
} else {
  if (!password) {
    console.error("\n✗ New accounts need a password. Pass one as the third argument.\n");
    await pool.end();
    process.exit(1);
  }
  await pool.query(
    `insert into users (name, email, password_hash, role, plan)
     values ($1, $2, $3, 'admin', 'free')`,
    [name || "Administrator", email.toLowerCase(), hashPassword(password)],
  );
  console.log(`\n✓ Admin account created: ${email}\n`);
}

console.log("  Sign in, then open /dashboard/admin to verify MoMo payments.\n");
await pool.end();
