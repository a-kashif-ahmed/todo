// ─────────────────────────────────────────────────────────────
// lib/ai/keyEncryption.ts
// Encrypts user-provided BYOK API keys before they're stored in
// flowlens_teams.ai_settings. Requires KEY_ENCRYPTION_SECRET — a 32-byte
// hex string — in the environment. Generate one with:
//   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// Add it to .env.local and to your deployment's environment variables.
// Never commit the actual secret value.
// ─────────────────────────────────────────────────────────────

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

function getSecret(): Buffer {
  const hex = process.env.KEY_ENCRYPTION_SECRET;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "KEY_ENCRYPTION_SECRET is missing or not a 32-byte hex string. Generate one with " +
      "`node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"` and set it in your environment."
    );
  }
  return Buffer.from(hex, "hex");
}

export function encryptApiKey(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, getSecret(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${enc.toString("hex")}`;
}

export function decryptApiKey(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(":");
  if (!ivHex || !tagHex || !dataHex) throw new Error("Malformed encrypted key payload.");
  const decipher = createDecipheriv(ALGO, getSecret(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}

// For displaying in Settings without ever sending the real key back to the client.
export function maskApiKey(plain: string): string {
  if (plain.length <= 4) return "••••";
  return `••••••••${plain.slice(-4)}`;
}
