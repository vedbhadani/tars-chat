"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ConversationListProps {
    searchQuery: string;
    onSelectConversation: (id: Id<"conversations">) => void;
    activeConversationId?: string;
}

function formatTime(ts: number): string {
    const now = Date.now();
    const diff = now - ts;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    if (hrs < 24) return `${hrs}h`;
    if (days < 7) return `${days}d`;
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
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

    if (!currentUser || conversations === undefined) {
        return (
            <div className="flex flex-col gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-3 animate-pulse">
                        <div className="h-11 w-11 shrink-0 rounded-full bg-[#e3d5ca]/60" />
                        <div className="flex-1 space-y-2 py-0.5">
                            <div className="h-3.5 w-28 rounded-md bg-[#e3d5ca]/60" />
                            <div className="h-3 w-40 rounded-md bg-[#e3d5ca]/40" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const filtered = (conversations ?? []).filter((conv) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        if (conv.isGroup && conv.groupName) {
            return conv.groupName.toLowerCase().includes(q);
        }
        return conv.otherUser?.name?.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#e3d5ca]/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#7a6a5e]">
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-[#7a6a5e]">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
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
                            ? "bg-[#f5ebe0] shadow-sm ring-1 ring-[#d5bdaf]/30"
                            : "hover:bg-[#e3d5ca]/40"
                            }`}
                    >
                        {/* Avatar with online indicator */}
                        <div className="relative shrink-0">
                            {conv.isGroup ? (
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d5bdaf]/20 text-sm font-semibold text-[#8b6f5e] ring-1 ring-[#d5bdaf]/20">
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
                                    className="h-11 w-11 rounded-full object-cover ring-1 ring-[#c4b5a8] transition-all duration-200 group-hover:ring-[#d5bdaf]"
                                />
                            ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d5bdaf]/20 text-sm font-semibold text-[#8b6f5e] ring-1 ring-[#d5bdaf]/20">
                                    {conv.otherUser?.name?.charAt(0).toUpperCase() ?? "?"}
                                </div>
                            )}
                            {!conv.isGroup && conv.otherUser?.online && (
                                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[2.5px] border-[#d6ccc2] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                            )}
                        </div>

                        {/* Name and message preview */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className={`truncate text-sm ${conv.unreadCount > 0 ? "font-bold text-[#3d2c2c]" : "font-medium text-[#3d2c2c]/90"}`}>
                                    {conv.isGroup ? `${conv.groupName} (${conv.memberCount})` : (conv.otherUser?.name ?? "Unknown User")}
                                </p>
                                {conv.lastMessage && (
                                    <span className={`shrink-0 text-[10px] tabular-nums ${conv.unreadCount > 0 ? "text-[#8b6f5e] font-bold" : "text-[#7a6a5e]/60"}`}>
                                        {formatTime(conv.lastMessage.createdAt)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                                <p className={`truncate text-xs ${conv.unreadCount > 0 ? "text-[#3d2c2c] font-semibold" : "text-[#7a6a5e]/70"}`}>
                                    {conv.lastMessage
                                        ? conv.lastMessage.senderId === currentUser._id
                                            ? `You: ${conv.lastMessage.content}`
                                            : conv.lastMessage.content
                                        : "Start a conversation"}
                                </p>
                                {conv.unreadCount > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d5bdaf] px-1.5 text-[10px] font-bold text-[#3d2c2c]">
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
