"use client";

import { useState } from "react";
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
    const sendMessage = useMutation(api.messages.send);

    const handleSend = async () => {
        const content = message.trim();
        if (!content || isSending) return;

        setIsSending(true);
        setMessage(""); // Clear immediately for snappy UX

        try {
            await sendMessage({
                conversationId,
                senderId,
                content,
            });
        } catch (err) {
            console.error("Failed to send message:", err);
            setMessage(content); // Restore on failure
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-border px-4 py-3">
            <div className="mx-auto flex max-w-2xl items-center gap-2">
                {/* Text input */}
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message…"
                    disabled={isSending}
                    className="flex-1 rounded-xl border border-input bg-muted/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 transition-all"
                />

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || isSending}
                    className="shrink-0 rounded-xl bg-primary p-2.5 text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    aria-label="Send message"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m22 2-7 20-4-9-9-4Z" />
                        <path d="M22 2 11 13" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
