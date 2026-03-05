"use client";

import { useState } from "react";

interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (query: string) => void;
}

export function SearchBar({
    placeholder = "Search users…",
    value,
    onChange,
}: SearchBarProps) {
    const [internalQuery, setInternalQuery] = useState("");
    const currentValue = value ?? internalQuery;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInternalQuery(val);
        onChange?.(val);
    };

    return (
        <div className="relative">
            {/* Search icon */}
            <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
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
                value={currentValue}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full rounded-lg border border-border/40 bg-muted/30 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200"
            />

            {/* Clear button */}
            {currentValue && (
                <button
                    onClick={() => {
                        setInternalQuery("");
                        onChange?.("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground/50 transition-colors duration-200 hover:text-foreground hover:bg-muted/50"
                    aria-label="Clear search"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}
