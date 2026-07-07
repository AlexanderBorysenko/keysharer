// Exact-match set for known production origin(s). CLIENT_URL is the
// server-side env var for the frontend's public origin (see env.d.ts /
// .env-template) — in production it should be the app's real domain; the
// hardcoded value stays as a fallback so nothing breaks if it's unset.
const PROD_ALLOWED_ORIGINS = new Set(
	[process.env.CLIENT_URL, "https://app.keysharer.com"].filter(
		(origin): origin is string => Boolean(origin)
	)
);

// Anchored (not substring) match for legitimate local/Tauri origins:
// - Nuxt dev server: http://localhost:3000 (frontend/nuxt.config.ts devServer.port)
// - Tauri webview dev: http://localhost:3000 (frontend/src-tauri/tauri.conf.json build.devUrl)
// - Tauri webview packaged app: tauri://localhost (macOS/Linux) or
//   http(s)://tauri.localhost (Windows WebView2) — tauri.conf.json doesn't pin a
//   platform, so both schemes are covered here.
// Anchoring with ^...$ means a suffix like "http://localhost.evil.com" cannot pass.
const LOCAL_ORIGIN_PATTERN =
	/^(https?:\/\/localhost(:\d+)?|tauri:\/\/localhost|https?:\/\/tauri\.localhost)$/;

/**
 * Resolves the `Access-Control-Allow-Origin` value for a request: the
 * request's own origin if (and only if) it's an allowed one, otherwise ''
 * (which callers use to mean "no CORS access-control-allow-origin header").
 *
 * Exported as a pure function (no DB/network access) so it's unit-testable
 * without booting the server.
 */
export const resolveAllowOrigin = (request: Request): string => {
	const requestOrigin = request.headers.get("origin") || "";
	if (
		PROD_ALLOWED_ORIGINS.has(requestOrigin) ||
		LOCAL_ORIGIN_PATTERN.test(requestOrigin)
	) {
		return requestOrigin;
	}
	return "";
};
