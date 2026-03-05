import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Convex Conversations API
 *
 * Handles conversation-related operations (create, list, get by ID).
 */

// ── Queries ──────────────────────────────────────────────

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("conversations").collect();
    },
});

export const get = query({
    args: { id: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

/**
 * Get all conversations for a user, enriched with:
 * - The other member's name, image, and online status
 * - The latest message preview and timestamp
 * Sorted by most recent message first.
 */
export const getMyConversations = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const allConversations = await ctx.db.query("conversations").collect();

        // Filter to only conversations this user is in
        const myConversations = allConversations.filter((c) =>
            c.members.includes(args.userId)
        );

        // Enrich each conversation with other user info and latest message
        const enriched = await Promise.all(
            myConversations.map(async (conv) => {
                // Get the other member(s)
                const otherMemberIds = conv.members.filter((m) => m !== args.userId);
                const otherMember = otherMemberIds.length > 0
                    ? await ctx.db.get(otherMemberIds[0])
                    : null;

                // Get the latest message and calculate unread count
                const messages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversationId", (q) =>
                        q.eq("conversationId", conv._id)
                    )
                    .collect();

                // Sort by createdAt descending and pick the first
                const latestMessage = messages.length > 0
                    ? messages.sort((a, b) => b.createdAt - a.createdAt)[0]
                    : null;

                // Find the current user's read receipt for this conversation
                const readReceipt = await ctx.db
                    .query("readReceipts")
                    .withIndex("by_conversation_user", (q) =>
                        q.eq("conversationId", conv._id).eq("userId", args.userId)
                    )
                    .unique();

                const lastReadTime = readReceipt?.lastReadTime ?? 0;

                // Count messages sent by others that are newer than lastReadTime
                const unreadCount = messages.filter(
                    (m) => m.senderId !== args.userId && m.createdAt > lastReadTime
                ).length;

                return {
                    _id: conv._id,
                    isGroup: conv.isGroup,
                    groupName: conv.groupName,
                    memberCount: conv.members.length,
                    otherUser: !conv.isGroup && otherMember
                        ? {
                            _id: otherMember._id,
                            name: otherMember.name,
                            image: otherMember.image,
                            online: otherMember.online,
                        }
                        : null,
                    lastMessage: latestMessage
                        ? {
                            content: latestMessage.deleted
                                ? "This message was deleted"
                                : latestMessage.content,
                            createdAt: latestMessage.createdAt,
                            senderId: latestMessage.senderId,
                        }
                        : null,
                    unreadCount,
                    // For sorting — use latest message time, or conversation creation time
                    sortKey: latestMessage?.createdAt ?? conv._creationTime,
                };
            })
        );

        // Sort by most recent first
        return enriched.sort((a, b) => b.sortKey - a.sortKey);
    },
});

/**
 * Find an existing 1-on-1 conversation between two users.
 */
export const getDirectConversation = query({
    args: {
        userA: v.id("users"),
        userB: v.id("users"),
    },
    handler: async (ctx, args) => {
        const allConversations = await ctx.db.query("conversations").collect();
        return (
            allConversations.find(
                (c) =>
                    c.members.length === 2 &&
                    c.members.includes(args.userA) &&
                    c.members.includes(args.userB)
            ) ?? null
        );
    },
});

// ── Mutations ────────────────────────────────────────────

export const create = mutation({
    args: {
        members: v.array(v.id("users")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("conversations", {
            members: args.members,
        });
    },
});

export const createGroup = mutation({
    args: {
        members: v.array(v.id("users")),
        groupName: v.string(),
    },
    handler: async (ctx, args) => {
        // Enforce at least 3 members for a group (creator + 2 others)
        // or just accept however many the UI sends, but typically > 2.
        return await ctx.db.insert("conversations", {
            members: args.members,
            isGroup: true,
            groupName: args.groupName,
        });
    },
});

/**
 * Create a 1-on-1 conversation if one doesn't already exist.
 * Returns the existing conversation ID if found, or creates a new one.
 */
export const getOrCreateDirectConversation = mutation({
    args: {
        userA: v.id("users"),
        userB: v.id("users"),
    },
    handler: async (ctx, args) => {
        const allConversations = await ctx.db.query("conversations").collect();
        const existing = allConversations.find(
            (c) =>
                c.members.length === 2 &&
                c.members.includes(args.userA) &&
                c.members.includes(args.userB)
        );

        if (existing) {
            return existing._id;
        }

        return await ctx.db.insert("conversations", {
            members: [args.userA, args.userB],
        });
    },
});
