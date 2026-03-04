"use client";

import { SearchBar } from "@/components/SearchBar";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export function ChatSidebar() {
    const { user, isLoaded } = useUser();
    const createUserIfNotExists = useMutation(api.users.createUserIfNotExists);

    // Sync user to Convex on login
    useEffect(() => {
        if (isLoaded && user) {
            createUserIfNotExists({
                clerkId: user.id,
                name: user.fullName || user.username || "Unknown",
                image: user.imageUrl,
            }).catch((err) => console.error("Failed to sync user to Convex:", err));
        }
    }, [isLoaded, user, createUserIfNotExists]);

    return (
        <aside className="flex h-full w-80 flex-col border-r border-border bg-sidebar">
            {/* User profile header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-4">
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: "h-9 w-9",
                        },
                    }}
                />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-sidebar-foreground">
                        {user?.fullName ?? "Loading..."}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress ?? ""}
                    </p>
                </div>
                <button
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    aria-label="New conversation"
                >
                    <span className="text-xl leading-none">+</span>
                </button>
            </div>

            {/* Search */}
            <div className="px-3 py-3">
                <SearchBar />
            </div>

            {/* Conversation list */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
                {/* TODO: Map over conversations from Convex */}
                <div className="space-y-1">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-sidebar-accent"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                                U{i}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-sidebar-foreground">
                                    User {i}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    Placeholder message preview…
                                </p>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                                {i}m ago
                            </span>
                        </div>
                    ))}
                </div>
            </nav>
        </aside>
    );
}
