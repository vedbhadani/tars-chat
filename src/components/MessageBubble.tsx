import { cn } from "@/lib/utils";

interface MessageBubbleProps {
    message: string;
    isOwn: boolean;
    timestamp?: string;
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
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isOwn
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-muted text-foreground"
                )}
            >
                <p>{message}</p>
                {timestamp && (
                    <span
                        className={cn(
                            "mt-1 block text-[10px]",
                            isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                        )}
                    >
                        {timestamp}
                    </span>
                )}
            </div>
        </div>
    );
}
