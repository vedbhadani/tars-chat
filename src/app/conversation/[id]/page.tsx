import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatWindow } from "@/components/ChatWindow";

interface ConversationPageProps {
    params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
    const { id } = await params;

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar — conversation list */}
            <ChatSidebar />

            {/* Main chat area scoped to this conversation */}
            <main className="flex flex-1 flex-col">
                {/* TODO: Fetch conversation data using the id param */}
                <ChatWindow conversationId={id} />
            </main>
        </div>
    );
}
