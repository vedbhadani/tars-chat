import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Convex Typing API
 *
 * Manages real-time typing indicators for conversations.
 */

// ── Queries ──────────────────────────────────────────────

/**
 * Get users currently typing in a conversation.
 * Only returns entries updated within the last 3 seconds (to auto-expire stale indicators).
 */
export const getTyping = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const entries = await ctx.db
            .query("typing")
            .withIndex("by_conversation_user", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        const now = Date.now();
        // Only return entries updated within the last 3 seconds
        const active = entries.filter((e) => now - e.updatedAt < 3000);

        // Enrich with user info
        const typingUsers = await Promise.all(
            active.map(async (entry) => {
                const user = await ctx.db.get(entry.userId);
                return user ? { userId: user._id, name: user.name } : null;
            })
        );

        return typingUsers.filter(Boolean);
    },
});

// ── Mutations ────────────────────────────────────────────

/**
 * Signal that a user is typing in a conversation.
 * Creates or updates the typing record with the current timestamp.
 */
export const startTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Check if a record already exists
        const existing = await ctx.db
            .query("typing")
            .withIndex("by_conversation_user", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", args.userId)
            )
            .unique();

        if (existing) {
            // Update the timestamp
            await ctx.db.patch(existing._id, { updatedAt: Date.now() });
        } else {
            // Create a new typing record
            await ctx.db.insert("typing", {
                conversationId: args.conversationId,
                userId: args.userId,
                updatedAt: Date.now(),
            });
        }
    },
});

/**
 * Signal that a user stopped typing (e.g. they sent a message).
 * Removes the typing record entirely.
 */
export const stopTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("typing")
            .withIndex("by_conversation_user", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", args.userId)
            )
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});
