"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import TextareaAutosize from "react-textarea-autosize";

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

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        if (error) setError(null);
        if (e.target.value.trim()) {
            handleTyping();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="input-bar-wrap border-t-[1.5px] border-[#E8E0D4] bg-[#FFFFFF] px-4 py-3">
            <div className="mx-auto flex max-w-2xl items-center gap-3">
                {/* Text input */}
                <TextareaAutosize
                    minRows={1}
                    maxRows={5}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message…"
                    disabled={isSending}
                    className="flex-1 resize-none rounded-xl border-[1.5px] border-[#E8E0D4] bg-[#FAF7F2] px-4 py-2.5 text-sm text-[#1A1208] placeholder:text-[#B0A090] focus:outline-none focus:border-[#B5784A] focus:shadow-[0_0_0_3px_rgba(181,120,74,0.12)] disabled:opacity-50 transition-all duration-200"
                />

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || isSending}
                    className="flex shrink-0 items-center justify-center rounded-[10px] bg-[#B5784A] h-10 w-10 text-[#FFFFFF] shadow-md shadow-[#B5784A]/20 transition-all duration-200 hover:bg-[#8F5A32] hover:shadow-lg hover:shadow-[#B5784A]/30 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 active:scale-95"
                    aria-label="Send message"
                >
                    {isSending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FFFFFF] border-t-transparent" />
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#FFFFFF"
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
                <div className="mx-auto mt-2 flex max-w-2xl items-center gap-2 px-1 text-xs text-[#EF4444]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" x2="12" y1="8" y2="12" />
                        <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    <span>{error}</span>
                    <button
                        onClick={handleRetry}
                        className="ml-1 font-semibold underline underline-offset-2 transition-colors hover:text-[#EF4444]/80"
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}
