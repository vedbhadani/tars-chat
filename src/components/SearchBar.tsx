"use client";

import { useState } from "react";

interface SearchBarProps {
    placeholder?: string;
    onSearch?: (query: string) => void;
}

export function SearchBar({
    placeholder = "Search conversations…",
    onSearch,
}: SearchBarProps) {
    const [query, setQuery] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch?.(value);
    };

    return (
        <div className="relative">
            {/* Search icon */}
            <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
            </svg>

            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full rounded-lg border border-input bg-muted/50 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
        </div>
    );
}
