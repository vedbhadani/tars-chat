"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

/**
 * Convex React client — connects to your Convex deployment.
 *
 * The URL is read from the NEXT_PUBLIC_CONVEX_URL environment variable,
 * which is automatically set when you run `npx convex dev`.
 *
 * Make sure your .env.local contains:
 *   NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
 */
const convex = new ConvexReactClient(
    process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
