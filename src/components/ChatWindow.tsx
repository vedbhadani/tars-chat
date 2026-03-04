"use client";

import { MessageBubble } from "@/components/MessageBubble";
import { MessageInput } from "@/components/MessageInput";

interface ChatWindowProps {
    conversationId?: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
    return (
        <div className="flex flex-1 flex-col bg-background">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                        U
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">
                            {conversationId ? `Conversation #${conversationId}` : "Select a conversation"}
                        </h3>
                        <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* TODO: Add call / info buttons */}
                </div>
            </header>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
                {conversationId ? (
                    <div className="mx-auto flex max-w-2xl flex-col gap-3">
                        {/* TODO: Map over messages from Convex */}
                        <MessageBubble
                            message="Hey, welcome to TARS Chat! 👋"
                            isOwn={false}
                        />
                        <MessageBubble
                            message="Thanks! This looks awesome."
                            isOwn={true}
                        />
                        <MessageBubble
                            message="It's still a placeholder, but the structure is all set."
                            isOwn={false}
                        />
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">
                            Select a conversation to start messaging
                        </p>
                    </div>
                )}
            </div>

            {/* Input area */}
            {conversationId && <MessageInput />}
        </div>
    );
}
