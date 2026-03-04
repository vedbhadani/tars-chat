import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Convex Messages API
 *
 * Handles message-related operations (send, list, mark as read).
 */

// ── Queries ──────────────────────────────────────────────

export const list = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();
    },
});

// ── Mutations ────────────────────────────────────────────

export const send = mutation({
    args: {
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("messages", {
            ...args,
            createdAt: Date.now(),
            deleted: false,
        });
        return messageId;
    },
});

export const remove = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.messageId, { deleted: true });
    },
});
