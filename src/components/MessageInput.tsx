"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface MessageInputProps {
    conversationId: Id<"conversations">;
    senderId: Id<"users">;
}

export function MessageInput({ conversationId, senderId }: MessageInputProps) {
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sendMessage = useMutation(api.messages.send);
    const startTyping = useMutation(api.typing.startTyping);
    const stopTyping = useMutation(api.typing.stopTyping);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced typing indicator — fires on every keystroke,
    // but auto-clears after 2 seconds of inactivity
    const handleTyping = useCallback(() => {
        startTyping({ conversationId, userId: senderId }).catch(() => { });

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set a new timeout to stop typing after 2 seconds
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping({ conversationId, userId: senderId }).catch(() => { });
        }, 2000);
    }, [conversationId, senderId, startTyping, stopTyping]);

    const handleSend = async () => {
        const content = message.trim();
        if (!content || isSending) return;

        setError(null);

        // Clear typing indicator immediately on send
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        stopTyping({ conversationId, userId: senderId }).catch(() => { });

        try {
            await sendMessage({
                conversationId,
                senderId,
                content,
            });
            setMessage("");
        } catch (err) {
            console.error("Failed to send message:", err);
            setError("Message failed to send.");
        } finally {
            setIsSending(false);
        }
    };

    const handleRetry = () => {
        handleSend();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        if (error) setError(null);
        if (e.target.value.trim()) {
            handleTyping();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-border/40 bg-background/80 backdrop-blur-sm px-4 py-3">
            <div className="mx-auto flex max-w-2xl items-center gap-3">
                {/* Text input */}
                <input
                    type="text"
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message…"
                    disabled={isSending}
                    className="flex-1 rounded-xl border border-border/40 bg-muted/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 disabled:opacity-50 transition-all duration-200"
                />

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || isSending}
                    className="flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/85 h-10 w-10 text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 active:scale-95"
                    aria-label="Send message"
                >
                    {isSending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-0.5"
                        >
                            <path d="m22 2-7 20-4-9-9-4Z" />
                            <path d="M22 2 11 13" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-auto mt-2 flex max-w-2xl items-center gap-2 px-1 text-xs text-destructive">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" x2="12" y1="8" y2="12" />
                        <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    <span>{error}</span>
                    <button
                        onClick={handleRetry}
                        className="ml-1 font-semibold underline underline-offset-2 transition-colors hover:text-destructive/80"
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}
