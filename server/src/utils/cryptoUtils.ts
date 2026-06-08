import crypto from "crypto";

const algorithm = "aes-256-cbc"; // Encryption algorithm
const secretKey = process.env.SECRET_KEY || "your_secret_key_here"; // Key should be 32 bytes
const ivLength = 16; // Recommended length for GCM

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
