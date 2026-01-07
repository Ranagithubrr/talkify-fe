"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { FindFriendModal } from "@/components/chat/FindFriendModal";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const [isFindFriendOpen, setIsFindFriendOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeChat, setActiveChat] = useState<{ id: string; name: string } | null>(null);

  const handleConversationCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) {
    return <main className="min-h-screen bg-[#0a1221]" />;
  }

  return (
    <main className="relative min-h-screen bg-[#0b1222] text-white">
      <Sidebar
        userId={user?.id}
        userName={user?.name || user?.email || "You"}
        onOpenFindFriend={() => setIsFindFriendOpen(true)}
        refreshKey={refreshKey}
        onSelectChat={setActiveChat}
        activeChatId={activeChat?.id}
      />
      <div className="ml-[320px] min-h-screen">
        <ChatArea currentUserId={user?.id} activeChat={activeChat} />
      </div>
      {isFindFriendOpen && (
        <FindFriendModal
          onClose={() => setIsFindFriendOpen(false)}
          onSuccess={handleConversationCreated}
        />
      )}
    </main>
  );
}
