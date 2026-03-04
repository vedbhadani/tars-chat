/**
 * Convex Schema Definition
 *
 * Defines the database tables for the TARS Chat application.
 * TODO: Uncomment and activate once Convex is initialized with `npx convex dev`.
 */

// import { defineSchema, defineTable } from "convex/server";
// import { v } from "convex/values";

// export default defineSchema({
//   users: defineTable({
//     clerkId: v.string(),
//     name: v.string(),
//     email: v.string(),
//     imageUrl: v.optional(v.string()),
//     isOnline: v.boolean(),
//     lastSeen: v.number(),
//   }).index("by_clerkId", ["clerkId"]),
//
//   conversations: defineTable({
//     participants: v.array(v.string()),
//     lastMessageId: v.optional(v.id("messages")),
//     lastMessageAt: v.optional(v.number()),
//     isGroup: v.boolean(),
//     groupName: v.optional(v.string()),
//     groupImage: v.optional(v.string()),
//   }).index("by_participant", ["participants"]),
//
//   messages: defineTable({
//     conversationId: v.id("conversations"),
//     senderId: v.string(),
//     content: v.string(),
//     type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
//     isRead: v.boolean(),
//   }).index("by_conversation", ["conversationId"]),
// });

// Placeholder export to keep TypeScript happy
export { };
