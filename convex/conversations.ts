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
