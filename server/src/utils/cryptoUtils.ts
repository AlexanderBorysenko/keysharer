import crypto from "crypto";

const algorithm = "aes-256-cbc"; // Encryption algorithm
// validateEnv() hard-fails at boot if SECRET_KEY is unset, so it is safe to assert non-null here.
const secretKey = process.env.SECRET_KEY!; // Key should be 32 bytes
const ivLength = 16; // Recommended length for GCM
// TODO(deferred hardening, out of scope for this pass): migrate to AES-256-GCM with a per-record salt instead of the static "salt" used below.

export const encrypt = (text: string): string => {
	const iv = crypto.randomBytes(ivLength);
	const key = crypto.scryptSync(secretKey, "salt", 32);
	const cipher = crypto.createCipheriv(algorithm, key, iv);
	const encrypted = Buffer.concat([
		cipher.update(text, "utf8"),
		cipher.final(),
	]);
	return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

export function decrypt(encryptedData: string): string {
	const [ivHex, encryptedHex] = encryptedData.split(":");
	const iv = Buffer.from(ivHex, "hex");
	const encryptedText = Buffer.from(encryptedHex, "hex");
	const key = crypto.scryptSync(secretKey, "salt", 32);
	const decipher = crypto.createDecipheriv(algorithm, key, iv);
	const decrypted = Buffer.concat([
		decipher.update(encryptedText),
		decipher.final(),
	]);
	return decrypted.toString("utf8");
}
