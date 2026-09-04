import { useRef, useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImagePlus,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useAuth } from "@/hooks/use-auth";
import {
  ColorKey,
  STAR_COLOR_KEYS,
  STAR_COLORS,
  starColor,
  timeAgo,
} from "@/lib/shift-data";

const POST_GLYPHS = ["✦", "✧", "✶", "★", "✺", "💫", "🌙", "🔥", "🌊"] as const;
const FILE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function avatarHue(seed: string): string {
  const palettes = [
    "from-amber-300/80 to-orange-400/80",
    "from-cyan-300/80 to-blue-400/80",
    "from-fuchsia-300/80 to-purple-400/80",
    "from-lime-300/80 to-emerald-400/80",
    "from-rose-300/80 to-pink-400/80",
  ];
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) >>> 0;
  return palettes[n % palettes.length];
}

export default function Community() {
  const { user } = useAuth();

  const posts = useQuery(api.posts.list) ?? [];
  const [posting, setPosting] = useState(false);
  const [text, setText] = useState("");
  const [glyph, setGlyph] = useState<string>("✦");
  const [colorKey, setColorKey] = useState<ColorKey>("nova");
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [expandedId, setExpandedId] = useState<Id<"posts"> | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [commenting, setCommenting] = useState(false);

  const createPost = useMutation(api.posts.create);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const toggleGlow = useMutation(api.posts.toggleGlow);
  const addComment = useMutation(api.posts.addComment);
  const comments =
    useQuery(
      api.posts.listComments,
      expandedId ? { postId: expandedId } : "skip",
    ) ?? [];

  const myId = user?._id;

  const pickImage = async (file: File) => {
    if (!FILE_TYPES.includes(file.type)) {
      toast("That file type won't float", {
        description: "Try a PNG, JPEG, WebP or GIF.",
      });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast("That image is too heavy", {
        description: "Keep it under 4 MB.",
      });
      return;
    }
    const preview = URL.createObjectURL(file);
    setImage({ file, preview });
  };

  const handlePost = async () => {
    if (text.trim().length === 0 && !image) return;
    setPosting(true);
    try {
      let imageId: Id<"_storage"> | undefined;
      if (image) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": image.file.type },
          body: image.file,
        });
        if (!res.ok) throw new Error("Upload failed");
        const { storageId } = (await res.json()) as { storageId: string };
        imageId = storageId as Id<"_storage">;
      }
      await createPost({
        text: text.trim().slice(0, 500),
        emoji: glyph,
        colorKey,
        imageId,
      });
      toast("Star shared with the sky", {
        description: "The community can now glow it up.",
      });
      setText("");
      setGlyph("✦");
      setColorKey("nova");
      if (image) URL.revokeObjectURL(image.preview);
      setImage(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast("Couldn't share that post", {
        description: err instanceof Error ? err.message : "Try again in a moment.",
      });
    } finally {
      setPosting(false);
    }
  };

  const handleComment = async () => {
    if (!expandedId || commentDraft.trim().length === 0) return;
    setCommenting(true);
    try {
      await addComment({ postId: expandedId, text: commentDraft.trim() });
      setCommentDraft("");
    } catch (err) {
      console.error(err);
      toast("Couldn't add your comment", {
        description: err instanceof Error ? err.message : "Try again in a moment.",
      });
    } finally {
      setCommenting(false);
    }
  };

  return (
    <AppShell title="Community">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            The community <span className="text-amber-300">sky</span>
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Share the intention you're holding this week — and see what other
            people are aiming at. Glow the ones that get you.
          </p>
        </div>

        {/* Composer */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"
        >
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tonight I'm hanging: I want to actually listen in hard conversations…"
            maxLength={500}
            rows={3}
            className="resize-none border-white/12 bg-white/5 placeholder:text-foreground/35"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              {POST_GLYPHS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGlyph(g)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-base transition-all ${
                    glyph === g
                      ? "border-amber-300/70 bg-amber-300/10 scale-110"
                      : "border-transparent hover:border-white/20"
                  }`}
                  style={
                    glyph === g
                      ? { color: STAR_COLORS[colorKey].hex, textShadow: `0 0 10px ${STAR_COLORS[colorKey].glow}` }
                      : { color: "#ffffffaa" }
                  }
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="mx-1 h-5 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              {STAR_COLOR_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColorKey(key)}
                  aria-label={STAR_COLORS[key].label}
                  className={`h-5 w-5 rounded-full transition-transform ${
                    colorKey === key ? "scale-125 ring-2 ring-white/70" : "opacity-80 hover:opacity-100"
                  }`}
                  style={{
                    background: STAR_COLORS[key].hex,
                    boxShadow: `0 0 10px ${STAR_COLORS[key].glow}`,
                  }}
                />
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept={FILE_TYPES.join(",")}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void pickImage(f);
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                className="h-8 border-white/15 bg-white/5 text-xs hover:bg-white/10"
              >
                <ImagePlus className="mr-1.5 h-3.5 w-3.5" /> Image
              </Button>
              <Button
                size="sm"
                disabled={posting || (text.trim().length === 0 && !image)}
                onClick={() => void handlePost()}
                className="h-8 rounded-full bg-amber-300 font-bold text-amber-950 hover:bg-amber-200"
              >
                {posting ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Star className="mr-1.5 h-3.5 w-3.5" />
                )}
                Share
              </Button>
            </div>
          </div>
          <p className="mt-1 text-right text-[11px] text-muted-foreground/70">
            {text.length}/500
          </p>

          {image && (
            <div className="relative mt-3 overflow-hidden rounded-2xl border border-white/12">
              <img
                src={image.preview}
                alt="Post preview"
                className="max-h-72 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(image.preview);
                  setImage(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Feed */}
        {posts.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center">
            <p className="text-3xl">🪐</p>
            <p className="mt-3 font-bold tracking-tight">No stars up here yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Be the first to hang a star in the community sky.
            </p>
          </div>
        )}

        <div className="space-y-5">
          <AnimatePresence initial={false}>
            {posts.map((post) => {
              const color = starColor(post.colorKey);
              const isMine = post.author.userId === myId;
              return (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
                >
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {post.author.image ? (
                          <AvatarImage src={post.author.image} alt={post.author.name} />
                        ) : null}
                        <AvatarFallback
                          className={`bg-gradient-to-br ${avatarHue(post.author.userId)} text-sm font-bold text-[#1a1440]`}
                        >
                          {(post.author.name ?? "?").slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                          {post.author.name}
                          {isMine && (
                            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                              you
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {timeAgo(post.createdAt)}
                        </p>
                      </div>
                      {!isMine && post.author.userId !== myId && (
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-muted-foreground hover:text-cyan-200"
                        >
                          <Link
                            to={`/messages?peer=${post.author.userId}`}
                            state={{ peerName: post.author.name }}
                          >
                            <Send className="mr-1.5 h-3.5 w-3.5" /> Message
                          </Link>
                        </Button>
                      )}
                    </div>

                    {post.text && (
                      <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">
                        {post.text}
                      </p>
                    )}

                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt=""
                        loading="lazy"
                        className="mt-3 max-h-96 w-full rounded-2xl border border-white/10 object-cover"
                      />
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-xl"
                          style={{
                            color: color.hex,
                            textShadow: `0 0 12px ${color.glow}`,
                          }}
                        >
                          {post.emoji}
                        </span>
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          {STAR_COLORS[post.colorKey as ColorKey]?.label ?? "star"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            void toggleGlow({ postId: post._id }).catch(() =>
                              toast("Couldn't glow that", {
                                description: "Try again in a moment.",
                              }),
                            )
                          }
                          className={`h-8 text-xs ${
                            post.glowed
                              ? "text-amber-300"
                              : "text-muted-foreground hover:text-amber-200"
                          }`}
                        >
                          <Sparkles
                            className={`mr-1.5 h-4 w-4 ${post.glowed ? "fill-amber-300" : ""}`}
                          />
                          {post.glowCount} glow{post.glowCount === 1 ? "" : "s"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedId((cur) =>
                              cur === post._id ? null : post._id,
                            )
                          }
                          className={`h-8 text-xs ${
                            expandedId === post._id
                              ? "text-cyan-200"
                              : "text-muted-foreground hover:text-cyan-200"
                          }`}
                        >
                          <MessageCircle className="mr-1.5 h-4 w-4" />
                          {post.commentCount}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Comments */}
                  <AnimatePresence initial={false}>
                    {expandedId === post._id && (
                      <motion.div
                        key="comments"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-white/8 bg-black/20"
                      >
                        <div className="space-y-3 p-4">
                          {comments.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                              No words yet — leave the first.
                            </p>
                          )}
                          {comments.map((c) => (
                            <div key={c._id} className="flex items-start gap-2.5">
                              <Avatar className="h-7 w-7">
                                {c.author.image ? (
                                  <AvatarImage
                                    src={c.author.image}
                                    alt={c.author.name}
                                  />
                                ) : null}
                                <AvatarFallback
                                  className={`bg-gradient-to-br ${avatarHue(c.author.userId)} text-[10px] font-bold text-[#1a1440]`}
                                >
                                  {(c.author.name ?? "?").slice(0, 1).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-white/6 px-3 py-2">
                                <p className="flex items-baseline justify-between gap-2">
                                  <span className="text-xs font-bold">
                                    {c.author.name}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {timeAgo(c.createdAt)}
                                  </span>
                                </p>
                                <p className="mt-0.5 text-sm leading-relaxed text-foreground/85">
                                  {c.text}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 pt-1">
                            <InputComment
                              value={commentDraft}
                              onChange={setCommentDraft}
                              disabled={commenting}
                              onSend={() => void handleComment()}
                            />
                            <Button
                              size="sm"
                              disabled={
                                commenting || commentDraft.trim().length === 0
                              }
                              onClick={() => void handleComment()}
                              className="h-8 rounded-full bg-cyan-300/90 font-bold text-cyan-950 hover:bg-cyan-200"
                            >
                              {commenting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}

function InputComment({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !disabled && value.trim().length > 0) onSend();
      }}
      placeholder="Add a word of support…"
      maxLength={300}
      className="h-8 min-w-0 flex-1 rounded-full border border-white/12 bg-white/5 px-3.5 text-xs placeholder:text-foreground/35 focus:border-cyan-300/50 focus:outline-none"
    />
  );
}
