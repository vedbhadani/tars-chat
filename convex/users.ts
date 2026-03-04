import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Convex Users API
 *
 * Handles user synchronization and fetching from Clerk.
 */

// ── Queries ──────────────────────────────────────────────

export const getUser = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();
    },
});

export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    },
});

// ── Mutations ────────────────────────────────────────────

/**
 * Syncs a user from Clerk to Convex.
 * If the user (by clerkId) does not exist, it creates a new record.
 * If the user exists, it updates their name, image, and sets them online.
 */
export const createUserIfNotExists = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        image: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if the user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existingUser) {
            // User exists — update their info and mark online
            await ctx.db.patch(existingUser._id, {
                name: args.name,
                image: args.image ?? "",
                online: true,
            });
            return existingUser._id;
        }

        // User is new — insert them into the DB
        return await ctx.db.insert("users", {
            clerkId: args.clerkId,
            name: args.name,
            image: args.image ?? "",
            online: true,
        });
    },
});

export const setUserOffline = mutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, { online: false });
        }
    },
});
