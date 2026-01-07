"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import { LuSend } from "react-icons/lu";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar } from "@/components/chat/Avatar";
import api from "@/lib/api";
import { io, type Socket } from "socket.io-client";

type Message = {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  sentAt: string;
};

type MessagesResponse = {
  messages: Array<Message & { _id?: string }>;
};

export function ChatArea({
  currentUserId,
  activeChat,
}: {
  currentUserId?: string;
  activeChat?: { id: string; name: string } | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const activeChatRef = useRef(activeChat);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const socket = io("http://localhost:5000", {
      query: { userId: currentUserId },
    });
    socketRef.current = socket;

    const handleIncoming = (
      payload: (Message & { _id?: string }) & { senderId?: string; recipientId?: string },
    ) => {
      const active = activeChatRef.current;
      if (!active) {
        return;
      }
      const sender = payload.sender || payload.senderId;
      const recipient = payload.recipient || payload.recipientId;
      if (!sender || !recipient) {
        return;
      }
      const isRelevant =
        (sender === active.id && recipient === currentUserId) ||
        (sender === currentUserId && recipient === active.id);
      if (!isRelevant) {
        return;
      }
      setMessages((prev) => {
        const withoutPending = prev.filter((message) => {
          const isPending = message.id.startsWith("temp-");
          if (!isPending) {
            return true;
          }
          return !(
            message.sender === sender &&
            message.recipient === recipient &&
            message.content === payload.content
          );
        });
        return [
          ...withoutPending,
          {
            id: payload.id || payload._id || `${Date.now()}`,
            sender,
            recipient,
            content: payload.content,
            sentAt: payload.sentAt || new Date().toISOString(),
          },
        ];
      });
    };

    socket.on("message:new", handleIncoming);

    return () => {
      socket.off("message:new", handleIncoming);
      socket.disconnect();
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId || !activeChat?.id) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<MessagesResponse>("/messages", {
          params: { userA: currentUserId, userB: activeChat.id },
        });
        if (isMounted) {
          const items =
            response.data?.messages?.map((message) => ({
              id: message.id || message._id || "",
              sender: message.sender,
              recipient: message.recipient,
              content: message.content,
              sentAt: message.sentAt,
            })) ?? [];
          setMessages(items);
        }
      } catch {
        if (isMounted) {
          setMessages([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, activeChat?.id]);

  const handleSend = async () => {
    if (!currentUserId || !activeChat?.id || !draft.trim()) {
      return;
    }
    const content = draft.trim();
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: currentUserId,
      recipient: activeChat.id,
      content,
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setDraft("");
    setIsSending(true);
    try {
      const socket = socketRef.current;
      if (socket?.connected) {
        socket.emit("message:send", {
          senderId: currentUserId,
          recipientId: activeChat.id,
          content,
        });
      } else {
        const response = await api.post<{ message?: Message & { _id?: string } }>("/messages", {
          senderId: currentUserId,
          recipientId: activeChat.id,
          content,
        });
        const newMessage = response.data?.message;
        if (newMessage) {
          setMessages((prev) => {
            const withoutPending = prev.filter((message) => message.id !== optimisticMessage.id);
            return [
              ...withoutPending,
              {
                id: newMessage.id || newMessage._id || `${Date.now()}`,
                sender: newMessage.sender,
                recipient: newMessage.recipient,
                content: newMessage.content,
                sentAt: newMessage.sentAt,
              },
            ];
          });
        }
      }
    } finally {
      setIsSending(false);
    }
  };
  return (
    <section className="relative min-h-screen bg-[#0f172a]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#101b30] px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={activeChat?.name || "Messages"} />
          <div>
            <p className="text-lg font-semibold text-white">{activeChat?.name || "Select a conversation"}</p>
            <p className="text-xs text-slate-400">{activeChat ? "1:1 conversation" : "Pick someone to start chatting"}</p>
          </div>
          <span className="ml-3 rounded-full bg-[#15223c] px-3 py-1 text-xs text-slate-300">Today</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <LogoutButton />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {!activeChat && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="rounded-3xl border border-white/10 bg-[#111c33]/80 px-8 py-10 text-center shadow-2xl shadow-black/30">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/80 to-indigo-500/80 text-2xl">
                💬
              </div>
              <h2 className="text-lg font-semibold text-white">Select a conversation</h2>
              <p className="mt-2 text-sm text-slate-400">Choose a chat from the sidebar to see messages.</p>
            </div>
          </div>
        )}
        {activeChat && isLoading && <p className="text-sm text-slate-400">Loading messages...</p>}
        {activeChat && !isLoading && messages.length === 0 && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="rounded-2xl border border-white/10 bg-[#111c33]/70 px-6 py-6 text-center">
              <p className="text-sm font-semibold text-white">No messages yet</p>
              <p className="mt-1 text-xs text-slate-400">Start the conversation with a quick hello.</p>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUserId={currentUserId}
            friendName={activeChat?.name}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 border-t border-white/5 bg-[#101b30] px-6 py-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-2.5">
          <input
            placeholder={activeChat ? "Type a message..." : "Select a conversation to start chatting"}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            disabled={!activeChat || isSending}
            className="w-full bg-transparent text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!activeChat || isSending || !draft.trim()}
            className="cursor-pointer text-lg text-sky-400 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Send message"
          >
            <LuSend />
          </button>
        </div>
      </div>
    </section>
  );
}

function MessageBubble({
  message,
  currentUserId,
  friendName,
}: {
  message: Message;
  currentUserId?: string;
  friendName?: string;
}) {
  const isMe = Boolean(currentUserId && message.sender === currentUserId);
  return (
    <div className={`mb-6 flex ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <div className="mr-3">
          <Avatar name={friendName || "Friend"} />
        </div>
      )}
      <div className={`max-w-xl space-y-1 ${isMe ? "text-right" : "text-left"}`}>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {!isMe && <span className="font-semibold text-white">{friendName || "Friend"}</span>}
          <span>{new Date(message.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          {isMe && <span className="font-semibold text-white">You</span>}
        </div>
        <div
          className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isMe ? "bg-[#1b4de2] text-white" : "bg-[#111c33] text-slate-200"
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

function LogoutButton() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="cursor-pointer flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white backdrop-blur transition hover:border-red-400 hover:text-red-100 hover:shadow-[0_10px_30px_-12px_rgba(255,99,132,0.5)]"
    >
      <FiLogOut />
      Logout
    </button>
  );
}
