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
                        <div className="h-10 w-10 shrink-0 rounded-full bg-[#e3d5ca]/60" />
                        <div className="flex-1 space-y-2 py-0.5">
                            <div className="h-3.5 w-24 rounded-md bg-[#e3d5ca]/60" />
                            <div className="h-3 w-16 rounded-md bg-[#e3d5ca]/40" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (filteredUsers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#e3d5ca]/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#7a6a5e]">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-[#7a6a5e]">
                    {searchQuery ? "No users found" : "No other users yet"}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0.5">
            <h4 className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#7a6a5e]/60">
                People ({filteredUsers.length})
            </h4>
            {filteredUsers.map((u) => (
                <button
                    key={u._id}
                    onClick={() => handleUserClick(u._id)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 hover:bg-[#e3d5ca]/40 active:scale-[0.98]"
                >
                    {/* Avatar with online indicator */}
                    <div className="relative shrink-0">
                        {u.image ? (
                            <img
                                src={u.image}
                                alt={u.name}
                                className="h-10 w-10 rounded-full object-cover ring-1 ring-[#c4b5a8] transition-all duration-200 group-hover:ring-[#d5bdaf]"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d5bdaf]/20 text-sm font-semibold text-[#8b6f5e] ring-1 ring-[#d5bdaf]/20 transition-all duration-200 group-hover:ring-[#d5bdaf]/40">
                                {u.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {/* Online/offline dot */}
                        <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-[2.5px] border-[#d6ccc2] transition-colors ${u.online
                                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                : "bg-[#c4b5a8]"
                                }`}
                        />
                    </div>

                    {/* Name and status */}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#3d2c2c]">
                            {u.name}
                        </p>
                        <p className={`text-xs transition-colors ${u.online ? "text-emerald-600 font-medium" : "text-[#7a6a5e]/60"
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
                        className="shrink-0 text-[#7a6a5e]/30 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-[#d5bdaf]"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            ))}
        </div>
    );
}
