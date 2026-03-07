"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

interface NewGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGroupCreated: (conversationId: Id<"conversations">) => void;
}

export function NewGroupModal({ isOpen, onClose, onGroupCreated }: NewGroupModalProps) {
    const { user: clerkUser } = useUser();
    const currentUser = useQuery(
        api.users.getUser,
        clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
    );
    const allUsers = useQuery(api.users.getAllUsers) ?? [];
    const createGroup = useMutation(api.conversations.createGroup);

    const [groupName, setGroupName] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<Set<Id<"users">>>(new Set());
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    if (!isOpen || !currentUser) return null;

    // Filter users: exclude current user, apply search
    const filteredUsers = allUsers.filter((u) => {
        if (u._id === currentUser._id) return false;
        if (searchQuery) {
            return u.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    const toggleUser = (userId: Id<"users">) => {
        const next = new Set(selectedUserIds);
        if (next.has(userId)) {
            next.delete(userId);
        } else {
            next.add(userId);
        }
        setSelectedUserIds(next);
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selectedUserIds.size === 0 || isCreating) return;

        setIsCreating(true);
        try {
            const members = [currentUser._id, ...Array.from(selectedUserIds)];

            const conversationId = await createGroup({
                members,
                groupName: groupName.trim(),
            });

            setGroupName("");
            setSelectedUserIds(new Set());
            setSearchQuery("");
            setIsCreating(false);

            onGroupCreated(conversationId);
            onClose();
        } catch (err) {
            console.error("Failed to create group:", err);
            setIsCreating(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm animate-in fade-in duration-150"
                onClick={onClose}
                aria-label="Close modal"
            />

            {/* Modal */}
            <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border/50 bg-card shadow-2xl shadow-black/30 animate-in zoom-in-95 fade-in duration-200">
                <div className="flex flex-col p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-foreground">
                                Create Group Chat
                            </h2>
                            <p className="text-xs text-muted-foreground/60 mt-0.5">
                                Add members and pick a name
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-muted-foreground/50 transition-all duration-200 hover:bg-muted/50 hover:text-foreground focus-ring"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Group Name Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Group Name
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="e.g. Design Team"
                                className="w-full rounded-xl border border-border/40 bg-muted/30 px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200"
                                maxLength={50}
                            />
                        </div>

                        {/* Members Selection */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Members
                                </label>
                                {selectedUserIds.size > 0 && (
                                    <span className="text-[11px] font-medium text-primary tabular-nums">
                                        {selectedUserIds.size} selected
                                    </span>
                                )}
                            </div>

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search users..."
                                className="w-full rounded-xl border border-border/40 bg-muted/30 px-4 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200"
                            />

                            <div className="h-[200px] overflow-y-auto rounded-xl border border-border/30 bg-background/50 p-1 space-y-0.5 scrollbar-thin mt-2">
                                {filteredUsers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <p className="text-sm text-muted-foreground">No users found</p>
                                    </div>
                                ) : (
                                    filteredUsers.map((u) => {
                                        const isSelected = selectedUserIds.has(u._id);
                                        return (
                                            <label
                                                key={u._id}
                                                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-muted/50 ${isSelected ? "bg-primary/5 ring-1 ring-primary/15" : ""
                                                    }`}
                                            >
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleUser(u._id)}
                                                        className="peer h-4 w-4 shrink-0 rounded border border-border bg-background appearance-none checked:bg-primary checked:border-primary transition-colors focus-ring"
                                                    />
                                                    {isSelected && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="absolute pointer-events-none text-primary-foreground">
                                                            <path d="M20 6 9 17l-5-5" />
                                                        </svg>
                                                    )}
                                                </div>

                                                <div className="relative shrink-0">
                                                    {u.image ? (
                                                        <img
                                                            src={u.image}
                                                            alt={u.name}
                                                            className="h-8 w-8 rounded-full object-cover ring-1 ring-border/20"
                                                        />
                                                    ) : (
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-semibold text-primary">
                                                            {u.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="truncate text-sm font-medium text-foreground">
                                                        {u.name}
                                                    </span>
                                                </div>
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground active:scale-95 focus-ring"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!groupName.trim() || selectedUserIds.size === 0 || isCreating}
                            className="flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/85 px-5 py-2 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 active:scale-95 min-w-[110px] focus-ring"
                        >
                            {isCreating ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            ) : (
                                "Create Group"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
