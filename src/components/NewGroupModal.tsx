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
            // Include the creator in the members list
            const members = [currentUser._id, ...Array.from(selectedUserIds)];

            const conversationId = await createGroup({
                members,
                groupName: groupName.trim(),
            });

            // Reset state
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
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-xl border border-border bg-card shadow-2xl animate-in zoom-in-95 fade-in duration-200">
                <div className="flex flex-col p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold tracking-tight text-foreground">
                            Create Group Chat
                        </h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Group Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Group Name
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="e.g. Design Team"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                maxLength={50}
                            />
                        </div>

                        {/* Members Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground flex justify-between">
                                <span>Add Members</span>
                                <span className="text-muted-foreground text-xs font-normal">
                                    {selectedUserIds.size} selected
                                </span>
                            </label>

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search users..."
                                className="w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
                            />

                            <div className="h-[200px] overflow-y-auto rounded-md border border-border bg-background p-1 space-y-0.5 scrollbar-thin">
                                {filteredUsers.length === 0 ? (
                                    <p className="p-4 text-center text-sm text-muted-foreground">
                                        No users found.
                                    </p>
                                ) : (
                                    filteredUsers.map((u) => {
                                        const isSelected = selectedUserIds.has(u._id);
                                        return (
                                            <label
                                                key={u._id}
                                                className={`flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 transition-colors hover:bg-muted ${isSelected ? "bg-primary/5" : ""
                                                    }`}
                                            >
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleUser(u._id)}
                                                        className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-background checked:bg-primary checked:border-primary"
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
                                                            className="h-8 w-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium tracking-tight text-primary">
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
                            className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-muted active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!groupName.trim() || selectedUserIds.size === 0 || isCreating}
                            className="flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 min-w-[100px]"
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
