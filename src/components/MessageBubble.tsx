"use client";

import { cn, formatMessageTimestamp } from "@/lib/utils";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢"];

interface ReactionData {
    emoji: string;
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
    reactions?: ReactionData[];
    currentUserId?: string;
    onToggleReaction?: (messageId: Id<"messages">, emoji: string) => void;
    // Grouping props
    senderName?: string;
    senderImage?: string;
    isFirstInGroup?: boolean;
    isLastInGroup?: boolean;
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
    senderName,
    senderImage,
    isFirstInGroup = true,
    isLastInGroup = true,
}: MessageBubbleProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const hasReactions = reactions && reactions.length > 0;

    // Dynamic border radius for grouped messages
    const getBubbleRadius = () => {
        if (isOwn) {
            if (isFirstInGroup && isLastInGroup) return "rounded-2xl rounded-br-md";
            if (isFirstInGroup) return "rounded-2xl rounded-br-md rounded-br-md";
            if (isLastInGroup) return "rounded-2xl rounded-tr-md rounded-br-md";
            return "rounded-2xl rounded-r-md";
        } else {
            if (isFirstInGroup && isLastInGroup) return "rounded-2xl rounded-bl-md";
            if (isFirstInGroup) return "rounded-2xl rounded-bl-md";
            if (isLastInGroup) return "rounded-2xl rounded-tl-md rounded-bl-md";
            return "rounded-2xl rounded-l-md";
        }
    };

    // Deleted message tombstone
    if (deleted) {
        return (
            <div
                className={cn(
                    "flex w-full",
                    isOwn ? "justify-end" : "justify-start",
                    !isOwn && "pl-10"
                )}
            >
                <div
                    className={cn(
                        "max-w-xs md:max-w-md rounded-2xl px-4 py-2 text-sm",
                        isOwn
                            ? "rounded-br-md bg-primary/10"
                            : "rounded-bl-md bg-muted/30"
                    )}
                >
                    <p className="italic text-muted-foreground/60">
                        🚫 This message was deleted
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "group flex w-full items-end gap-2 animate-message-enter",
                isOwn ? "flex-row-reverse" : "flex-row",
                !isFirstInGroup && !isOwn && "pl-10",
                isFirstInGroup ? "mt-3" : "mt-0.5"
            )}
        >
            {/* Sender avatar — only for received, first in group */}
            {!isOwn && isFirstInGroup && (
                <div className="shrink-0 mb-0.5">
                    {senderImage ? (
                        <img
                            src={senderImage}
                            alt={senderName || "User"}
                            className="h-8 w-8 rounded-full object-cover ring-1 ring-border/20"
                        />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-primary/5 text-xs font-semibold text-primary">
                            {senderName?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                    )}
                </div>
            )}

            {/* Message column */}
            <div className={cn("flex max-w-xs md:max-w-md flex-col", isOwn ? "items-end" : "items-start")}>
                {/* Sender name — only for received, first in group */}
                {!isOwn && isFirstInGroup && senderName && (
                    <span className="mb-1 ml-1 text-[11px] font-medium text-muted-foreground/70">
                        {senderName}
                    </span>
                )}

                {/* The bubble */}
                <div
                    className={cn(
                        "px-4 py-2 text-sm leading-relaxed",
                        getBubbleRadius(),
                        isOwn
                            ? "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-sm shadow-primary/10"
                            : "bg-muted/50 text-foreground"
                    )}
                >
                    <p className="whitespace-pre-wrap break-words">{message}</p>
                    {/* Show timestamp on last message in group, or when hovered */}
                    {timestamp && isLastInGroup && (
                        <span
                            className={cn(
                                "block text-right text-[10px] mt-1 tabular-nums",
                                isOwn ? "text-primary-foreground/45" : "text-muted-foreground/50"
                            )}
                        >
                            {formatMessageTimestamp(timestamp)}
                        </span>
                    )}
                </div>

                {/* Reaction pills */}
                {hasReactions && (
                    <div className={cn("mt-1 flex flex-wrap gap-1", isOwn ? "justify-end" : "justify-start")}>
                        {reactions!.map((r) => {
                            const isMine = currentUserId ? r.userIds.includes(currentUserId) : false;
                            return (
                                <button
                                    key={r.emoji}
                                    onClick={() => onToggleReaction?.(messageId, r.emoji)}
                                    className={cn(
                                        "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all duration-200 hover:scale-110 active:scale-95",
                                        isMine
                                            ? "bg-primary/15 ring-1 ring-primary/25 text-foreground"
                                            : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
                                    )}
                                >
                                    <span>{r.emoji}</span>
                                    <span className="font-medium tabular-nums">{r.count}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Action buttons — react + delete */}
            <div className="relative flex shrink-0 items-center gap-0.5 self-center">
                {/* Emoji picker trigger */}
                {onToggleReaction && (
                    <div className="relative">
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="rounded-lg p-1 text-muted-foreground/20 opacity-0 transition-all duration-200 hover:bg-muted/50 hover:text-foreground group-hover:opacity-100"
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

                        {/* Emoji picker dropdown */}
                        {showEmojiPicker && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowEmojiPicker(false)}
                                />
                                <div className={cn(
                                    "absolute z-50 flex gap-0.5 rounded-xl border border-border/40 bg-card/95 backdrop-blur-xl p-1.5 shadow-xl shadow-black/20",
                                    isOwn ? "right-0 bottom-8" : "left-0 bottom-8"
                                )}>
                                    {EMOJI_OPTIONS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => {
                                                onToggleReaction(messageId, emoji);
                                                setShowEmojiPicker(false);
                                            }}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-base transition-all duration-150 hover:bg-muted/60 hover:scale-125 active:scale-90"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Delete trigger — only for own messages */}
                {isOwn && onDelete && !showConfirm && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="rounded-lg p-1 text-muted-foreground/20 opacity-0 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        aria-label="Delete message"
                        title="Delete"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                    </button>
                )}

                {/* Inline confirmation */}
                {showConfirm && (
                    <div className="flex items-center gap-1 rounded-xl border border-border/40 bg-card/95 backdrop-blur-xl p-1 shadow-lg shadow-black/20">
                        <button
                            onClick={() => {
                                onDelete?.(messageId);
                                setShowConfirm(false);
                            }}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium text-destructive transition-all duration-200 hover:bg-destructive/10"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
