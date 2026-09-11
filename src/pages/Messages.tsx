import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, MessageCircle, Send } from "lucide-react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell, initialsOf } from "@/components/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/use-auth";
import { timeAgo } from "@/lib/shift-data";

function convoTimeLabel(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const myId = user?._id;

  const [openId, setOpenId] = useState<Id<"conversations"> | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const startConversation = useMutation(api.messages.startConversation);
  const sendMessage = useMutation(api.messages.sendMessage);
  const conversations = useQuery(api.messages.listConversations) ?? [];
  const peerIdParam = searchParams.get("peer");
  // The ?peer= deep link resolves reactively from the conversation list.
  const peerConvo = useMemo(
    () =>
      peerIdParam
        ? (conversations.find((c) => c.otherUserId === peerIdParam) ?? null)
        : null,
    [conversations, peerIdParam],
  );
  const activeId = openId ?? peerConvo?._id ?? null;

  const messages =
    useQuery(
      api.messages.listMessages,
      activeId ? { conversationId: activeId } : "skip",
    ) ?? [];
  const peerNameFromState = useMemo(() => {
    const st = location.state as { peerName?: string } | null;
    return st?.peerName ?? null;
  }, [location.state]);

  const desktopScrollRef = useRef<HTMLDivElement | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);

  // Create (once) the conversation behind a ?peer= deep link when none exists.
  const startingRef = useRef(false);
  useEffect(() => {
    if (!peerIdParam || !myId) return;
    if (peerConvo) {
      setSearchParams({}, { replace: true });
      return;
    }
    if (startingRef.current || conversations.length === 0) return;
    startingRef.current = true;
    void startConversation({ otherUserId: peerIdParam as Id<"users"> })
      .then((id) => {
        setOpenId(id);
        setSearchParams({}, { replace: true });
      })
      .catch((err) => {
        console.error(err);
        toast("Couldn't open that conversation", {
          description: err instanceof Error ? err.message : "Try again in a moment.",
        });
      })
      .finally(() => {
        startingRef.current = false;
      });
  }, [peerIdParam, myId, peerConvo, conversations.length, startConversation, setSearchParams]);

  useEffect(() => {
    const scroll = (el: HTMLDivElement | null) => {
      el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    };
    scroll(desktopScrollRef.current);
    scroll(mobileScrollRef.current);
  }, [messages.length, openId]);

  const handleSend = async () => {
    if (!openId || draft.trim().length === 0) return;
    setSending(true);
    try {
      await sendMessage({ conversationId: openId, text: draft.trim() });
      setDraft("");
    } catch (err) {
      console.error(err);
      toast("Couldn't send that", {
        description: err instanceof Error ? err.message : "Try again in a moment.",
      });
    } finally {
      setSending(false);
    }
  };

  const openConvo = conversations.find((c) => c._id === openId) ?? null;

  return (
    <AppShell title="Messages">
      <div className="panel mx-auto flex h-[calc(100vh-10rem)] max-w-5xl flex-col overflow-hidden lg:h-[calc(100vh-9rem)]">
        <div className="flex h-full min-h-0 flex-col md:flex-row">
          {/* Conversation list */}
          <aside
            className={`${
              openConvo ? "hidden md:flex" : "flex"
            } w-full shrink-0 flex-col border-white/10 md:w-72 md:border-r`}
          >
            <div className="border-b border-white/8 p-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
                <MessageCircle className="h-5 w-5 text-emerald-200" /> Messages
              </h2>
              <p className="font-eyebrow mt-0.5 text-muted-foreground">
                Notes between star-hangers
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {conversations.length === 0 && (
                <div className="px-3 py-10 text-center">
                  <p className="text-2xl">🛰️</p>
                  <p className="mt-2 text-sm font-semibold">Silence in space</p>
                  <p className="mx-auto mt-1 max-w-[200px] text-xs leading-relaxed text-muted-foreground">
                    Find a star you love in Community and send its holder a
                    note.
                  </p>
                </div>
              )}
              {conversations.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => setOpenId(c._id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                    openId === c._id
                      ? "bg-emerald-300/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    {c.otherImage ? (
                      <AvatarImage src={c.otherImage} alt={c.otherName} />
                    ) : null}
                    <AvatarFallback className="border border-emerald-200/25 bg-emerald-200/10 font-mono text-xs font-semibold text-emerald-100">
                      {initialsOf(c.otherName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold">
                        {c.otherName}
                      </span>
                      <span className="shrink-0 font-eyebrow text-muted-foreground">
                        {timeAgo(c.lastAt)}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {c.lastMessage ?? "Say hello 👋"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {/* Thread */}
          <section className="hidden min-w-0 flex-1 flex-col md:flex">
            {openConvo ? (
              <>
                <header className="flex items-center gap-3 border-b border-white/8 p-4">
                  <Avatar className="h-9 w-9">
                    {openConvo.otherImage ? (
                      <AvatarImage
                        src={openConvo.otherImage}
                        alt={openConvo.otherName}
                      />
                    ) : null}
                    <AvatarFallback className="border border-emerald-200/25 bg-emerald-200/10 font-mono text-xs font-semibold text-emerald-100">
                      {initialsOf(openConvo.otherName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {openConvo.otherName}
                    </p>
                    <p className="font-eyebrow text-muted-foreground">
                      {peerNameFromState ? "from the community sky" : "fellow star-hanger"}
                    </p>
                  </div>
                </header>
                <div
                  ref={desktopScrollRef}
                  className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
                >
                  {messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <p className="text-3xl">👋</p>
                      <p className="mt-2 text-sm font-semibold">
                        This is a quiet channel
                      </p>
                      <p className="mt-1 max-w-[240px] text-xs text-muted-foreground">
                        Drop the first note — maybe about a star you noticed.
                      </p>
                    </div>
                  )}
                  {messages.map((m) => {
                    const mine = m.senderId === myId;
                    return (
                      <motion.div
                        key={m._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-3.5 py-2 ${
                            mine
                              ? "rounded-br-sm bg-emerald-300/90 text-emerald-950"
                              : "rounded-bl-sm bg-white/8 text-foreground/90"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{m.text}</p>
                          <p
                            className={`mt-1 text-right text-[10px] ${
                              mine ? "text-emerald-900/60" : "text-muted-foreground"
                            }`}
                          >
                            {convoTimeLabel(m.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 border-t border-white/8 p-3">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && draft.trim()) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="Write to the sky…"
                    maxLength={1000}
                    className="h-10 min-w-0 flex-1 rounded-full border border-white/12 bg-white/5 px-4 text-sm placeholder:text-foreground/35 focus:border-emerald-300/40 focus:outline-none"
                  />
                  <Button
                    size="icon"
                    disabled={sending || draft.trim().length === 0}
                    onClick={() => void handleSend()}
                    className="h-10 w-10 shrink-0 rounded-full bg-foreground text-background hover:bg-foreground/85"
                    aria-label="Send message"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="hidden flex-1 flex-col items-center justify-center md:flex">
                <p className="text-4xl">🌠</p>
                <p className="mt-3 font-bold tracking-tight">
                  Choose a conversation
                </p>
                <p className="mx-auto mt-1 max-w-[240px] text-center text-sm text-muted-foreground">
                  Or find someone in the community whose star resonates and
                  message them from there.
                </p>
              </div>
            )}
          </section>

          {/* Mobile thread overlay */}
          {openConvo && (
            <div className="flex min-h-[70vh] flex-1 flex-col md:hidden">
              <div className="flex items-center gap-3 border-b border-white/8 p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenId(null)}
                  className="text-muted-foreground"
                >
                  ← Back
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="border border-emerald-200/25 bg-emerald-200/10 font-mono text-[10px] font-semibold text-emerald-100">
                    {initialsOf(openConvo.otherName)}
                  </AvatarFallback>
                </Avatar>
                <p className="truncate text-sm font-bold">
                  {openConvo.otherName}
                </p>
              </div>
              <div
                ref={mobileScrollRef}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
              >
                {messages.map((m) => {
                  const mine = m.senderId === myId;
                  return (
                    <div
                      key={m._id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${                            mine
                              ? "rounded-br-sm bg-emerald-300/90 text-emerald-950"
                              : "rounded-bl-sm bg-white/8 text-foreground/90"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{m.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 border-t border-white/8 p-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && draft.trim()) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Write to the sky…"
                  maxLength={1000}
                  className="h-10 min-w-0 flex-1 rounded-full border border-white/12 bg-white/5 px-4 text-sm placeholder:text-foreground/35 focus:border-emerald-300/40 focus:outline-none"
                />
                <Button
                  size="icon"
                  disabled={sending || draft.trim().length === 0}
                  onClick={() => void handleSend()}
                  className="h-10 w-10 shrink-0 rounded-full bg-foreground text-background hover:bg-foreground/85"
                  aria-label="Send message"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
