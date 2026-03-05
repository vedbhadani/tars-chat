"use client";

import { SearchBar } from "@/components/SearchBar";
import { UserList } from "@/components/UserList";
import { ConversationList } from "@/components/ConversationList";
import { NewGroupModal } from "@/components/NewGroupModal";
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
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
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

    // Presence Management (Online/Offline Status)
    const updateOnlineStatus = useMutation(api.users.updateOnlineStatus);
    useEffect(() => {
        if (!isLoaded || !user) return;

        // Set online when initially mounted or focused
        updateOnlineStatus({ clerkId: user.id, online: true }).catch(console.error);

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                updateOnlineStatus({ clerkId: user.id, online: false }).catch(console.error);
            } else {
                updateOnlineStatus({ clerkId: user.id, online: true }).catch(console.error);
            }
        };

        const handleBeforeUnload = () => {
            updateOnlineStatus({ clerkId: user.id, online: false }).catch(console.error);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            // Also set offline when component unmounts
            updateOnlineStatus({ clerkId: user.id, online: false }).catch(console.error);
        };
    }, [isLoaded, user, updateOnlineStatus]);

    const handleConversationReady = (conversationId: Id<"conversations">) => {
        setActiveTab("chats");
        setSearchQuery("");
        router.push(`/conversation/${conversationId}`);
    };

    return (
        <aside className="flex h-full w-full md:w-80 flex-col border-r border-border/50 bg-sidebar">
            {/* App brand + user header */}
            <div className="flex items-center gap-3 border-b border-border/50 px-4 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-lg shadow-sm">
                    💬
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold tracking-tight text-sidebar-foreground">
                        Realtime Chat
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress ?? (isLoaded ? user?.fullName || "User" : "Loading...")}
                    </p>
                </div>
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: "h-8 w-8 ring-2 ring-border/50 hover:ring-primary/30 transition-all",
                        },
                    }}
                />
                {/* Sign out button */}
                <button
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground/60 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Sign out"
                    title="Sign out"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>

            {/* Tab switcher */}
            <div className="flex border-b border-border/50">
                <button
                    onClick={() => { setActiveTab("chats"); setSearchQuery(""); }}
                    className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${activeTab === "chats"
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Chats
                </button>
                <button
                    onClick={() => { setActiveTab("people"); setSearchQuery(""); }}
                    className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${activeTab === "people"
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    People
                </button>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-2 px-3 py-3">
                <div className="flex-1">
                    <SearchBar
                        placeholder={activeTab === "chats" ? "Search conversations…" : "Search users…"}
                        value={searchQuery}
                        onChange={setSearchQuery}
                    />
                </div>
                {activeTab === "chats" && (
                    <button
                        onClick={() => setIsGroupModalOpen(true)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/20 active:scale-95"
                        aria-label="New Group Chat"
                        title="New Group Chat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            <line x1="19" y1="8" x2="19" y2="14" />
                            <line x1="22" y1="11" x2="16" y2="11" />
                        </svg>
                    </button>
                )}
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

            <NewGroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                onGroupCreated={handleConversationReady}
            />
        </aside>
    );
}
