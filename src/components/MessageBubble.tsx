"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢"];

interface ReactionData {
    count: number;
    userIds: string[];
}

interface MessageBubbleProps {
    messageId: Id<"messages">;
    message: string;
    isOwn: boolean;
    timestamp?: number;
    deleted?: boolean;
    onDelete?: (messageId: Id<"messages">) => void;
    reactions?: Record<string, ReactionData>;
    currentUserId?: string;
    onToggleReaction?: (messageId: Id<"messages">, emoji: string) => void;
}

function formatMessageTime(ts: number): string {
    const date = new Date(ts);
    return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export function MessageBubble({
    messageId,
    message,
    isOwn,
    timestamp,
    deleted,
    onDelete,
    reactions,
    currentUserId,
    onToggleReaction,
}: MessageBubbleProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Check if any reactions exist for this message
    const hasReactions = reactions && Object.keys(reactions).length > 0;

    // Deleted message tombstone
    if (deleted) {
        return (
            <div
                className={cn(
                    "flex w-full",
                    isOwn ? "justify-end" : "justify-start"
                )}
            >
                <div
                    className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                        isOwn
                            ? "rounded-br-md bg-primary/30"
                            : "rounded-bl-md bg-muted/50"
                    )}
                >
                    <p className="italic text-muted-foreground">
                        🚫 This message was deleted
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "group flex w-full items-start gap-1.5",
                isOwn ? "flex-row-reverse" : "flex-row"
            )}
        >
            {/* Message bubble + reactions column */}
            <div className={cn("flex max-w-[75%] flex-col", isOwn ? "items-end" : "items-start")}>
                {/* The bubble itself */}
                <div
                    className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                        isOwn
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md bg-muted text-foreground"
                    )}
                >
                    <p className="whitespace-pre-wrap break-words">{message}</p>
                    {timestamp && (
                        <span
                            className={cn(
                                "mt-1 block text-right text-[10px]",
                                isOwn ? "text-primary-foreground/50" : "text-muted-foreground"
                            )}
                        >
                            {formatMessageTime(timestamp)}
                        </span>
                    )}
                </div>

                {/* Reaction pills */}
                {hasReactions && (
                    <div className={cn("mt-1 flex flex-wrap gap-1", isOwn ? "justify-end" : "justify-start")}>
                        {Object.entries(reactions!).map(([emoji, data]) => {
                            const isMine = currentUserId ? data.userIds.includes(currentUserId) : false;
                            return (
                                <button
                                    key={emoji}
                                    onClick={() => onToggleReaction?.(messageId, emoji)}
                                    className={cn(
                                        "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all hover:scale-105 active:scale-95",
                                        isMine
                                            ? "bg-primary/20 ring-1 ring-primary/30 text-foreground"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                >
                                    <span>{emoji}</span>
                                    <span className="font-medium">{data.count}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Action buttons column — delete + emoji picker */}
            <div className="relative flex shrink-0 items-center gap-0.5 self-center">
                {/* Emoji picker trigger */}
                {onToggleReaction && (
                    <div className="relative">
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="rounded-lg p-1 text-muted-foreground/40 opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
                            aria-label="Add reaction"
                            title="React"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                <line x1="9" x2="9.01" y1="9" y2="9" />
                                <line x1="15" x2="15.01" y1="9" y2="9" />
                            </svg>
                        </button>

                        {/* Emoji picker popover */}
                        {showEmojiPicker && (
                            <>
                                {/* Backdrop to close */}
                                <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setShowEmojiPicker(false)}
                                />
                                <div className={cn(
                                    "absolute z-30 flex gap-1 rounded-full bg-card border border-border px-2 py-1.5 shadow-xl animate-in fade-in zoom-in-95",
                                    isOwn ? "right-0 bottom-8" : "left-0 bottom-8"
                                )}>
                                    {EMOJI_OPTIONS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => {
                                                onToggleReaction(messageId, emoji);
                                                setShowEmojiPicker(false);
                                            }}
                                            className="rounded-md p-1 text-base transition-transform hover:scale-125 active:scale-95"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Delete button — only for own messages */}
                {isOwn && onDelete && (
                    <div className="relative">
                        {showConfirm ? (
                            <div className="flex items-center gap-1 animate-in fade-in zoom-in-95">
                                <button
                                    onClick={() => {
                                        onDelete(messageId);
                                        setShowConfirm(false);
                                    }}
                                    className="rounded-md bg-destructive/90 px-2 py-1 text-[10px] font-semibold text-destructive-foreground transition-colors hover:bg-destructive"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="rounded-md bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-muted/80"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowConfirm(true)}
                                className="rounded-lg p-1 text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                                aria-label="Delete message"
                                title="Delete message"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
