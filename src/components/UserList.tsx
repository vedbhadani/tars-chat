"use client";

interface User {
    id: string;
    name: string;
    isOnline: boolean;
}

interface UserListProps {
    users?: User[];
}

export function UserList({ users }: UserListProps) {
    // Placeholder users for scaffolding
    const placeholderUsers: User[] = users ?? [
        { id: "1", name: "Alice", isOnline: true },
        { id: "2", name: "Bob", isOnline: true },
        { id: "3", name: "Charlie", isOnline: false },
    ];

    return (
        <div className="flex flex-col gap-1 p-2">
            <h4 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Users
            </h4>
            {placeholderUsers.map((user) => (
                <button
                    key={user.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                >
                    {/* Avatar */}
                    <div className="relative">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                            {user.name.charAt(0)}
                        </div>
                        <span
                            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${user.isOnline ? "bg-emerald-500" : "bg-zinc-500"
                                }`}
                        />
                    </div>

                    {/* Name & status */}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                            {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {user.isOnline ? "Online" : "Offline"}
                        </p>
                    </div>
                </button>
            ))}
        </div>
    );
}
