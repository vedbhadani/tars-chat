"use client";

import { SearchBar } from "@/components/SearchBar";

export function ChatSidebar() {
    return (
        <aside className="flex h-full w-80 flex-col border-r border-border bg-sidebar">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <h2 className="text-lg font-semibold text-sidebar-foreground">
                    Conversations
                </h2>
                <button
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    aria-label="New conversation"
                >
                    {/* TODO: Replace with icon */}
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
