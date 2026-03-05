import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Database Schema
 *
 * This is the main schema file for the Convex backend, designed for scalable real-time chat.
 */
export default defineSchema({
    // Users table stores the application users synced from Clerk.
    users: defineTable({
        // clerkId links the Convex user record to the Clerk authentication identity.
        clerkId: v.string(),
        // User's display name, used for rendering in chat UI.
        name: v.string(),
        // URL to the user's avatar image.
        image: v.string(),
        // Indicates if the user is currently online/active in the application.
        online: v.boolean(),
        // Timestamp of when the user was last seen online.
        lastSeen: v.optional(v.number()),
    }).index("by_clerkId", ["clerkId"]),

    // Conversations table tracks chat sessions between groups of users.
    conversations: defineTable({
        // Array of user IDs participating in this conversation.
        // Storing it as an array allows for 1-on-1 and group chats natively.
        members: v.array(v.id("users")),
    }),

    // Messages table stores the actual chat messages sent within conversations.
    messages: defineTable({
        // The ID of the conversation this message belongs to.
        conversationId: v.id("conversations"),
        // The ID of the user who sent this message.
        senderId: v.id("users"),
        // The text content of the message.
        content: v.string(),
        // Timestamp when the message was sent (for sorting and display).
        createdAt: v.number(),
        // Soft-delete flag. Instead of permanently deleting records, we mark them deleted.
        // This allows message tombstones (e.g., "This message was deleted").
        deleted: v.boolean(),
    })
        // Indexing by conversationId ensures fast loading of message history for a specific chat.
        .index("by_conversationId", ["conversationId"]),

    // Typing table tracks which users are actively typing in a specific conversation.
    // This powers the "User is typing..." indicator in real-time.
    typing: defineTable({
        // The conversation where typing is occurring.
        conversationId: v.id("conversations"),
        // The user who is currently typing.
        userId: v.id("users"),
        // Timestamp used to automatically expire/clear old typing indicators.
        updatedAt: v.number(),
    })
        // Indexing allows quick cleanup and efficient querying of typing users per conversation.
        .index("by_conversation_user", ["conversationId", "userId"]),
});
