import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { validateEnv } from "./validateEnv";

const SNAPSHOT_KEYS = [
	"JWT_SECRET",
	"SECRET_KEY",
	"COOKIE_DOMAIN",
	"EMAIL_USER",
	"EMAIL_PASSWORD",
] as const;

let snapshot: Record<string, string | undefined>;

beforeEach(() => {
	snapshot = {};
	for (const key of SNAPSHOT_KEYS) {
		snapshot[key] = process.env[key];
		delete process.env[key];
	}
});

afterEach(() => {
	for (const key of SNAPSHOT_KEYS) {
		const value = snapshot[key];
		if (value === undefined) {
			delete process.env[key];
		} else {
			process.env[key] = value;
		}
	}
});

describe("validateEnv", () => {
	it("throws listing all missing required vars when both JWT_SECRET and SECRET_KEY are unset", () => {
		expect(() => validateEnv()).toThrow(/JWT_SECRET/);
		expect(() => validateEnv()).toThrow(/SECRET_KEY/);
	});

	it("throws when only JWT_SECRET is unset", () => {
		process.env.SECRET_KEY = "some-secret-key";
		expect(() => validateEnv()).toThrow(/JWT_SECRET/);
	});

	it("throws when only SECRET_KEY is unset", () => {
		process.env.JWT_SECRET = "some-jwt-secret";
		expect(() => validateEnv()).toThrow(/SECRET_KEY/);
	});

	it("throws when SECRET_KEY is set to an empty string", () => {
		process.env.JWT_SECRET = "some-jwt-secret";
		process.env.SECRET_KEY = "";
		expect(() => validateEnv()).toThrow(/SECRET_KEY/);
	});

	it("does not throw when JWT_SECRET and SECRET_KEY are both set, even if optional vars are missing", () => {
		process.env.JWT_SECRET = "some-jwt-secret";
		process.env.SECRET_KEY = "some-secret-key";
		expect(() => validateEnv()).not.toThrow();
	});

	it("does not throw when all vars (required + recommended) are set", () => {
		process.env.JWT_SECRET = "some-jwt-secret";
		process.env.SECRET_KEY = "some-secret-key";
		process.env.COOKIE_DOMAIN = "localhost";
		process.env.EMAIL_USER = "noreply@keysharer.com";
		process.env.EMAIL_PASSWORD = "app-password";
		expect(() => validateEnv()).not.toThrow();
	});
});
