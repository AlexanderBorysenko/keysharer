import { describe, expect, it } from "bun:test";
import { resolveAllowOrigin } from "./resolveAllowOrigin";

const requestWithOrigin = (origin: string): Request =>
	new Request("http://localhost:4000/", {
		headers: { origin },
	});

describe("resolveAllowOrigin", () => {
	it("allows the exact production origin", () => {
		expect(resolveAllowOrigin(requestWithOrigin("https://app.keysharer.com"))).toBe(
			"https://app.keysharer.com"
		);
	});

	it("blocks a suffix-bypass attempt on the production origin", () => {
		expect(
			resolveAllowOrigin(requestWithOrigin("https://app.keysharer.com.evil.com"))
		).toBe("");
	});

	it("allows a local Nuxt dev server origin", () => {
		expect(resolveAllowOrigin(requestWithOrigin("http://localhost:3000"))).toBe(
			"http://localhost:3000"
		);
	});

	it("blocks a suffix-bypass attempt on localhost", () => {
		expect(resolveAllowOrigin(requestWithOrigin("http://localhost.evil.com"))).toBe(
			""
		);
	});

	it("allows the Tauri webview origin", () => {
		expect(resolveAllowOrigin(requestWithOrigin("tauri://localhost"))).toBe(
			"tauri://localhost"
		);
	});

	it("allows the Windows Tauri webview (tauri.localhost) origin", () => {
		expect(resolveAllowOrigin(requestWithOrigin("http://tauri.localhost"))).toBe(
			"http://tauri.localhost"
		);
	});

	it("blocks an unrelated origin", () => {
		expect(resolveAllowOrigin(requestWithOrigin("https://evil.com"))).toBe("");
	});

	it("blocks a missing origin header (same-origin/non-browser request)", () => {
		const request = new Request("http://localhost:4000/");
		expect(resolveAllowOrigin(request)).toBe("");
	});
});
