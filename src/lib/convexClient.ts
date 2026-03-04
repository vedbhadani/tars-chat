/**
 * Convex Client Utilities
 *
 * Helper types and constants for working with Convex in this project.
 *
 * ── Environment Variables ───────────────────────────────
 * Convex requires the following environment variables in .env.local:
 *
 *   CONVEX_DEPLOYMENT=dev:<your-deployment-name>
 *   NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
 *
 * These are automatically set when you run `npx convex dev`.
 *
 * ── Using Convex in Components ──────────────────────────
 * The app is wrapped with <ConvexClientProvider> in layout.tsx,
 * so you can use Convex hooks anywhere in client components:
 *
 *   import { useQuery, useMutation } from "convex/react";
 *   import { api } from "../../convex/_generated/api";
 *
 *   // Read data (auto-updates in real-time)
 *   const messages = useQuery(api.messages.list);
 *
 *   // Write data
 *   const sendMessage = useMutation(api.messages.send);
 *   await sendMessage({ content: "Hello!" });
 */

export const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";

/**
 * Type representing the Clerk user fields we sync to Convex.
 */
export interface SyncableUser {
    clerkId: string;
    name: string;
    email: string;
    imageUrl?: string;
}
