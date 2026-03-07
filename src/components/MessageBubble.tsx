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
    isRead?: boolean;
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
    isRead = false,
}: MessageBubbleProps) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const hasReactions = reactions && reactions.length > 0;

    // Dynamic border radius for grouped messages
    const getBubbleRadius = () => {
        if (isOwn) {
            // 16px 16px 4px 16px — sharp bottom-right
            return "rounded-tl-[16px] rounded-tr-[16px] rounded-bl-[16px] rounded-br-[4px]";
        } else {
            // 16px 16px 16px 4px — sharp bottom-left
            return "rounded-tl-[16px] rounded-tr-[16px] rounded-br-[16px] rounded-bl-[4px]";
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
                        "max-w-xs md:max-w-md rounded-2xl px-4 py-2 text-sm border border-dashed border-[#E8E0D4]",
                        isOwn ? "rounded-br-[4px]" : "rounded-bl-[4px]"
                    )}
                >
                    <p className="italic text-[#B0A090]">
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
                            className="h-8 w-8 rounded-full object-cover ring-1 ring-[#E8E0D4]"
                        />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5EDE3] text-xs font-semibold text-[#B5784A]">
                            {senderName?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                    )}
                </div>
            )}

            {/* Message column */}
            <div className={cn("flex max-w-xs md:max-w-md flex-col", isOwn ? "items-end" : "items-start")}>
                {/* Sender name — only for received, first in group */}
                {!isOwn && isFirstInGroup && senderName && (
                    <span className="mb-1 ml-1 text-[11px] font-medium text-[#7A6A56]">
                        {senderName}
                    </span>
                )}

                {/* The bubble */}
                <div
                    className={cn(
                        "px-4 py-2 text-sm leading-relaxed",
                        getBubbleRadius(),
                        isOwn
                            ? "bg-[#B5784A] text-[#FFFFFF] shadow-sm"
                            : "bg-[#FFFFFF] text-[#1A1208] border border-[#E8E0D4] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                    )}
                >
                    <div className="flex items-end gap-2">
                        <p className="whitespace-pre-wrap break-words">{message}</p>
                        {timestamp && isLastInGroup && (
                            <span
                                className={cn(
                                    "shrink-0 text-[10px] tabular-nums leading-[18px]",
                                    isOwn ? "text-[rgba(255,255,255,0.7)]" : "text-[#B0A090]"
                                )}
                            >
                                {formatMessageTimestamp(timestamp)}
                                {isOwn && (
                                    <span className="ml-1 text-[10px] text-[rgba(255,255,255,0.7)] font-bold">
                                        {isRead ? "✓✓" : "✓"}
                                    </span>
                                )}
                            </span>
                        )}
                    </div>
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
                                            ? "bg-[#FFFFFF] ring-1 ring-[#B5784A] text-[#1A1208]"
                                            : "bg-[#FFFFFF] ring-1 ring-[#E8E0D4] text-[#7A6A56] hover:ring-[#B5784A] hover:bg-[#F5EDE3]"
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
                            className="rounded-lg p-1 text-[#B0A090] opacity-0 transition-all duration-200 hover:bg-[#F5EDE3] hover:text-[#1A1208] group-hover:opacity-100"
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
                                    "absolute z-50 flex gap-0.5 rounded-xl border-[1.5px] border-[#E8E0D4] bg-[#FFFFFF] p-1.5 shadow-xl shadow-[rgba(26,18,8,0.1)]",
                                    isOwn ? "right-0 bottom-8" : "left-0 bottom-8"
                                )}>
                                    {EMOJI_OPTIONS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => {
                                                onToggleReaction(messageId, emoji);
                                                setShowEmojiPicker(false);
                                            }}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-base transition-all duration-150 hover:bg-[#F5EDE3] hover:scale-125 active:scale-90"
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
                        className="rounded-lg p-1 text-[#B0A090] opacity-0 transition-all duration-200 hover:bg-[#EF4444]/10 hover:text-[#EF4444] group-hover:opacity-100"
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
                    <div className="flex items-center gap-1 rounded-xl border-[1.5px] border-[#E8E0D4] bg-[#FFFFFF] p-1 shadow-lg shadow-[rgba(26,18,8,0.1)]">
                        <button
                            onClick={() => {
                                onDelete?.(messageId);
                                setShowConfirm(false);
                            }}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium text-[#EF4444] transition-all duration-200 hover:bg-[#EF4444]/10"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium text-[#7A6A56] transition-all duration-200 hover:bg-[#F5EDE3]"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
