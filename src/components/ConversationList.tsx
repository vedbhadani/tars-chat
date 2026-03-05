"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ConversationListProps {
    searchQuery: string;
    onSelectConversation: (conversationId: Id<"conversations">) => void;
    activeConversationId?: string;
}

function formatTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

export function ConversationList({
    searchQuery,
    onSelectConversation,
    activeConversationId,
}: ConversationListProps) {
    const { user: clerkUser } = useUser();
    const currentUser = useQuery(
        api.users.getUser,
        clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
    );
    const conversations = useQuery(
        api.conversations.getMyConversations,
        currentUser?._id ? { userId: currentUser._id } : "skip"
    );

    // Filter by search query (match group name or other user's name)
    const filtered = (conversations ?? []).filter((c) => {
        if (!searchQuery) return true;
        const targetName = c.isGroup ? c.groupName : c.otherUser?.name;
        return targetName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
    });

    if (conversations === undefined || currentUser === undefined) {
        return (
            <div className="flex flex-col gap-0.5 px-2 py-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-3 animate-pulse">
                        <div className="h-11 w-11 shrink-0 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 w-24 rounded bg-muted" />
                            <div className="h-3 w-3/4 rounded bg-muted" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (currentUser === null) {
        return null; // Or some fallback if user isn't found in Convex
    }

    if (filtered.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                    {!searchQuery && "Click a user below to start chatting"}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0.5">
            {filtered.map((conv) => {
                const isActive = activeConversationId === conv._id;
                return (
                    <button
                        key={conv._id}
                        onClick={() => onSelectConversation(conv._id)}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-all active:scale-[0.98] ${isActive
                            ? "bg-primary/10 ring-1 ring-primary/20"
                            : "hover:bg-sidebar-accent"
                            }`}
                    >
                        {/* Avatar with online indicator */}
                        <div className="relative shrink-0">
                            {conv.isGroup ? (
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                            ) : conv.otherUser?.image ? (
                                <img
                                    src={conv.otherUser.image}
                                    alt={conv.otherUser.name}
                                    className="h-11 w-11 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                                    {conv.otherUser?.name?.charAt(0).toUpperCase() ?? "?"}
                                </div>
                            )}
                            {!conv.isGroup && conv.otherUser?.online && (
                                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-sidebar bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                            )}
                        </div>

                        {/* Name and message preview */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className={`truncate text-sm font-medium ${conv.unreadCount > 0 ? "text-foreground font-bold" : "text-sidebar-foreground"}`}>
                                    {conv.isGroup ? `${conv.groupName} (${conv.memberCount})` : (conv.otherUser?.name ?? "Unknown User")}
                                </p>
                                {conv.lastMessage && (
                                    <span className={`shrink-0 text-[10px] ${conv.unreadCount > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                                        {formatTime(conv.lastMessage.createdAt)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                                <p className={`truncate text-xs ${conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                    {conv.lastMessage
                                        ? conv.lastMessage.senderId === currentUser._id
                                            ? `You: ${conv.lastMessage.content}`
                                            : conv.lastMessage.content
                                        : "No messages yet"}
                                </p>
                                {conv.unreadCount > 0 && (
                                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                                        {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
