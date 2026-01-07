"use client";

import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar } from "@/components/chat/Avatar";

type Message = {
  id: number;
  from: "me" | "alice" | "bob";
  name: string;
  text: string;
  time: string;
  attached?: boolean;
};

const messages: Message[] = [
  {
    id: 1,
    from: "alice",
    name: "Alice",
    text: "Hey team! I just pushed the latest changes to the staging branch. Can someone please review the PR when they have a moment?",
    time: "10:15 AM",
  },
  { id: 2, from: "bob", name: "Bob", text: "I'm on it. Taking a look now.", time: "10:18 AM" },
  {
    id: 3,
    from: "me",
    name: "You",
    text: "Thanks Bob! Also, here is the updated design spec for the login page we discussed yesterday.",
    time: "10:22 AM",
    attached: true,
  },
  { id: 4, from: "alice", name: "Alice", text: "Perfect, received it! I'll incorporate these changes into the next sprint.", time: "10:30 AM" },
];

export function ChatArea() {
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
          className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isMe ? "bg-[#1b4de2] text-white" : "bg-[#111c33] text-slate-200"
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
