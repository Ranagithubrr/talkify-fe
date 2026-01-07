"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/chat/Avatar";
import api from "@/lib/api";

type ChatItem = {
  name: string;
  preview: string;
  time: string;
  unread?: boolean;
  active?: boolean;
  status?: "online" | "offline";
};

type ConversationResponse = {
  conversations: Array<{
    _id: string;
    lastMessage?: {
      content?: string;
      sentAt?: string;
    };
    lastMessageAt?: string;
    receiver?: {
      id: string;
      name: string;
      email?: string;
      photo?: string | null;
    };
    receiverName?: string;
  }>;
};

export function Sidebar({
  userId,
  userName,
  onOpenFindFriend,
}: {
  userId?: string;
  userName: string;
  onOpenFindFriend: () => void;
}) {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setChats([]);
      return;
    }

    let isMounted = true;
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<ConversationResponse>("/conversations", {
          params: { userId },
        });
        const items =
          response.data?.conversations?.map((conversation, index) => {
            const receiverName =
              conversation.receiverName || conversation.receiver?.name || "Unknown";
            const messageTime = conversation.lastMessageAt || conversation.lastMessage?.sentAt;
            return {
              name: receiverName,
              preview: conversation.lastMessage?.content || "No messages yet",
              time: messageTime ? new Date(messageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
              active: index === 0,
            };
          }) ?? [];
        if (isMounted) {
          setChats(items);
        }
      } catch {
        if (isMounted) {
          setChats([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchConversations();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-10 flex w-[320px] flex-col border-r border-white/5 bg-[#0c1628]">
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-black">
          T
        </div>
        <p className="text-lg font-semibold">Chats</p>
        <button
          className="ml-auto rounded-full cursor-pointer bg-linear-to-r from-indigo-500 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:brightness-110"
          type="button"
          onClick={onOpenFindFriend}
        >
          Find Friend
        </button>
      </div>

      <div className="px-4">
        <input
          placeholder="Search chats..."
          className="mb-3 w-full rounded-xl border border-white/10 bg-[#0f1b31] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
        />
        <div className="mb-3 flex gap-2 text-xs font-semibold text-slate-300">
          <Tag label="All" active />
          <Tag label="Groups" />
          <Tag label="Unread" />
          <Tag label="Archived" />
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {isLoading && <p className="px-3 text-xs text-slate-400">Loading conversations...</p>}
        {!isLoading && chats.length === 0 && (
          <p className="px-3 text-xs text-slate-400">No conversations yet.</p>
        )}
        {chats.map((chat) => (
          <ChatListItem key={`${chat.name}-${chat.time}`} chat={chat} />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-white/5 px-4 py-3 text-sm text-slate-300">
        <div className="flex items-center gap-3">
          <Avatar name={userName} />
          <div>
            <p className="font-semibold text-white">{userName}</p>
            <p className="text-xs text-slate-400">Online</p>
          </div>
        </div>
        <div className="flex gap-2 text-slate-400">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111c33]">⚙️</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111c33]">📤</span>
        </div>
      </div>
    </aside>
  );
}

function Tag({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 ${
        active ? "bg-white text-[#0c1628]" : "bg-[#121d32] text-slate-300"
      }`}
    >
      {label}
    </span>
  );
}

function ChatListItem({ chat }: { chat: ChatItem }) {
  return (
    <div
      className={`group flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 transition ${
        chat.active ? "bg-[#17223a]" : "hover:bg-[#111c33]"
      }`}
    >
      <div className="relative">
        <Avatar name={chat.name} />
        {chat.status === "online" && (
          <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-[#0c1628]" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold text-white">{chat.name}</p>
          <span className="text-[11px] text-slate-400">{chat.time}</span>
        </div>
        <p className="text-xs text-slate-400">{chat.preview}</p>
      </div>
      {chat.unread && <span className="h-2 w-2 rounded-full bg-blue-400" />}
    </div>
  );
}
