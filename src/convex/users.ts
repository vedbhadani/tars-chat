/**
 * Convex Users — Query & Mutation Stubs
 *
 * Handles user-related operations (create, fetch, update status).
 * TODO: Implement once Convex is initialized.
 */

// import { query, mutation } from "./_generated/server";
// import { v } from "convex/values";

// ── Queries ──────────────────────────────────────────────

// export const getUser = query({
//   args: { clerkId: v.string() },
//   handler: async (ctx, args) => {
//     return await ctx.db
//       .query("users")
//       .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
//       .unique();
//   },
// });

// export const getAllUsers = query({
//   args: {},
//   handler: async (ctx) => {
//     return await ctx.db.query("users").collect();
//   },
// });

// ── Mutations ────────────────────────────────────────────

// export const createUser = mutation({
//   args: {
//     clerkId: v.string(),
//     name: v.string(),
//     email: v.string(),
//     imageUrl: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     return await ctx.db.insert("users", {
//       ...args,
//       isOnline: true,
//       lastSeen: Date.now(),
//     });
//   },
// });

// export const updateUserStatus = mutation({
//   args: { clerkId: v.string(), isOnline: v.boolean() },
//   handler: async (ctx, args) => {
//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
//       .unique();
//     if (user) {
//       await ctx.db.patch(user._id, {
//         isOnline: args.isOnline,
//         lastSeen: Date.now(),
//       });
//     }
//   },
// });

// Placeholder export
export { };
