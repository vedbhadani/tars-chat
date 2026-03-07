"use client";

import { SearchBar } from "@/components/SearchBar";
import { UserList } from "@/components/UserList";
import { ConversationList } from "@/components/ConversationList";
import { NewGroupModal } from "@/components/NewGroupModal";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type SidebarTab = "chats" | "people";

export function ChatSidebar() {
    const { user, isLoaded } = useUser();
    const createUserIfNotExists = useMutation(api.users.createUserIfNotExists);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<SidebarTab>("chats");
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const activeConversationId = params?.id as string | undefined;

    const currentUser = useQuery(
        api.users.getUser,
        user?.id ? { clerkId: user.id } : "skip"
    );

    const enrichedConversations = useQuery(
        api.conversations.getMyConversations,
        currentUser?._id ? { userId: currentUser._id } : "skip"
    );

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

    useEffect(() => {
        const unreadTotal = enrichedConversations?.reduce((acc, c) => acc + (c.unreadCount ?? 0), 0) || 0;
        document.title = unreadTotal > 0 ? `(${unreadTotal}) TarsChat` : `TarsChat`;
    }, [enrichedConversations]);

    return (
        <aside className="flex h-full w-full md:w-80 flex-col bg-[#F2EDE4] border-r border-[#E8E0D4]">
            {/* App brand + user header + tabs */}
            <div className="bg-[#FFFFFF] border-b border-[#E8E0D4]">
                <div className="flex items-center gap-3 px-5 py-5 pb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#B5784A] text-lg shadow-sm">
                        💬
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold tracking-tight text-[#1A1208]">
                            {isLoaded && user ? (user.fullName || user.username || "User") : "TarsChat"}
                        </p>
                        <p className="truncate text-[11px] text-[#7A6A56]">
                            {user?.primaryEmailAddress?.emailAddress ?? (isLoaded ? "Personal Account" : "Loading...")}
                        </p>
                    </div>
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "h-8 w-8 ring-2 ring-[#E8E0D4] hover:ring-[#B5784A] transition-all shadow-sm",
                            },
                        }}
                    />
                </div>

                {/* Pill Tab Switcher */}
                <div className="px-5 pb-4">
                    <div className="flex items-center rounded-full bg-[#F2EDE4] p-1">
                        <button
                            onClick={() => { setActiveTab("chats"); setSearchQuery(""); }}
                            className={`flex-1 rounded-full py-2 text-xs font-bold tracking-wider transition-all duration-300 ${activeTab === "chats"
                                ? "bg-[#FFFFFF] text-[#B5784A] shadow-[0_1px_4px_rgba(0,0,0,0.07)]"
                                : "text-[#7A6A56] hover:text-[#1A1208]"
                                }`}
                        >
                            Chats
                        </button>
                        <button
                            onClick={() => { setActiveTab("people"); setSearchQuery(""); }}
                            className={`flex-1 rounded-full py-2 text-xs font-bold tracking-wider transition-all duration-300 ${activeTab === "people"
                                ? "bg-[#FFFFFF] text-[#B5784A] shadow-[0_1px_4px_rgba(0,0,0,0.07)]"
                                : "text-[#7A6A56] hover:text-[#1A1208]"
                                }`}
                        >
                            People
                        </button>
                    </div>
                </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-2 px-5 pt-4 pb-4">
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
                        className="flex h-[37px] shrink-0 items-center gap-1.5 justify-center rounded-xl border-[1.5px] border-[#E8E0D4] bg-[#FFFFFF] px-3.5 text-xs font-bold text-[#7A6A56] transition-all duration-200 hover:border-[#B5784A] hover:text-[#B5784A] active:scale-95"
                        aria-label="New Group Chat"
                        title="New Group Chat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Group</span>
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
