"use client";

import { cn, formatMessageTimestamp } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
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
    const [isLongPressed, setIsLongPressed] = useState(false);
    const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = () => {
        // Only trigger for mobile/touch
        longPressTimeout.current = setTimeout(() => {
            setIsLongPressed(true);
        }, 500);
    };

    const handleTouchEnd = () => {
        if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            longPressTimeout.current = null;
        }
    };

    // Close on outside click or scroll
    useEffect(() => {
        if (!isLongPressed) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;
            // Only close if the click is truly outside our bubble and its overlays
            if (containerRef.current && !containerRef.current.contains(target)) {
                setIsLongPressed(false);
                setShowConfirm(false);
                setShowEmojiPicker(false);
            }
        };

        const handleDismiss = () => {
            setIsLongPressed(false);
            setShowConfirm(false);
            setShowEmojiPicker(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        // Use capture: true to catch scrolls anywhere in the app
        window.addEventListener("scroll", handleDismiss, { capture: true, passive: true });
        // Also listen for touchmove to close quickly on mobile
        window.addEventListener("touchmove", handleDismiss, { capture: true, passive: true });

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
            window.removeEventListener("scroll", handleDismiss, { capture: true });
            window.removeEventListener("touchmove", handleDismiss, { capture: true });
        };
    }, [isLongPressed]);

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

    if (deleted) {
        return (
            <div
                className={cn(
                    "flex w-full animate-message-enter",
                    isOwn ? "justify-end" : "justify-start",
                    !isOwn && !isFirstInGroup && "pl-10",
                    isFirstInGroup ? "mt-3" : "mt-0.5"
                )}
            >
                <div
                    className={cn(
                        "max-w-[80%] md:max-w-md rounded-2xl px-4 py-2 text-sm border border-dashed border-[#E8E0D4]",
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
            ref={containerRef}
            className={cn(
                "group flex w-full items-end gap-2 animate-message-enter relative",
                isOwn ? "flex-row-reverse" : "flex-row",
                !isFirstInGroup && !isOwn && "pl-10",
                isFirstInGroup ? "mt-3" : "mt-0.5"
            )}
        >
            {/* Context menu backdrop for mobile - non-blocking to allow scroll flow */}
            {isLongPressed && (
                <div
                    className="fixed inset-0 z-40 bg-black/5 md:hidden pointer-events-none"
                    aria-hidden="true"
                />
            )}

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
            <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
                {/* Sender name — only for received, first in group */}
                {!isOwn && isFirstInGroup && senderName && (
                    <span className="mb-1 ml-1 text-[11px] font-medium text-[#7A6A56]">
                        {senderName}
                    </span>
                )}

                {/* Bubble & Action Buttons Wrapper */}
                <div className={cn("relative flex items-center gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
                    {/* Unified Floating Action Bar (WhatsApp style) */}
                    {isLongPressed && (
                        <div className={cn(
                            "absolute z-[60] flex items-center gap-1 rounded-full bg-white p-1.5 shadow-2xl border-[1.5px] border-[#E8E0D4] animate-in slide-in-from-bottom-2 duration-200",
                            isOwn ? "right-0" : "left-0",
                            "-top-14" // Positioning above bubble
                        )}>
                            {!showConfirm ? (
                                <>
                                    {onToggleReaction && EMOJI_OPTIONS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleReaction(messageId, emoji);
                                                setIsLongPressed(false);
                                            }}
                                            className="flex h-10 w-10 items-center justify-center rounded-full text-xl transition-all duration-150 hover:bg-[#F5EDE3] hover:scale-125 active:scale-90"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                    {isOwn && onDelete && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowConfirm(true);
                                            }}
                                            className="flex h-10 w-11 items-center justify-center rounded-full text-[#B0A090] transition-all duration-150 hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                            </svg>
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center gap-1.5 px-1 py-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete?.(messageId);
                                            setShowConfirm(false);
                                            setIsLongPressed(false);
                                        }}
                                        className="rounded-full px-4 py-2 text-sm font-bold text-[#EF4444] transition-all duration-200 hover:bg-[#EF4444]/10"
                                    >
                                        Delete
                                    </button>
                                    <div className="h-6 w-[1.5px] bg-[#E8E0D4] mx-1" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowConfirm(false);
                                        }}
                                        className="rounded-full px-4 py-2 text-sm font-bold text-[#7A6A56] transition-all duration-200 hover:bg-[#F5EDE3]"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* The bubble */}
                    <div
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onTouchMove={handleTouchEnd}
                        className={cn(
                            "max-w-[80%] md:max-w-md px-4 py-2 text-sm leading-relaxed transition-all duration-200 select-none",
                            getBubbleRadius(),
                            isOwn
                                ? "bg-[#B5784A] text-[#FFFFFF] shadow-sm"
                                : "bg-[#FFFFFF] text-[#1A1208] border border-[#E8E0D4] shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
                            isLongPressed && "scale-[0.98] shadow-lg brightness-95 ring-2 ring-[#B5784A]/20"
                        )}
                    >
                        <div className="relative min-w-[70px]">
                            <p className="whitespace-pre-wrap break-all [overflow-wrap:anywhere] text-sm">
                                {message}
                                {timestamp && (
                                    <span className="inline-block w-[60px] h-1" /> // Spacer to prevent text overlapping timestamp
                                )}
                            </p>
                            {timestamp && (
                                <div
                                    className={cn(
                                        "absolute right-[-4px] bottom-[-2px] flex items-center gap-1 text-[10px] tabular-nums whitespace-nowrap",
                                        isOwn ? "text-[rgba(255,255,255,0.7)]" : "text-[#B0A090]"
                                    )}
                                >
                                    {formatMessageTimestamp(timestamp)}
                                    {isOwn && (
                                        <img
                                            src={isRead ? "/double-tick.png" : "/single-tick.png"}
                                            alt={isRead ? "Read" : "Sent"}
                                            className="h-3.5 w-3.5 object-contain opacity-80"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop Hover Action buttons — react + delete */}
                    <div className={cn(
                        "hidden md:flex shrink-0 items-center gap-1 transition-all duration-200 z-50",
                        "opacity-0 group-hover:opacity-100"
                    )}>
                        {onToggleReaction && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="rounded-lg p-1.5 text-[#B0A090] transition-all duration-200 hover:bg-[#F5EDE3] hover:text-[#1A1208] active:bg-[#F5EDE3]"
                                    aria-label="Add reaction"
                                    title="React"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                        <line x1="9" x2="9.01" y1="9" y2="9" />
                                        <line x1="15" x2="15.01" y1="9" y2="9" />
                                    </svg>
                                </button>

                                {showEmojiPicker && (
                                    <>
                                        <div
                                            className="absolute inset-auto z-40"
                                            onClick={() => setShowEmojiPicker(false)}
                                        />
                                        <div className={cn(
                                            "absolute z-50 flex gap-0.5 rounded-xl border-[1.5px] border-[#E8E0D4] bg-[#FFFFFF] p-1.5 shadow-xl",
                                            isOwn ? "right-0 bottom-12" : "left-0 bottom-12",
                                        )}>
                                            {EMOJI_OPTIONS.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => {
                                                        onToggleReaction(messageId, emoji);
                                                        setShowEmojiPicker(false);
                                                    }}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all duration-150 hover:bg-[#F5EDE3] hover:scale-125 active:scale-90"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {isOwn && onDelete && (
                            <button
                                onClick={() => setShowConfirm(true)}
                                className="rounded-lg p-1.5 text-[#B0A090] transition-all duration-200 hover:bg-[#EF4444]/10 hover:text-[#EF4444] active:bg-[#EF4444]/10"
                                aria-label="Delete message"
                                title="Delete"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                            </button>
                        )}

                        {showConfirm && (
                            <div className="absolute z-[70] flex items-center gap-1 rounded-xl border-[1.5px] border-[#E8E0D4] bg-[#FFFFFF] p-1 shadow-lg ring-1 ring-black/5 min-w-[140px]" style={{ [isOwn ? 'right' : 'left']: '100%', top: '50%', transform: 'translateY(-50%)' }}>
                                <button
                                    onClick={() => {
                                        onDelete?.(messageId);
                                        setShowConfirm(false);
                                    }}
                                    className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#EF4444] transition-all duration-200 hover:bg-[#EF4444]/10"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#7A6A56] transition-all duration-200 hover:bg-[#F5EDE3]"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reaction pills */}
                {hasReactions && (
                    <div className={cn("relative z-10 -mt-2.5 flex flex-wrap gap-1", isOwn ? "justify-end pr-2" : "justify-start pl-2")}>
                        {reactions!.map((r) => {
                            const isMine = currentUserId ? r.userIds.includes(currentUserId) : false;
                            return (
                                <button
                                    key={r.emoji}
                                    onClick={() => onToggleReaction?.(messageId, r.emoji)}
                                    className={cn(
                                        "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs shadow-sm shadow-[rgba(26,18,8,0.08)] transition-all duration-200 hover:scale-110 active:scale-95",
                                        isMine
                                            ? "bg-[#FFFFFF] ring-1 ring-[#B5784A] text-[#1A1208]"
                                            : "bg-[#FFFFFF] ring-1 ring-[#E8E0D4] text-[#7A6A56] hover:ring-[#B5784A] hover:bg-[#F5EDE3]"
                                    )}
                                >
                                    <span>{r.emoji}</span>
                                    <span className="font-bold tabular-nums">{r.count}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
