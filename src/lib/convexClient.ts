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

// ── Clerk ↔ Convex User Sync Helper ─────────────────────
//
// Call this after a user signs in / signs up via Clerk webhook
// or from a client-side effect, to upsert the user into Convex.
//
// Example usage in a "use client" component:
//
//   import { useUser } from "@clerk/nextjs";
//   import { useMutation } from "convex/react";
//   import { api } from "@/convex/_generated/api";
//
//   const { user } = useUser();
//   const createOrUpdateUser = useMutation(api.users.createUser);
//
//   useEffect(() => {
//     if (user) {
//       createOrUpdateUser({
//         clerkId: user.id,
//         name: user.fullName ?? user.username ?? "Anonymous",
//         email: user.primaryEmailAddress?.emailAddress ?? "",
//         imageUrl: user.imageUrl,
//       });
//     }
//   }, [user, createOrUpdateUser]);

/**
 * Type representing the Clerk user fields we sync to Convex.
 */
export interface SyncableUser {
    clerkId: string;
    name: string;
    email: string;
    imageUrl?: string;
}
