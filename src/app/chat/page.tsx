import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatWindow } from "@/components/ChatWindow";

export default function ChatPage() {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar — conversation list */}
            <ChatSidebar />

            {/* Main chat area */}
            <main className="flex flex-1 flex-col">
                <ChatWindow />
            </main>
        </div>
    );
}
