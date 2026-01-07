"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/chat/Avatar";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

type Friend = {
  id: string;
  name: string;
  email: string;
  status: "online" | "offline";
};

type UsersResponse = {
  users: Array<{
    _id: string;
    name: string;
    email: string;
    photo?: string | null;
  }>;
};

export function FindFriendModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<UsersResponse>("/users");
        const items =
          response.data?.users
            ?.filter((user) => user._id !== currentUserId)
            .map((user) => ({
              id: user._id,
              name: user.name,
              email: user.email,
              status: "offline",
            })) ?? [];
        if (isMounted) {
          setFriends(items);
        }
      } catch {
        if (isMounted) {
          setFriends([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  const handleMessage = async (friendId: string) => {
    if (!currentUserId) {
      return;
    }
    setActiveUserId(friendId);
    try {
      await api.post("/conversations", {
        memberA: currentUserId,
        memberB: friendId,
      });
      onSuccess();
      onClose();
    } finally {
      setActiveUserId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0f172a] p-6 text-white shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Find Friend</h2>
            <p className="text-sm text-slate-400">Start a new conversation.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 transition hover:border-white/30 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {isLoading && <p className="text-xs text-slate-400">Loading users...</p>}
          {!isLoading && friends.length === 0 && <p className="text-xs text-slate-400">No users found.</p>}
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111c33] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar name={friend.name} />
                  <span
                    className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border border-[#0f172a] ${
                      friend.status === "online" ? "bg-emerald-400" : "bg-slate-500"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">{friend.name}</p>
                  <p className="text-xs text-slate-400">{friend.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleMessage(friend.id)}
                disabled={activeUserId === friend.id}
                className="cursor-pointer rounded-full bg-gradient-to-r from-[#3b6df6] to-[#2a5be6] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {activeUserId === friend.id ? "Sending..." : "Message"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
