import { cn } from "@/lib/utils";

interface MessageBubbleProps {
    message: string;
    isOwn: boolean;
    timestamp?: number;
}

function formatMessageTime(ts: number): string {
    const date = new Date(ts);
    return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export function MessageBubble({ message, isOwn, timestamp }: MessageBubbleProps) {
    return (
        <div
            className={cn(
                "flex w-full",
                isOwn ? "justify-end" : "justify-start"
            )}
        >
            <div
                className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
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
        </div>
    );
}
