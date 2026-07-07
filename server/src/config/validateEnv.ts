/**
 * Boot-time environment validation.
 *
 * Security-critical secrets (JWT signing key, at-rest encryption key) must
 * never be allowed to silently fall back to an empty/default value, so we
 * fail fast and loud before the server accepts any connection. Everything
 * else here is "needed for a feature to work correctly" rather than
 * "needed for the process to be safe to run", so it only warns.
 */
export function validateEnv(): void {
	const required = ["JWT_SECRET", "SECRET_KEY"] as const;
	const missing = required.filter((key) => !process.env[key]);

	if (missing.length > 0) {
		throw new Error(
			`Missing required environment variable(s): ${missing.join(", ")}. ` +
				"These are security-critical (JWT signing / at-rest encryption) and the server refuses to start without them."
		);
	}

	const recommended = [
		"COOKIE_DOMAIN",
		"EMAIL_USER",
		"EMAIL_PASSWORD",
	] as const;
	const missingRecommended = recommended.filter((key) => !process.env[key]);

	if (missingRecommended.length > 0) {
		console.warn(
			`[validateEnv] Missing environment variable(s): ${missingRecommended.join(", ")}. ` +
				"Cookie and/or email functionality may not work correctly until these are set."
		);
	}
}
