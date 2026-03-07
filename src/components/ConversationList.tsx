"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatRelativeTime } from "@/lib/utils";

interface ConversationListProps {
    searchQuery: string;
    onSelectConversation: (conversationId: Id<"conversations">) => void;
    activeConversationId?: string;
}

export function ConversationList({ searchQuery, onSelectConversation, activeConversationId }: ConversationListProps) {
    const { user: clerkUser } = useUser();
    const currentUser = useQuery(
        api.users.getUser,
        clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
    );

    const conversations = useQuery(
        api.conversations.getMyConversations,
        currentUser?._id ? { userId: currentUser._id } : "skip"
    );

    const allUsers = useQuery(api.users.getAllUsers) ?? [];

    // Filter conversations by search
    const filteredConversations = (conversations ?? []).filter((conv) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        if (conv.isGroup) return conv.groupName?.toLowerCase().includes(q);
        return conv.otherUser?.name?.toLowerCase().includes(q);
    });

    if (conversations === undefined) {
        return (
            <div className="flex flex-col gap-1 mt-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5 animate-pulse">
                        <div className="h-10 w-10 shrink-0 rounded-full" style={{ background: 'linear-gradient(135deg, #E8E0D4, #F5EDE3)' }} />
                        <div className="flex-1 space-y-2 py-0.5">
                            <div className="h-3.5 w-24 rounded-md" style={{ background: 'linear-gradient(135deg, #E8E0D4, #F5EDE3)' }} />
                            <div className="h-3 w-32 rounded-md" style={{ background: 'linear-gradient(135deg, #E8E0D4, #F5EDE3)', opacity: 0.6 }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (filteredConversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E8E0D4]/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#7A6A56]">
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-[#7A6A56]">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0.5">
            {filteredConversations.map((conv) => {
                const isActive = activeConversationId === conv._id;

                return (
                    <button
                        key={conv._id}
                        onClick={() => onSelectConversation(conv._id)}
                        className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-300 active:scale-[0.98] ${isActive
                            ? "bg-[#F5EDE3] shadow-[0_4px_15px_-4px_rgba(0,0,0,0.05)]"
                            : "hover:bg-[rgba(181,120,74,0.08)]"
                            }`}
                    >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            {conv.isGroup ? (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5EDE3] text-sm font-semibold text-[#B5784A]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                    className="h-10 w-10 rounded-full object-cover ring-1 ring-[#E8E0D4]"
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5EDE3] text-sm font-semibold text-[#B5784A]">
                                    {conv.otherUser?.name?.charAt(0).toUpperCase() ?? "?"}
                                </div>
                            )}
                            {!conv.isGroup && conv.otherUser?.online && (
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-[2px] border-[#F2EDE4] bg-[#34C759] shadow-[0_0_8px_rgba(52,199,89,0.4)]" />
                            )}
                        </div>

                        {/* Name and message preview */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className={`truncate text-sm ${isActive ? "font-bold text-[#B5784A]" : conv.unreadCount > 0 ? "font-bold text-[#1A1208]" : "font-medium text-[#1A1208]"}`}>
                                    {conv.isGroup ? `${conv.groupName} (${conv.memberCount})` : (conv.otherUser?.name ?? "Unknown User")}
                                </p>
                                {conv.lastMessage && (
                                    <span className="shrink-0 text-[10px] font-semibold text-[#7A6A56] tabular-nums">
                                        {formatRelativeTime(conv.lastMessage.createdAt)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                                <p className="truncate text-xs text-[#7A6A56]">
                                    {conv.lastMessage
                                        ? conv.lastMessage.content
                                        : "Start a conversation"}
                                </p>
                                {conv.unreadCount > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B5784A] px-1.5 text-[10px] font-bold text-[#FFFFFF]">
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
