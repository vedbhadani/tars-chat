/**
 * Convex Messages — Query & Mutation Stubs
 *
 * Handles message-related operations (send, list, mark as read).
 * TODO: Implement once Convex is initialized.
 */

// import { query, mutation } from "./_generated/server";
// import { v } from "convex/values";

// ── Queries ──────────────────────────────────────────────

// export const getMessages = query({
//   args: { conversationId: v.id("conversations") },
//   handler: async (ctx, args) => {
//     return await ctx.db
//       .query("messages")
//       .withIndex("by_conversation", (q) =>
//         q.eq("conversationId", args.conversationId)
//       )
//       .collect();
//   },
// });

// ── Mutations ────────────────────────────────────────────

// export const sendMessage = mutation({
//   args: {
//     conversationId: v.id("conversations"),
//     senderId: v.string(),
//     content: v.string(),
//     type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
//   },
//   handler: async (ctx, args) => {
//     const messageId = await ctx.db.insert("messages", {
//       ...args,
//       isRead: false,
//     });
//     // Update conversation's last message
//     await ctx.db.patch(args.conversationId, {
//       lastMessageId: messageId,
//       lastMessageAt: Date.now(),
//     });
//     return messageId;
//   },
// });

// export const markAsRead = mutation({
//   args: { messageId: v.id("messages") },
//   handler: async (ctx, args) => {
//     await ctx.db.patch(args.messageId, { isRead: true });
//   },
// });

// Placeholder export
export { };
