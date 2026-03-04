/**
 * Convex Client Configuration
 *
 * This file sets up the Convex client for use throughout the application.
 * TODO: Initialize once CONVEX_URL environment variable is configured.
 *
 * Usage (once configured):
 *   import { ConvexProvider, ConvexReactClient } from "convex/react";
 *   const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
 *
 * Then wrap your app with:
 *   <ConvexProvider client={convex}>...</ConvexProvider>
 */

// Placeholder: Convex URL will be read from environment variables
export const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";

/**
 * Initialize the Convex client.
 * Uncomment below once `convex` package is fully configured:
 *
 * import { ConvexReactClient } from "convex/react";
 * export const convexClient = new ConvexReactClient(CONVEX_URL);
 */
