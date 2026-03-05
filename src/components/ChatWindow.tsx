"use client";

import { MessageBubble } from "@/components/MessageBubble";
import { MessageInput } from "@/components/MessageInput";
import { formatRelativeTime } from "@/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "./ErrorBoundary";

interface ChatWindowProps {
    conversationId?: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
    const { user: clerkUser } = useUser();
    const router = useRouter();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ── Scroll State ─────────────────────────────────────
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showNewMessagesButton, setShowNewMessagesButton] = useState(false);
    const prevMessageCountRef = useRef(0);

    // ── Convex Data ──────────────────────────────────────
    const currentUser = useQuery(
        api.users.getUser,
        clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
    );

    const markRead = useMutation(api.messages.markRead);
    const deleteMessage = useMutation(api.messages.remove);
    const toggleReaction = useMutation(api.reactions.toggle);

    // Delete handler passed to MessageBubble
    const handleDeleteMessage = useCallback(
        (messageId: Id<"messages">) => {
            if (!currentUser?._id) return;
            deleteMessage({ messageId, senderId: currentUser._id }).catch(console.error);
        },
        [deleteMessage, currentUser?._id]
    );

    // Reaction toggle handler
    const handleToggleReaction = useCallback(
        (messageId: Id<"messages">, emoji: string) => {
            if (!currentUser?._id) return;
            toggleReaction({ messageId, userId: currentUser._id, emoji }).catch(console.error);
        },
        [toggleReaction, currentUser?._id]
    );

    const conversation = useQuery(
        api.conversations.get,
        conversationId
            ? { id: conversationId as Id<"conversations"> }
            : "skip"
    );

    const otherMemberId =
        conversation && currentUser
            ? conversation.members.find((m) => m !== currentUser._id)
            : undefined;

    const allUsers = useQuery(api.users.getAllUsers) ?? [];
    const otherUser = otherMemberId
        ? allUsers.find((u) => u._id === otherMemberId)
        : undefined;

    const messages = useQuery(
        api.messages.list,
        conversationId
            ? { conversationId: conversationId as Id<"conversations"> }
            : "skip"
    );

    const typingUsers = useQuery(
        api.typing.getTyping,
        conversationId
            ? { conversationId: conversationId as Id<"conversations"> }
            : "skip"
    ) ?? [];

    // Real-time reactions subscription
    const reactionsMap = useQuery(
        api.reactions.getForConversation,
        conversationId
            ? { conversationId: conversationId as Id<"conversations"> }
            : "skip"
    ) ?? {};

    const othersTyping = typingUsers.filter(
        (t) => t && currentUser && t.userId !== currentUser._id
    );

    const sortedMessages = (messages ?? [])
        .sort((a, b) => a.createdAt - b.createdAt);

    // ── Scroll Detection ─────────────────────────────────
    const checkIsAtBottom = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return true;
        const { scrollHeight, scrollTop, clientHeight } = container;
        return scrollHeight - scrollTop - clientHeight < 100;
    }, []);

    const handleScroll = useCallback(() => {
        const atBottom = checkIsAtBottom();
        setIsAtBottom(atBottom);
        // If user scrolls back down, hide the button
        if (atBottom) {
            setShowNewMessagesButton(false);
        }
    }, [checkIsAtBottom]);

    // Attach scroll listener
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // ── Smart Auto-Scroll on New Messages ────────────────
    useEffect(() => {
        const currentCount = sortedMessages.length;
        const prevCount = prevMessageCountRef.current;

        if (currentCount > prevCount && prevCount > 0) {
            // New message(s) arrived
            if (isAtBottom) {
                // User is at the bottom — scroll to latest
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            } else {
                // User has scrolled up — show the floating button
                setShowNewMessagesButton(true);
            }
        } else if (currentCount > 0 && prevCount === 0) {
            // Initial load — jump to bottom instantly
            messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        }

        prevMessageCountRef.current = currentCount;
    }, [sortedMessages.length, isAtBottom]);

    // Auto-scroll when typing indicator appears (if at bottom)
    useEffect(() => {
        if (isAtBottom && othersTyping.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [othersTyping.length, isAtBottom]);

    // ── Mark as Read ─────────────────────────────────────
    useEffect(() => {
        if (conversationId && currentUser?._id) {
            markRead({
                conversationId: conversationId as Id<"conversations">,
                userId: currentUser._id,
            }).catch(console.error);
        }
    }, [conversationId, currentUser?._id, sortedMessages.length, markRead]);

    // ── Scroll-to-Bottom Handler ─────────────────────────
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowNewMessagesButton(false);
    }, []);

    // ── Render ───────────────────────────────────────────
    return (
        <div className="flex flex-1 flex-col bg-background">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-4">
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Mobile back button */}
                    {conversationId && (
                        <button
                            onClick={() => router.push("/chat")}
                            className="md:hidden shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                            aria-label="Back to conversations"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                    )}
                    {conversationId && (conversation?.isGroup ? true : otherUser) ? (
                        <>
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                {conversation?.isGroup ? (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                    </div>
                                ) : otherUser?.image ? (
                                    <img
                                        src={otherUser.image}
                                        alt={otherUser.name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                                        {otherUser?.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {!conversation?.isGroup && otherUser?.online && (
                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    {conversation?.isGroup ? conversation.groupName : otherUser?.name}
                                </h3>
                                <p className={`text-xs ${conversation?.isGroup ? "text-muted-foreground" : otherUser?.online ? "text-emerald-400" : "text-muted-foreground"}`}>
                                    {conversation?.isGroup
                                        ? `${conversation.members.length} members`
                                        : otherUser?.online
                                            ? "Online"
                                            : otherUser?.lastSeen
                                                ? `Active ${formatRelativeTime(otherUser.lastSeen)}`
                                                : "Offline"}
                                </p>
                            </div>
                        </>
                    ) : conversationId ? (
                        <>
                            {/* Header Skeleton */}
                            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />
                            <div className="space-y-2 py-1">
                                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                                💬
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    Select a conversation
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Choose someone to chat with
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* Messages area */}
            <div className="relative flex-1">
                <ErrorBoundary>
                    <div
                        ref={scrollContainerRef}
                        className="absolute inset-0 overflow-y-auto scrollbar-thin px-4 md:px-6 py-4"
                    >
                        {conversationId ? (
                            <div className="mx-auto flex max-w-2xl flex-col gap-2">
                                {messages === undefined ? (
                                    // Message Skeletons
                                    <div className="flex flex-col gap-4 p-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className={`flex w-full ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                                                <div className={`h-12 w-2/3 animate-pulse rounded-2xl bg-muted/60 ${i % 2 === 0 ? "rounded-br-sm" : "rounded-bl-sm"}`} />
                                            </div>
                                        ))}
                                    </div>
                                ) : sortedMessages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-medium text-foreground">
                                            No messages yet
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Send a message to start the conversation
                                        </p>
                                    </div>
                                ) : (
                                    sortedMessages.map((msg) => (
                                        <MessageBubble
                                            key={msg._id}
                                            messageId={msg._id}
                                            message={msg.content}
                                            isOwn={currentUser?._id === msg.senderId}
                                            timestamp={msg.createdAt}
                                            deleted={msg.deleted}
                                            onDelete={handleDeleteMessage}
                                            reactions={reactionsMap[msg._id]}
                                            currentUserId={currentUser?._id}
                                            onToggleReaction={handleToggleReaction}
                                        />
                                    ))
                                )}

                                {/* Typing indicator */}
                                {othersTyping.length > 0 && (
                                    <div className="flex w-full justify-start">
                                        <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                                            <span className="text-xs text-muted-foreground">
                                                {othersTyping.map((t) => t?.name).join(", ")}
                                                {othersTyping.length === 1 ? " is" : " are"} typing
                                            </span>
                                            {/* Animated dots */}
                                            <span className="flex items-center gap-0.5">
                                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "0ms" }} />
                                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "150ms" }} />
                                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "300ms" }} />
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Invisible anchor for auto-scroll */}
                                <div ref={messagesEndRef} />
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-3">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                                    </svg>
                                </div>
                                <p className="text-muted-foreground">
                                    Select a conversation to start messaging
                                </p>
                            </div>
                        )}
                    </div>
                </ErrorBoundary>

                {/* ↓ New messages floating button */}
                {showNewMessagesButton && (
                    <button
                        onClick={scrollToBottom}
                        className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-95"
                    >
                        ↓ New messages
                    </button>
                )}
            </div>

            {/* Input area */}
            {conversationId && currentUser && (
                <MessageInput
                    conversationId={conversationId as Id<"conversations">}
                    senderId={currentUser._id}
                />
            )}
        </div>
    );
}
