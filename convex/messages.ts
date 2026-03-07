import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

/**
 * Convex Messages API
 *
 * Handles message-related operations (send, list, mark as read).
 */

// ── Queries ──────────────────────────────────────────────

export const list = query({
    args: {
        conversationId: v.id("conversations"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .order("desc")
            .paginate(args.paginationOpts);
    },
});

export const getReadReceipt = query({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("readReceipts")
            .withIndex("by_conversation_user", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", args.userId)
            )
            .unique();
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
    args: {
        messageId: v.id("messages"),
        senderId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");
        if (message.senderId !== args.senderId) {
            throw new Error("You can only delete your own messages");
        }
        await ctx.db.patch(args.messageId, {
            deleted: true,
            content: "",
        });
    },
});

export const markRead = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Find existing receipt
        const existing = await ctx.db
            .query("readReceipts")
            .withIndex("by_conversation_user", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", args.userId)
            )
            .unique();

        const now = Date.now();

        if (existing) {
            await ctx.db.patch(existing._id, { lastReadTime: now });
        } else {
            await ctx.db.insert("readReceipts", {
                conversationId: args.conversationId,
                userId: args.userId,
                lastReadTime: now,
            });
        }
    },
});
