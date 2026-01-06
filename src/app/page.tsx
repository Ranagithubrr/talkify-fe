"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { FiLogOut } from "react-icons/fi";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <main className="min-h-screen bg-[#0a1221]" />;
  }

  return (
    <main className="relative min-h-screen bg-[#0b1222] text-white">
      <Sidebar userName={user?.name || user?.email || "You"} />
      <div className="ml-[320px] min-h-screen">
        <ChatArea />
      </div>
    </main>
  );
}

type ChatItem = {
  name: string;
  preview: string;
  time: string;
  unread?: boolean;
  active?: boolean;
  status?: "online" | "offline";
};

const chats: ChatItem[] = [
  { name: "Frontend Team", preview: "Alice: Can you check the PR?", time: "10:20 AM", active: true, status: "online" },
  { name: "John Doe", preview: "See you tomorrow at 10.", time: "Yesterday" },
  { name: "Project Alpha", preview: "Update the launch details delayed.", time: "Mon" },
  { name: "Sarah Smith", preview: "Sounds good", time: "Mon" },
  { name: "Design Team", preview: "New files were uploaded.", time: "Last week" },
  { name: "David Chen", preview: "Are we still meeting?", time: "2 weeks ago" },
];

function Sidebar({ userName }: { userName: string }) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 z-10 flex w-[320px] flex-col border-r border-white/5 bg-[#0c1628]">
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-black">
          T
        </div>
        <p className="text-lg font-semibold">Chats</p>
        <button className="ml-auto rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:brightness-110">
          Add Friend
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
        {chats.map((chat) => (
          <ChatListItem key={chat.name} chat={chat} />
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
      className={`rounded-full px-3 py-1 ${active ? "bg-white text-[#0c1628]" : "bg-[#121d32] text-slate-300"
        }`}
    >
      {label}
    </span>
  );
}

function ChatListItem({ chat }: { chat: ChatItem }) {
  return (
    <div
      className={`group flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 transition ${chat.active ? "bg-[#17223a]" : "hover:bg-[#111c33]"
        }`}
    >
      <div className="relative">
        <Avatar name={chat.name} />
        {chat.status === "online" && <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-[#0c1628]" />}
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

type Message = {
  id: number;
  from: "me" | "alice" | "bob";
  name: string;
  text: string;
  time: string;
  attached?: boolean;
};

const messages: Message[] = [
  { id: 1, from: "alice", name: "Alice", text: "Hey team! I just pushed the latest changes to the staging branch. Can someone please review the PR when they have a moment?", time: "10:15 AM" },
  { id: 2, from: "bob", name: "Bob", text: "I'm on it. Taking a look now.", time: "10:18 AM" },
  { id: 3, from: "me", name: "You", text: "Thanks Bob! Also, here is the updated design spec for the login page we discussed yesterday.", time: "10:22 AM", attached: true },
  { id: 4, from: "alice", name: "Alice", text: "Perfect, received it! I'll incorporate these changes into the next sprint.", time: "10:30 AM" },
];

function ChatArea() {
  return (
    <section className="relative min-h-screen bg-[#0f172a]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#101b30] px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar name="Frontend Team" />
          <div>
            <p className="text-lg font-semibold text-white">Frontend Team</p>
            <p className="text-xs text-slate-400">3 members, 1 online</p>
          </div>
          <span className="ml-3 rounded-full bg-[#15223c] px-3 py-1 text-xs text-slate-300">Today</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <LogoutButton />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <div className="sticky bottom-0 border-t border-white/5 bg-[#101b30] px-6 py-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3">
          <span className="text-xl">➕</span>
          <input
            placeholder="Type a message..."
            className="w-full bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
          />
          <div className="flex items-center gap-2 text-slate-300">
            <span className="cursor-pointer text-lg hover:text-white">😊</span>
            <span className="cursor-pointer text-lg hover:text-white">📎</span>
            <span className="cursor-pointer text-lg hover:text-white">📷</span>
            <span className="cursor-pointer text-lg hover:text-white">📩</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isMe = message.from === "me";
  return (
    <div className={`mb-6 flex ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <div className="mr-3">
          <Avatar name={message.name} />
        </div>
      )}
      <div className={`max-w-xl space-y-1 ${isMe ? "text-right" : "text-left"}`}>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {!isMe && <span className="font-semibold text-white">{message.name}</span>}
          <span>{message.time}</span>
          {isMe && <span className="font-semibold text-white">You</span>}
        </div>
        <div
          className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed ${isMe ? "bg-[#1b4de2] text-white" : "bg-[#111c33] text-slate-200"
            }`}
        >
          {message.text}
        </div>
        {message.attached && (
          <div className="flex justify-end">
            <div className="h-28 w-24 rounded-xl border border-white/10 bg-white/80" />
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-sm font-semibold text-white">
      {initial}
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
