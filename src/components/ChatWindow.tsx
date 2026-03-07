"use client";

import { MessageBubble } from "@/components/MessageBubble";
import { MessageInput } from "@/components/MessageInput";
import { formatRelativeTime, formatDateSeparator } from "@/lib/utils";
import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useRef, useState, useCallback, Fragment } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
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
        [deleteMessage, currentUser]
    );

    // Reaction toggle handler
    const handleToggleReaction = useCallback(
        (messageId: Id<"messages">, emoji: string) => {
            if (!currentUser?._id) return;
            toggleReaction({ messageId, userId: currentUser._id, emoji }).catch(console.error);
        },
        [toggleReaction, currentUser]
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

    const otherUserReadReceipt = useQuery(
        api.messages.getReadReceipt,
        conversationId && otherMemberId
            ? { conversationId: conversationId as Id<"conversations">, userId: otherMemberId }
            : "skip"
    );
    const otherUserLastReadTime = otherUserReadReceipt?.lastReadTime ?? 0;

    const currentUserReadReceipt = useQuery(
        api.messages.getReadReceipt,
        conversationId && currentUser?._id
            ? { conversationId: conversationId as Id<"conversations">, userId: currentUser._id }
            : "skip"
    );

    const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null);
    const [hasEvaluatedUnread, setHasEvaluatedUnread] = useState(false);

    const [prevConversationId, setPrevConversationId] = useState<string | undefined>(conversationId);

    if (conversationId !== prevConversationId) {
        setPrevConversationId(conversationId);
        setFirstUnreadId(null);
        setHasEvaluatedUnread(false);
    }

    const { results: messages, status, loadMore } = usePaginatedQuery(
        api.messages.list,
        conversationId
            ? { conversationId: conversationId as Id<"conversations"> }
            : "skip",
        { initialNumItems: 50 }
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

    const sortedMessages = [...(messages ?? [])]
        .sort((a, b) => a.createdAt - b.createdAt);

    useEffect(() => {
        if (!hasEvaluatedUnread && messages !== undefined && currentUserReadReceipt !== undefined) {
            const readTime = currentUserReadReceipt?.lastReadTime ?? 0;
            const unreadMsg = sortedMessages.find(m => m.createdAt > readTime && m.senderId !== currentUser?._id);
            if (unreadMsg) {
                // Defer to avoid cascading render warning
                setTimeout(() => setFirstUnreadId(unreadMsg._id), 0);
            }
            setTimeout(() => setHasEvaluatedUnread(true), 0);
        }
    }, [messages, currentUserReadReceipt, hasEvaluatedUnread, sortedMessages, currentUser?._id]);

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
                // Defer to avoid cascading render warning
                setTimeout(() => setShowNewMessagesButton(true), 0);
            }
        } else if (currentCount > 0 && prevCount === 0) {
            // Initial load — jump to bottom instantly
            messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        }

        prevMessageCountRef.current = currentCount;
    }, [sortedMessages.length, isAtBottom]);

    // ── Toast Notifications on New Messages ──────────────
    useEffect(() => {
        if (!messages) return;

        const latestMessage = sortedMessages[sortedMessages.length - 1];
        if (!latestMessage) return;

        // Skip if it's from the current user
        if (latestMessage.senderId === currentUser?._id) return;

        // Give priority to existing chat view auto-scroll logic, wait for next tick
        setTimeout(() => {
            // Only toast if the window is hidden/blurred or if we are loaded and checking logic
            if (document.hidden && !latestMessage.deleted) {
                // Determine sender name
                const senderName = allUsers.find(u => u._id === latestMessage.senderId)?.name || "Someone";

                toast(`New message from ${senderName}`, {
                    style: {
                        background: '#FFFFFF',
                        color: '#1A1208',
                        border: '1.5px solid #E8E0D4',
                        borderRadius: '12px',
                        fontFamily: 'Plus Jakarta Sans'
                    },
                });
            }
        }, 50);

    }, [sortedMessages, currentUser?._id, allUsers, messages]);

    // Auto-scroll when typing indicator appears (if at bottom)
    useEffect(() => {
        if (isAtBottom && othersTyping.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [othersTyping.length, isAtBottom]);

    // ── Mark as Read ─────────────────────────────────────
    useEffect(() => {
        if (conversationId && currentUser?._id && hasEvaluatedUnread) {
            markRead({
                conversationId: conversationId as Id<"conversations">,
                userId: currentUser._id,
            }).catch(console.error);
        }
    }, [conversationId, currentUser?._id, sortedMessages.length, markRead, hasEvaluatedUnread]);

    // ── Scroll-to-Bottom Handler ─────────────────────────
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowNewMessagesButton(false);
    }, []);

    // ── Render ───────────────────────────────────────────
    return (
        <div className="flex flex-1 flex-col bg-[#FAF7F2]">
            {/* Header */}
            <header className="flex items-center justify-between border-b-[1.5px] border-[#E8E0D4] bg-[#FFFFFF] px-4 md:px-6 py-3.5">
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Mobile back button */}
                    {conversationId && (
                        <button
                            onClick={() => router.push("/chat")}
                            className="md:hidden shrink-0 rounded-lg p-1.5 text-[#7A6A56] transition-all duration-200 hover:bg-[#F5EDE3] hover:text-[#1A1208]"
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
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5EDE3] text-sm font-semibold text-[#B5784A]">
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
                                        className="h-10 w-10 rounded-full object-cover ring-1 ring-[#E8E0D4]"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5EDE3] text-sm font-semibold text-[#B5784A]">
                                        {otherUser?.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {!conversation?.isGroup && otherUser?.online && (
                                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#FFFFFF] bg-[#34C759] shadow-[0_0_8px_rgba(52,199,89,0.4)]" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-[#1A1208]">
                                    {conversation?.isGroup ? conversation.groupName : otherUser?.name}
                                </h3>
                                <p className={`text-xs ${conversation?.isGroup ? "text-[#7A6A56]" : otherUser?.online ? "text-[#34C759]" : "text-[#7A6A56]"}`}>
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
                            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full" style={{ background: 'linear-gradient(135deg, #E8E0D4, #F5EDE3)' }} />
                            <div className="space-y-2 py-1">
                                <div className="h-3.5 w-24 animate-pulse rounded-md" style={{ background: 'linear-gradient(135deg, #E8E0D4, #F5EDE3)' }} />
                                <div className="h-3 w-16 animate-pulse rounded-md" style={{ background: 'linear-gradient(135deg, #E8E0D4, #F5EDE3)', opacity: 0.7 }} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5EDE3] text-sm font-medium text-[#B0A090]">
                                💬
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-[#1A1208]">
                                    Select a conversation
                                </h3>
                                <p className="text-xs text-[#7A6A56]">
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
                                {status === "CanLoadMore" && (
                                    <div className="flex justify-center py-4">
                                        <button
                                            onClick={() => loadMore(50)}
                                            className="rounded-full bg-[#FFFFFF] px-4 py-1.5 text-xs font-semibold text-[#B5784A] border-[1.5px] border-[#E8E0D4] shadow-sm hover:bg-[#F5EDE3] transition-colors"
                                        >
                                            Load older messages
                                        </button>
                                    </div>
                                )}
                                {status === "LoadingMore" && (
                                    <div className="flex justify-center py-4">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#B5784A] border-t-transparent" />
                                    </div>
                                )}
                                {status === "LoadingFirstPage" ? (
                                    // Message Skeletons
                                    <div className="flex flex-col gap-4 p-4">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className={`flex w-full items-end gap-2 ${i % 2 === 0 ? "flex-row-reverse" : "flex-row"}`}>
                                                {i % 2 !== 0 && (
                                                    <div className="h-8 w-8 shrink-0 animate-pulse rounded-full" style={{ background: 'linear-gradient(135deg, #E8E0D4, #F5EDE3)' }} />
                                                )}
                                                <div className={`flex flex-col gap-1.5 ${i % 2 === 0 ? "items-end" : "items-start"}`}>
                                                    {i % 2 !== 0 && (
                                                        <div className="h-2.5 w-16 animate-pulse rounded ml-1" style={{ background: 'linear-gradient(135deg, #E8E0D4, #F5EDE3)', opacity: 0.5 }} />
                                                    )}
                                                    <div className={`h-10 animate-pulse rounded-2xl ${i % 2 === 0 ? "w-48 rounded-br-[4px]" : "w-56 rounded-bl-[4px]"}`} style={{ background: 'linear-gradient(135deg, #E8E0D4, #F5EDE3)' }} />
                                                    {i % 3 === 0 && (
                                                        <div className={`h-8 animate-pulse rounded-2xl ${i % 2 === 0 ? "w-32 rounded-br-[4px]" : "w-40 rounded-bl-[4px]"}`} style={{ background: 'linear-gradient(135deg, #E8E0D4, #F5EDE3)', opacity: 0.6 }} />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : sortedMessages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'rgba(181,120,74,0.08)' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#B0A090]" style={{ opacity: 0.4 }}>
                                                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                                            </svg>
                                        </div>
                                        <p className="text-base font-medium text-[#1A1208]" style={{ opacity: 0.4 }}>
                                            No messages yet
                                        </p>
                                        <p className="mt-1.5 text-sm text-[#7A6A56]">
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

                                        let showDateSeparator = false;
                                        let dateSeparatorText = "";

                                        if (!prevMsg) {
                                            showDateSeparator = true;
                                            dateSeparatorText = formatDateSeparator(msg.createdAt);
                                        } else {
                                            const prevDate = new Date(prevMsg.createdAt);
                                            const currDate = new Date(msg.createdAt);
                                            if (
                                                prevDate.getDate() !== currDate.getDate() ||
                                                prevDate.getMonth() !== currDate.getMonth() ||
                                                prevDate.getFullYear() !== currDate.getFullYear()
                                            ) {
                                                showDateSeparator = true;
                                                dateSeparatorText = formatDateSeparator(msg.createdAt);
                                            }
                                        }

                                        const isFirstInGroup = !sameSenderAsPrev || showDateSeparator;
                                        const isLastInGroup = !sameSenderAsNext;

                                        const sender = allUsers.find((u) => u._id === msg.senderId);

                                        return (
                                            <Fragment key={msg._id}>
                                                {showDateSeparator && (
                                                    <div className="flex w-full items-center gap-3 my-4">
                                                        <div className="flex-1 h-[1px] bg-[#E8E0D4]" />
                                                        <span className="text-[11px] font-bold tracking-wide text-[#7A6A56]">
                                                            {dateSeparatorText}
                                                        </span>
                                                        <div className="flex-1 h-[1px] bg-[#E8E0D4]" />
                                                    </div>
                                                )}
                                                {msg._id === firstUnreadId && (
                                                    <div className="flex items-center gap-3 my-3">
                                                        <div className="flex-1 h-px bg-[rgba(181,120,74,0.25)]" />
                                                        <span className="text-[11px] font-semibold text-[#B5784A] border border-[#B5784A] rounded-full px-3 py-0.5 bg-transparent whitespace-nowrap">
                                                            ↑ New messages
                                                        </span>
                                                        <div className="flex-1 h-px bg-[rgba(181,120,74,0.25)]" />
                                                    </div>
                                                )}
                                                <MessageBubble
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
                                                    isRead={msg.createdAt <= otherUserLastReadTime}
                                                />
                                            </Fragment>
                                        );
                                    })
                                )}

                                {/* Typing indicator */}
                                {othersTyping.length > 0 && (
                                    <div className="flex w-full justify-start">
                                        <div className="flex items-center gap-2 rounded-tl-[16px] rounded-tr-[16px] rounded-br-[16px] rounded-bl-[4px] bg-[#FFFFFF] px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-[#E8E0D4]">
                                            <span className="text-xs font-medium text-[#7A6A56]">
                                                {othersTyping.map((t) => t?.name).join(", ")}
                                                {othersTyping.length === 1 ? " is" : " are"} typing
                                            </span>
                                            {/* Animated dots */}
                                            <span className="flex items-center gap-0.5">
                                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#B0A090]" style={{ animationDelay: "0ms" }} />
                                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#B0A090]" style={{ animationDelay: "150ms" }} />
                                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#B0A090]" style={{ animationDelay: "300ms" }} />
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Invisible anchor for auto-scroll */}
                                <div ref={messagesEndRef} />
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-3">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F5EDE3] border-[1.5px] border-[#E8E0D4]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#B0A090]">
                                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                                    </svg>
                                </div>
                                <p className="text-[#7A6A56] font-medium">
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
                        className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 rounded-full bg-[#B5784A] px-4 py-2 text-xs font-semibold text-[#FFFFFF] shadow-lg shadow-[#B5784A]/25 transition-all duration-200 hover:bg-[#8F5A32] hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
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
