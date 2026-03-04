"use client";

import { SearchBar } from "@/components/SearchBar";
import { UserList } from "@/components/UserList";
import { ConversationList } from "@/components/ConversationList";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type SidebarTab = "chats" | "people";

export function ChatSidebar() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const createUserIfNotExists = useMutation(api.users.createUserIfNotExists);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<SidebarTab>("chats");
    const router = useRouter();
    const params = useParams();
    const activeConversationId = params?.id as string | undefined;

    // Sync user to Convex on login
    useEffect(() => {
        if (isLoaded && user) {
            createUserIfNotExists({
                clerkId: user.id,
                name: user.fullName || user.username || user.firstName || user.primaryEmailAddress?.emailAddress?.split("@")[0] || "Unknown",
                image: user.imageUrl,
            }).catch((err) => console.error("Failed to sync user to Convex:", err));
        }
    }, [isLoaded, user, createUserIfNotExists]);

    const handleConversationReady = (conversationId: Id<"conversations">) => {
        setActiveTab("chats");
        setSearchQuery("");
        router.push(`/conversation/${conversationId}`);
    };

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
                        {user?.fullName || user?.username || user?.firstName || (isLoaded ? "User" : "Loading...")}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress ?? ""}
                    </p>
                </div>
                {/* Sign out button */}
                <button
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Sign out"
                    title="Sign out"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>

            {/* Tab switcher */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => { setActiveTab("chats"); setSearchQuery(""); }}
                    className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === "chats"
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Chats
                </button>
                <button
                    onClick={() => { setActiveTab("people"); setSearchQuery(""); }}
                    className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === "people"
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    People
                </button>
            </div>

            {/* Search */}
            <div className="px-3 py-3">
                <SearchBar
                    placeholder={activeTab === "chats" ? "Search conversations…" : "Search users…"}
                    value={searchQuery}
                    onChange={setSearchQuery}
                />
            </div>

            {/* Content based on active tab */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
                {activeTab === "chats" ? (
                    <ConversationList
                        searchQuery={searchQuery}
                        onSelectConversation={handleConversationReady}
                        activeConversationId={activeConversationId}
                    />
                ) : (
                    <UserList
                        searchQuery={searchQuery}
                        onConversationReady={handleConversationReady}
                    />
                )}
            </nav>
        </aside>
    );
}
