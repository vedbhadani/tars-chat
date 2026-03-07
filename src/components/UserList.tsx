"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface UserListProps {
    searchQuery: string;
    onConversationReady: (conversationId: Id<"conversations">) => void;
}

export function UserList({ searchQuery, onConversationReady }: UserListProps) {
    const { user: clerkUser } = useUser();
    const allUsers = useQuery(api.users.getAllUsers);
    const currentUser = useQuery(
        api.users.getUser,
        clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
    );
    const getOrCreate = useMutation(api.conversations.getOrCreateDirectConversation);

    // Filter out the current user and apply search
    const filteredUsers = (allUsers ?? []).filter((u) => {
        // Exclude self
        if (currentUser && u._id === currentUser._id) return false;
        // Apply search filter
        if (searchQuery) {
            return u.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    const handleUserClick = async (targetUserId: Id<"users">) => {
        if (!currentUser) return;
        try {
            const conversationId = await getOrCreate({
                userA: currentUser._id,
                userB: targetUserId,
            });
            onConversationReady(conversationId);
        } catch (err) {
            console.error("Failed to create conversation:", err);
        }
    };

    if (allUsers === undefined) {
        return (
            <div className="flex flex-col gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5 animate-pulse">
                        <div className="h-10 w-10 shrink-0 rounded-full" style={{ background: 'linear-gradient(135deg, #E8E0D4, #F5EDE3)' }} />
                        <div className="flex-1 space-y-2 py-0.5">
                            <div className="h-3.5 w-24 rounded-md" style={{ background: 'linear-gradient(135deg, #E8E0D4, #F5EDE3)' }} />
                            <div className="h-3 w-16 rounded-md" style={{ background: 'linear-gradient(135deg, #E8E0D4, #F5EDE3)', opacity: 0.6 }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (filteredUsers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E8E0D4]/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#7A6A56]">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-[#7A6A56]">
                    {searchQuery ? "No users found" : "No other users yet"}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0.5">
            <h4 className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#B0A090]">
                People ({filteredUsers.length})
            </h4>
            {filteredUsers.map((u) => (
                <button
                    key={u._id}
                    onClick={() => handleUserClick(u._id)}
                    className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-300 hover:bg-[rgba(181,120,74,0.08)] active:scale-[0.98]"
                >
                    {/* Avatar with online indicator */}
                    <div className="relative shrink-0">
                        {u.image ? (
                            <div className="relative h-10 w-10 rounded-full shadow-sm">
                                <img
                                    src={u.image}
                                    alt={u.name}
                                    className="h-full w-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5EDE3] text-sm font-semibold text-[#B5784A] shadow-sm transition-all duration-300 group-hover:bg-[#FFFFFF]">
                                {u.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {/* Online/offline dot */}
                        <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-[2px] border-[#F2EDE4] transition-colors ${u.online
                                ? "bg-[#34C759] shadow-[0_0_8px_rgba(52,199,89,0.4)]"
                                : "bg-[#B0A090]"
                                }`}
                        />
                    </div>

                    {/* Name and status */}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#1A1208]">
                            {u.name}
                        </p>
                        <p className={`text-xs transition-colors ${u.online ? "text-[#34C759] font-medium" : "text-[#B0A090]"
                            }`}>
                            {u.online ? "Online" : "Offline"}
                        </p>
                    </div>

                    {/* Chat arrow on hover */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 text-[#B0A090] opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-[#B5784A]"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            ))}
        </div>
    );
}
