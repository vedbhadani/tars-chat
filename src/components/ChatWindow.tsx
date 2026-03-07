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
        <div className="flex flex-1 flex-col bg-[#f5ebe0]">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-[#e3d5ca] bg-[#edede9]/80 backdrop-blur-sm px-4 md:px-6 py-3.5">
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Mobile back button */}
                    {conversationId && (
                        <button
                            onClick={() => router.push("/chat")}
                            className="md:hidden shrink-0 rounded-lg p-1.5 text-[#7a6a5e] transition-all duration-200 hover:bg-[#e3d5ca]/50 hover:text-[#3d2c2c]"
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
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d5bdaf]/20 text-sm font-semibold text-[#8b6f5e]">
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
                                        className="h-10 w-10 rounded-full object-cover ring-1 ring-[#e3d5ca]"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d5bdaf]/20 text-sm font-semibold text-[#8b6f5e]">
                                        {otherUser?.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {!conversation?.isGroup && otherUser?.online && (
                                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#edede9] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-[#3d2c2c]">
                                    {conversation?.isGroup ? conversation.groupName : otherUser?.name}
                                </h3>
                                <p className={`text-xs ${conversation?.isGroup ? "text-[#7a6a5e]" : otherUser?.online ? "text-emerald-600" : "text-[#7a6a5e]"}`}>
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
                            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[#e3d5ca]/50" />
                            <div className="space-y-2 py-1">
                                <div className="h-3.5 w-24 animate-pulse rounded-md bg-[#e3d5ca]/50" />
                                <div className="h-3 w-16 animate-pulse rounded-md bg-[#e3d5ca]/40" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e3d5ca]/40 text-sm font-medium text-[#7a6a5e]">
                                💬
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-[#3d2c2c]">
                                    Select a conversation
                                </h3>
                                <p className="text-xs text-[#7a6a5e]">
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
                        className="absolute inset-0 overflow-y-auto scroll-smooth scrollbar-thin px-4 md:px-6 py-4 chat-bg-pattern"
                    >
                        {conversationId ? (
                            <div className="mx-auto flex max-w-2xl flex-col">
                                {messages === undefined ? (
                                    // Message Skeletons
                                    <div className="flex flex-col gap-4 p-4">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className={`flex w-full items-end gap-2 ${i % 2 === 0 ? "flex-row-reverse" : "flex-row"}`}>
                                                {i % 2 !== 0 && (
                                                    <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[#e3d5ca]/40" />
                                                )}
                                                <div className={`flex flex-col gap-1.5 ${i % 2 === 0 ? "items-end" : "items-start"}`}>
                                                    {i % 2 !== 0 && (
                                                        <div className="h-2.5 w-16 animate-pulse rounded bg-[#e3d5ca]/30 ml-1" />
                                                    )}
                                                    <div className={`h-10 animate-pulse rounded-2xl bg-[#e3d5ca]/30 ${i % 2 === 0 ? "w-48 rounded-br-md" : "w-56 rounded-bl-md"}`} />
                                                    {i % 3 === 0 && (
                                                        <div className={`h-8 animate-pulse rounded-2xl bg-[#e3d5ca]/20 ${i % 2 === 0 ? "w-32 rounded-br-md" : "w-40 rounded-bl-md"}`} />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : sortedMessages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#d5bdaf]/15">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#d5bdaf]">
                                                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                                            </svg>
                                        </div>
                                        <p className="text-base font-medium text-[#3d2c2c]">
                                            No messages yet
                                        </p>
                                        <p className="mt-1.5 text-sm text-[#7a6a5e]">
                                            Send the first message! 👋
                                        </p>
                                    </div>
                                ) : (
                                    sortedMessages.map((msg, idx) => {
                                        const prevMsg = sortedMessages[idx - 1];
                                        const nextMsg = sortedMessages[idx + 1];
                                        const GROUPING_WINDOW = 5 * 60 * 1000; // 5 minutes

                                        const sameSenderAsPrev = prevMsg
                                            && prevMsg.senderId === msg.senderId
                                            && !prevMsg.deleted
                                            && (msg.createdAt - prevMsg.createdAt) < GROUPING_WINDOW;
                                        const sameSenderAsNext = nextMsg
                                            && nextMsg.senderId === msg.senderId
                                            && !nextMsg.deleted
                                            && (nextMsg.createdAt - msg.createdAt) < GROUPING_WINDOW;

                                        const isFirstInGroup = !sameSenderAsPrev;
                                        const isLastInGroup = !sameSenderAsNext;

                                        const sender = allUsers.find((u) => u._id === msg.senderId);

                                        return (
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
                                                senderName={sender?.name}
                                                senderImage={sender?.image}
                                                isFirstInGroup={isFirstInGroup}
                                                isLastInGroup={isLastInGroup}
                                            />
                                        );
                                    })
                                )}

                                {/* Typing indicator */}
                                {othersTyping.length > 0 && (
                                    <div className="flex w-full justify-start">
                                        <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-[#edede9] backdrop-blur-sm px-4 py-3 shadow-sm ring-1 ring-[#e3d5ca]">
                                            <span className="text-xs font-medium text-[#7a6a5e]">
                                                {othersTyping.map((t) => t?.name).join(", ")}
                                                {othersTyping.length === 1 ? " is" : " are"} typing
                                            </span>
                                            {/* Animated dots */}
                                            <span className="flex items-center gap-0.5">
                                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#d5bdaf]" style={{ animationDelay: "0ms" }} />
                                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#d5bdaf]" style={{ animationDelay: "150ms" }} />
                                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#d5bdaf]" style={{ animationDelay: "300ms" }} />
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Invisible anchor for auto-scroll */}
                                <div ref={messagesEndRef} />
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-3">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e3d5ca]/40 border border-[#e3d5ca]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#7a6a5e]">
                                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                                    </svg>
                                </div>
                                <p className="text-[#7a6a5e] font-medium">
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
                        className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 rounded-full bg-gradient-to-r from-[#d5bdaf] to-[#c4a898] px-4 py-2 text-xs font-semibold text-[#3d2c2c] shadow-lg shadow-[#d5bdaf]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#d5bdaf]/30 hover:-translate-y-0.5 active:scale-95"
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
