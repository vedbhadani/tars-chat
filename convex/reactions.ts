import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Convex Reactions API
 *
 * Handles emoji reactions on messages (toggle add/remove, list by message).
 */

// ── Query ────────────────────────────────────────────────

/**
 * Get all reactions for a list of messages in a conversation.
 * Returns a map: { messageId -> { emoji -> { count, userIds } } }
 */
export const getForConversation = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        // Get all message IDs in this conversation
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        const messageIds = messages.map((m) => m._id);

        // Fetch all reactions for these messages
        const reactionsMap: Record<
            string,
            Record<string, { count: number; userIds: string[] }>
        > = {};

        for (const messageId of messageIds) {
            const reactions = await ctx.db
                .query("reactions")
                .withIndex("by_messageId", (q) => q.eq("messageId", messageId))
                .collect();

            if (reactions.length === 0) continue;

            const grouped: Record<string, { count: number; userIds: string[] }> = {};
            for (const r of reactions) {
                if (!grouped[r.emoji]) {
                    grouped[r.emoji] = { count: 0, userIds: [] };
                }
                grouped[r.emoji].count++;
                grouped[r.emoji].userIds.push(r.userId);
            }

            reactionsMap[messageId] = grouped;
        }

        return reactionsMap;
    },
});

// ── Mutations ────────────────────────────────────────────

/**
 * Toggle a reaction on a message.
 * If the user already reacted with this emoji, remove it.
 * If not, add it.
 */
export const toggle = mutation({
    args: {
        messageId: v.id("messages"),
        userId: v.id("users"),
        emoji: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if reaction already exists
        const existing = await ctx.db
            .query("reactions")
            .withIndex("by_message_user_emoji", (q) =>
                q
                    .eq("messageId", args.messageId)
                    .eq("userId", args.userId)
                    .eq("emoji", args.emoji)
            )
            .unique();

        if (existing) {
            // Remove the reaction
            await ctx.db.delete(existing._id);
            return { action: "removed" };
        } else {
            // Add the reaction
            await ctx.db.insert("reactions", {
                messageId: args.messageId,
                userId: args.userId,
                emoji: args.emoji,
            });
            return { action: "added" };
        }
    },
});
