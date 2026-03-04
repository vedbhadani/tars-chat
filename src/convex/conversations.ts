/**
 * Convex Conversations — Query & Mutation Stubs
 *
 * Handles conversation-related operations (create, list, get by ID).
 * TODO: Implement once Convex is initialized.
 */

// import { query, mutation } from "./_generated/server";
// import { v } from "convex/values";

// ── Queries ──────────────────────────────────────────────

// export const getConversations = query({
//   args: { participantId: v.string() },
//   handler: async (ctx, args) => {
//     // TODO: Filter conversations where participantId is in participants array
//     return await ctx.db.query("conversations").collect();
//   },
// });

// export const getConversation = query({
//   args: { id: v.id("conversations") },
//   handler: async (ctx, args) => {
//     return await ctx.db.get(args.id);
//   },
// });

// ── Mutations ────────────────────────────────────────────

// export const createConversation = mutation({
//   args: {
//     participants: v.array(v.string()),
//     isGroup: v.boolean(),
//     groupName: v.optional(v.string()),
//     groupImage: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     return await ctx.db.insert("conversations", {
//       ...args,
//     });
//   },
// });

// Placeholder export
export { };
