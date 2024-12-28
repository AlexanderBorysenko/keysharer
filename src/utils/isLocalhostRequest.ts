import type { AppQraphQLContext } from "../../types/AppQraphQLContext";

export const isLocalhostRequest = (context: AppQraphQLContext) => {
    return context.request.headers.get("origin")?.includes("localhost")
}