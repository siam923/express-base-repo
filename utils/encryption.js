// src/utils/encryption.js
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be a 64-character hex string (32 bytes)
const IV_LENGTH = 16; // For AES, this is always 16 bytes
// console.log("ENCRYPTION_KEY:", ENCRYPTION_KEY);
// Validate the encryption key
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes).");
}

export const encryptTokens = (tokens) => {
  // console.log("ENCRYPTION_KEY:", ENCRYPTION_KEY);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(JSON.stringify(tokens), "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decryptTokens = (encryptedData) => {
  const parts = encryptedData.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted data format. Expected IV and encrypted data separated by ':'");
  }
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
};
