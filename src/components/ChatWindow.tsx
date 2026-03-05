"use client";

import { MessageBubble } from "@/components/MessageBubble";
import { MessageInput } from "@/components/MessageInput";
import { formatRelativeTime } from "@/lib/utils";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useRef } from "react";

interface ChatWindowProps {
    conversationId?: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
    const { user: clerkUser } = useUser();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get the current Convex user
    const currentUser = useQuery(
        api.users.getUser,
        clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
    );

    // Get the conversation details (to show the other user's info)
    const conversation = useQuery(
        api.conversations.get,
        conversationId
            ? { id: conversationId as Id<"conversations"> }
            : "skip"
    );

    // Find the other member's ID
    const otherMemberId =
        conversation && currentUser
            ? conversation.members.find((m) => m !== currentUser._id)
            : undefined;

    // We need to get all users so we can look up the other member
    const allUsers = useQuery(api.users.getAllUsers) ?? [];
    const otherUser = otherMemberId
        ? allUsers.find((u) => u._id === otherMemberId)
        : undefined;

    // Real-time message subscription
    const messages = useQuery(
        api.messages.list,
        conversationId
            ? { conversationId: conversationId as Id<"conversations"> }
            : "skip"
    ) ?? [];

    // Real-time typing indicator subscription
    const typingUsers = useQuery(
        api.typing.getTyping,
        conversationId
            ? { conversationId: conversationId as Id<"conversations"> }
            : "skip"
    ) ?? [];

    // Filter out self from typing indicators
    const othersTyping = typingUsers.filter(
        (t) => t && currentUser && t.userId !== currentUser._id
    );

    // Sort messages by createdAt
    const sortedMessages = [...messages]
        .filter((m) => !m.deleted)
        .sort((a, b) => a.createdAt - b.createdAt);

    // Auto-scroll to newest message or when typing indicator appears
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [sortedMessages.length, othersTyping.length]);

    return (
        <div className="flex flex-1 flex-col bg-background">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                    {conversationId && otherUser ? (
                        <>
                            {/* Other user's avatar */}
                            <div className="relative">
                                {otherUser.image ? (
                                    <img
                                        src={otherUser.image}
                                        alt={otherUser.name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                                        {otherUser.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {otherUser.online && (
                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    {otherUser.name}
                                </h3>
                                <p className={`text-xs ${otherUser.online ? "text-emerald-400" : "text-muted-foreground"}`}>
                                    {otherUser.online
                                        ? "Online"
                                        : otherUser.lastSeen
                                            ? `Active ${formatRelativeTime(otherUser.lastSeen)}`
                                            : "Offline"}
                                </p>
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
            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
                {conversationId ? (
                    <div className="mx-auto flex max-w-2xl flex-col gap-2">
                        {sortedMessages.length === 0 ? (
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
                                    message={msg.content}
                                    isOwn={currentUser?._id === msg.senderId}
                                    timestamp={msg.createdAt}
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
