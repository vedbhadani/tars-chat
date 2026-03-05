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
            <div className="flex flex-col gap-1 py-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-3 animate-pulse">
                        <div className="h-11 w-11 shrink-0 rounded-full bg-muted/60" />
                        <div className="flex-1 space-y-2.5 py-0.5">
                            <div className="h-3.5 w-28 rounded-md bg-muted/60" />
                            <div className="h-3 w-3/4 rounded-md bg-muted/40" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (currentUser === null) {
        return null;
    }

    if (filtered.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground/50">
                    {!searchQuery && "Click on People to start chatting"}
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
                        className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 active:scale-[0.98] ${isActive
                            ? "bg-primary/10 shadow-sm shadow-primary/5"
                            : "hover:bg-muted/50"
                            }`}
                    >
                        {/* Avatar with online indicator */}
                        <div className="relative shrink-0">
                            {conv.isGroup ? (
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-semibold text-primary">
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
                                    className="h-11 w-11 rounded-full object-cover ring-1 ring-border/30"
                                />
                            ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-semibold text-primary">
                                    {conv.otherUser?.name?.charAt(0).toUpperCase() ?? "?"}
                                </div>
                            )}
                            {!conv.isGroup && conv.otherUser?.online && (
                                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[2.5px] border-sidebar bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            )}
                        </div>

                        {/* Name and message preview */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className={`truncate text-sm ${conv.unreadCount > 0 ? "font-bold text-foreground" : "font-medium text-sidebar-foreground"}`}>
                                    {conv.isGroup ? `${conv.groupName} (${conv.memberCount})` : (conv.otherUser?.name ?? "Unknown User")}
                                </p>
                                {conv.lastMessage && (
                                    <span className={`shrink-0 text-[10px] tabular-nums ${conv.unreadCount > 0 ? "text-primary font-semibold" : "text-muted-foreground/70"}`}>
                                        {formatTime(conv.lastMessage.createdAt)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                                <p className={`truncate text-xs ${conv.unreadCount > 0 ? "text-foreground/80 font-medium" : "text-muted-foreground/70"}`}>
                                    {conv.lastMessage
                                        ? conv.lastMessage.senderId === currentUser._id
                                            ? `You: ${conv.lastMessage.content}`
                                            : conv.lastMessage.content
                                        : "No messages yet"}
                                </p>
                                {conv.unreadCount > 0 && (
                                    <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground shadow-sm shadow-primary/30">
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
