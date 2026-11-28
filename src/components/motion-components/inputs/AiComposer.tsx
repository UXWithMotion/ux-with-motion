/**
 * AI Composer. Designed from Figma nodes 2635:5245 & 2336:2588.
 *
 * Clean expanded composer with cycling blur prompts on the top row, "+ Add files"
 * attachment tiles (2336:2588), right-aligned "GPT-5 mini" model selector popover,
 * live microphone voice dictation + waveform, and state-aware send control on the bottom row.
 */
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowUp,
  Check,
  ChevronUp,
  FileText,
  Mic,
  Plus,
  Square,
  X,
} from "lucide-react";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export type AIComposerModel = { name: string; note: string };

export type AIComposerProps = {
  /** Example asks the placeholder cycles through. */
  prompts?: string[];
  models?: AIComposerModel[];
  /** BCP-47 language tag for live SpeechRecognition (defaults to browser language). */
  speechLang?: string;
  onSubmit?: (
    message: string,
    files: File[],
    options: { model: string }
  ) => void;
  className?: string;
};

const PROMPTS = [
  "Ask anything…",
  "Tell me what's in my mail today",
  "Summarize my meetings for tomorrow",
  "Draft a reply to Maya about Friday",
  "Plan a slow weekend in Kyoto",
];

const MODELS: AIComposerModel[] = [
  { name: "GPT-5 mini", note: "Quick everyday answers" },
  { name: "GPT-5", note: "Smart and fast for most things" },
  { name: "GPT-5 Thinking", note: "Thinks longer for harder asks" },
  { name: "GPT-4o", note: "Great with images and voice" },
];

type Attachment = { id: number; file: File; url?: string };

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
  webkitAudioContext?: typeof AudioContext;
};

export function AIComposer({
  prompts = PROMPTS,
  models = MODELS,
  speechLang,
  onSubmit,
  className,
}: AIComposerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const modelMenuRef = useRef<HTMLDivElement | null>(null);
  const modelButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuListRef = useRef<HTMLUListElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const voiceSessionRef = useRef(0);
  const nextId = useRef(0);
  const baseTextRef = useRef("");
  const speechBurstRef = useRef(0);

  const [text, setText] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(0);
  const [model, setModel] = useState(models[0]?.name ?? "GPT-5 mini");
  const [menu, setMenu] = useState(false);
  const [menuPos, setMenuPos] = useState<{
    top?: number;
    bottom?: number;
    right: number;
    placeAbove: boolean;
  } | null>(null);
  const [sent, setSent] = useState<{ id: number; text: string } | null>(null);

  const hasText = text.trim().length > 0;
  const canSend = hasText || files.length > 0;

  // Cycle placeholder prompts gently while empty
  useEffect(() => {
    if (hasText || listening || voiceError) return;
    const t = setInterval(
      () => setPrompt((p) => (p + 1) % prompts.length),
      3000
    );
    return () => clearInterval(t);
  }, [hasText, listening, voiceError, prompts.length]);

  useEffect(() => {
    if (!voiceError) return;
    const t = window.setTimeout(() => setVoiceError(null), 3500);
    return () => clearTimeout(t);
  }, [voiceError]);

  const cleanupVoiceResources = useCallback(() => {
    voiceSessionRef.current += 1;
    speechBurstRef.current = 0;

    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped
      }
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    analyserRef.current = null;

    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
  }, []);

  useEffect(() => cleanupVoiceResources, [cleanupVoiceResources]);

  const updateMenuPosition = useCallback(() => {
    const rect = modelButtonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const estHeight = Math.min(models.length * 56 + 16, 280);
    const placeAbove = rect.top >= estHeight + 16;
    const right = Math.max(
      12,
      Math.min(window.innerWidth - rect.right, window.innerWidth - 248)
    );
    setMenuPos(
      placeAbove
        ? { bottom: window.innerHeight - rect.top + 10, right, placeAbove: true }
        : { top: rect.bottom + 10, right, placeAbove: false }
    );
  }, [models.length]);

  // Keep portaled model popover anchored & close on outside click
  useEffect(() => {
    if (!menu) return;
    const raf = window.requestAnimationFrame(updateMenuPosition);
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        !modelMenuRef.current?.contains(target) &&
        !menuListRef.current?.contains(target)
      ) {
        setMenu(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [menu, updateMenuPosition]);

  // Free object URLs on unmount
  const urls = useRef<Set<string>>(new Set());
  useEffect(() => {
    const all = urls.current;
    return () => all.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const addFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).map((file) => {
      const url = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;
      if (url) urls.current.add(url);
      return { id: nextId.current++, file, url };
    });
    setFiles((f) => [...f, ...picked]);
    e.target.value = "";
    inputRef.current?.focus();
  };

  const removeFile = (id: number) =>
    setFiles((f) => {
      const gone = f.find((a) => a.id === id);
      if (gone?.url) {
        URL.revokeObjectURL(gone.url);
        urls.current.delete(gone.url);
      }
      return f.filter((a) => a.id !== id);
    });

  const stopListening = () => {
    cleanupVoiceResources();
    setListening(false);
  };

  const cancelListening = () => {
    cleanupVoiceResources();
    setListening(false);
    setText(baseTextRef.current);
  };

  /** Live microphone voice input via Web Speech API + AudioContext analyser. */
  const startListening = async () => {
    cleanupVoiceResources();
    const sessionId = voiceSessionRef.current;

    baseTextRef.current = text;
    setVoiceError(null);
    setMenu(false);

    const win = window as SpeechWindow;
    const SpeechRecognitionCtor =
      win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setVoiceError("Speech-to-text is not supported in this browser");
      return;
    }

    setListening(true);

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang || navigator.language || "en-US";

      recognition.onresult = (event) => {
        if (sessionId !== voiceSessionRef.current) return;
        let spoken = "";
        for (let i = 0; i < event.results.length; i += 1) {
          spoken += event.results[i]?.[0]?.transcript ?? "";
        }
        const trimmed = spoken.trimStart();
        const prefix = baseTextRef.current.trimEnd();
        setText(
          trimmed
            ? prefix
              ? `${prefix} ${trimmed}`
              : trimmed
            : baseTextRef.current
        );
        speechBurstRef.current = 0.72;
      };

      recognition.onerror = (event) => {
        if (sessionId !== voiceSessionRef.current) return;
        if (event.error === "aborted") return;
        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          cleanupVoiceResources();
          setListening(false);
          setVoiceError("Microphone access denied");
        } else if (event.error === "audio-capture") {
          cleanupVoiceResources();
          setListening(false);
          setVoiceError("No microphone detected");
        }
      };

      recognition.onend = () => {
        if (sessionId !== voiceSessionRef.current) return;
        cleanupVoiceResources();
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      if (sessionId !== voiceSessionRef.current) return;
      cleanupVoiceResources();
      setListening(false);
      setVoiceError("Could not start voice input");
      return;
    }

    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (sessionId !== voiceSessionRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        mediaStreamRef.current = stream;

        const AudioCtx = window.AudioContext ?? win.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioCtxRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.72;
          source.connect(analyser);
          analyserRef.current = analyser;
        }
      } catch (err) {
        if (sessionId !== voiceSessionRef.current) return;
        const name = err instanceof DOMException ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          cleanupVoiceResources();
          setListening(false);
          setVoiceError("Microphone permission denied");
          return;
        }
        if (name === "NotFoundError") {
          cleanupVoiceResources();
          setListening(false);
          setVoiceError("No microphone found");
          return;
        }
      }
    }
  };

  const send = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;
    if (listening) stopListening();
    onSubmit?.(
      text.trim(),
      files.map((a) => a.file),
      { model }
    );
    setSent({
      id: nextId.current++,
      text: text.trim() || `${files.length} file${files.length > 1 ? "s" : ""}`,
    });
    setText("");
    files.forEach((a) => a.url && URL.revokeObjectURL(a.url));
    setFiles([]);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Escape") return;
    if (menu) return setMenu(false);
    if (listening) stopListening();
    inputRef.current?.blur();
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn(
          "relative flex w-full items-center justify-center bg-transparent font-['Plus_Jakarta_Sans',sans-serif] text-[#1f2123]",
          className
        )}
        onKeyDown={onKeyDown}
      >
        <form
          onSubmit={send}
          className="relative w-full max-w-[508px] @container"
        >
          {/* Sent text drifts upward and fades out */}
          <AnimatePresence>
            {sent && (
              <motion.p
                key={sent.id}
                initial={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                animate={{ opacity: 0, y: -56, filter: "blur(6px)" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                onAnimationComplete={() => setSent(null)}
                className="pointer-events-none absolute top-4 left-4 z-30 max-w-[80%] truncate text-[16px] font-medium text-[#1f2123]"
              >
                {sent.text}
              </motion.p>
            )}
          </AnimatePresence>

          <div
            onClick={() => inputRef.current?.focus()}
            className="relative flex w-full cursor-text flex-col gap-[16px] rounded-[16px] border border-[#d8dee9] bg-white p-[16px]"
          >
            {/* Attachment tiles (Figma 2336:2588) */}
            <AnimatePresence initial={false}>
              {files.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-[8px] overflow-hidden"
                >
                  <AnimatePresence initial={false}>
                    {files.map((a) => (
                      <motion.li
                        key={a.id}
                        initial={{
                          opacity: 0,
                          scale: 0.92,
                          filter: "blur(4px)",
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          filter: "blur(0px)",
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.92,
                          filter: "blur(4px)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className="flex h-[56px] w-[232px] max-w-full items-center gap-[8px] rounded-[8px] border border-[#d8dee9] bg-white px-[8px]"
                      >
                        {a.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.url}
                            alt=""
                            className="size-[30px] shrink-0 rounded-[6px] object-cover"
                          />
                        ) : (
                          <span className="grid size-[30px] shrink-0 place-items-center rounded-[6px] bg-[#f5f6f7]">
                            <FileText
                              className="size-[16px] text-[#62646a]"
                              strokeWidth={1.75}
                            />
                          </span>
                        )}
                        <span className="flex min-w-0 flex-1 flex-col items-start gap-[2px] leading-[16px]">
                          <span className="w-full truncate text-[12px] font-medium leading-[16px] text-[#1f2123]">
                            {a.file.name}
                          </span>
                          <span className="w-full truncate text-[12px] font-medium leading-[16px] text-[#62646a]">
                            {formatFileMetadata(a.file)}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(a.id);
                          }}
                          aria-label={`Remove ${a.file.name}`}
                          className="grid size-[20px] shrink-0 cursor-pointer place-items-center rounded-[6px] text-[#62646a] transition-colors hover:bg-[#f5f6f7] hover:text-[#1f2123]"
                        >
                          <X className="size-[16px]" strokeWidth={1.75} />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </AnimatePresence>

            {/* Top Prompt Row (exact Figma 2635:5283 padding & typography) */}
            <div className="relative flex w-full items-center py-[8px]">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                aria-label="Message"
                autoComplete="off"
                className="relative z-10 h-[20px] w-full bg-transparent text-[16px] font-medium leading-[1.2] text-[#1f2123] outline-none"
              />
              {!text && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 flex items-center overflow-hidden py-[8px]"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={
                        listening
                          ? "listening"
                          : voiceError
                            ? "voice-error"
                            : prompt
                      }
                      initial={{ y: 12, opacity: 0, filter: "blur(5px)" }}
                      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                      exit={{ y: -12, opacity: 0, filter: "blur(5px)" }}
                      transition={{
                        duration: 0.48,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="truncate text-[16px] font-medium leading-[1.2] text-[#62646a]"
                    >
                      {listening
                        ? "Listening…"
                        : voiceError || prompts[prompt % prompts.length]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Bottom Controls Row */}
            <AnimatePresence mode="wait" initial={false}>
              {listening ? (
                <motion.div
                  key="voice-controls"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-[36px] w-full items-center gap-[8px]"
                >
                  {/* Cancel voice input button (36px, 8px radius) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelListening();
                      inputRef.current?.focus();
                    }}
                    aria-label="Cancel voice input"
                    className="grid size-[36px] shrink-0 cursor-pointer place-items-center rounded-[8px] border border-[#d8dee9] bg-white text-[#1f2123] transition-colors duration-150 hover:bg-[#f7f9fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
                  >
                    <X className="size-[16px]" strokeWidth={1.85} />
                  </button>

                  {/* Full-width live speech waveform */}
                  <VoiceWaveform
                    analyserRef={analyserRef}
                    energyRef={speechBurstRef}
                  />

                  {/* Right voice actions: Stop & Send */}
                  <div className="flex shrink-0 items-center gap-[4px]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        stopListening();
                        inputRef.current?.focus();
                      }}
                      aria-label="Stop voice input"
                      className="grid size-[36px] shrink-0 cursor-pointer place-items-center rounded-[8px] border border-[#d8dee9] bg-white text-[#1f2123] transition-colors duration-150 hover:bg-[#f7f9fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
                    >
                      <Square className="size-[11px] fill-current" />
                    </button>

                    <motion.button
                      type="submit"
                      disabled={!canSend}
                      whileTap={canSend ? { scale: 0.94 } : undefined}
                      aria-label="Send message"
                      className={cn(
                        "grid size-[36px] shrink-0 place-items-center rounded-[8px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]",
                        canSend
                          ? "cursor-pointer bg-[#111] text-white hover:bg-[#222]"
                          : "cursor-not-allowed bg-[#f1f3f6] text-[#62646a]"
                      )}
                    >
                      <ArrowUp className="size-[18px]" strokeWidth={2} />
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="default-controls"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="flex w-full items-center justify-between gap-2"
                >
                  {/* Left Prompt Tool: Add files */}
                  <div className="flex shrink-0 items-center">
                    {/* Button - Add files (36px square, 8px radius, #111) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileRef.current?.click();
                      }}
                      aria-label="Add files"
                      className="grid size-[36px] shrink-0 cursor-pointer place-items-center rounded-[8px] bg-[#111] text-white transition-transform duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
                    >
                      <Plus className="size-[18px]" strokeWidth={2.2} />
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      hidden
                      onChange={addFiles}
                    />
                  </div>

                  {/* Right Controls: Model selector, Voice input & Send control */}
                  <div className="flex min-w-0 items-center gap-[4px]">
                    {/* Model Selector Pill */}
                    <div ref={modelMenuRef} className="relative min-w-0 shrink">
                      <button
                        ref={modelButtonRef}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!menu) {
                            updateMenuPosition();
                          }
                          setMenu((m) => !m);
                        }}
                        aria-haspopup="listbox"
                        aria-expanded={menu}
                        className="flex h-[36px] max-w-full cursor-pointer items-center gap-[4px] rounded-[8px] px-[10px] text-[13px] font-medium leading-[19.5px] text-[#333] transition-colors hover:bg-[#f1f3f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
                      >
                        <span className="truncate">{model}</span>
                        <motion.span
                          animate={{ rotate: menu ? 180 : 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="grid shrink-0"
                        >
                          <ChevronUp
                            className="size-[14px] text-[#62646a]"
                            strokeWidth={2.2}
                          />
                        </motion.span>
                      </button>

                      {typeof document !== "undefined" &&
                        createPortal(
                          <AnimatePresence>
                            {menu && menuPos && (
                              <motion.ul
                                ref={menuListRef}
                                role="listbox"
                                aria-label="Model"
                                initial={{
                                  opacity: 0,
                                  y: menuPos.placeAbove ? 8 : -8,
                                  scale: 0.96,
                                  filter: "blur(6px)",
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                  scale: 1,
                                  filter: "blur(0px)",
                                }}
                                exit={{
                                  opacity: 0,
                                  y: menuPos.placeAbove ? 8 : -8,
                                  scale: 0.96,
                                  filter: "blur(6px)",
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 520,
                                  damping: 34,
                                }}
                                style={{
                                  position: "fixed",
                                  top: menuPos.top,
                                  bottom: menuPos.bottom,
                                  right: menuPos.right,
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                className={cn(
                                  "z-[200] w-[236px] rounded-[14px] border border-[#d8dee9] bg-white p-1.5 font-['Plus_Jakarta_Sans',sans-serif] shadow-[0_16px_36px_-12px_rgba(0,0,0,0.18)]",
                                  menuPos.placeAbove
                                    ? "origin-bottom-right"
                                    : "origin-top-right"
                                )}
                              >
                                {models.map((m, i) => (
                                  <motion.li
                                    key={m.name}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.03 * i }}
                                  >
                                    <button
                                      type="button"
                                      role="option"
                                      aria-selected={m.name === model}
                                      onClick={() => {
                                        setModel(m.name);
                                        setMenu(false);
                                        inputRef.current?.focus();
                                      }}
                                      className="flex w-full cursor-pointer items-center gap-3 rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-[#f1f3f6] focus-visible:bg-[#f1f3f6] focus-visible:outline-none"
                                    >
                                      <span className="min-w-0 flex-1">
                                        <span className="block text-[13px] font-medium text-[#1f2123]">
                                          {m.name}
                                        </span>
                                        <span className="block text-[11px] text-[#62646a]">
                                          {m.note}
                                        </span>
                                      </span>
                                      {m.name === model && (
                                        <Check
                                          className="size-4 shrink-0 text-[#111]"
                                          strokeWidth={2.4}
                                        />
                                      )}
                                    </button>
                                  </motion.li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>,
                          document.body
                        )}
                    </div>

                    {/* Voice input button (36px, 8px radius) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startListening();
                      }}
                      aria-label="Voice input"
                      aria-pressed={listening}
                      className="grid size-[36px] shrink-0 cursor-pointer place-items-center rounded-[8px] bg-transparent text-[#62646a] transition-colors duration-150 hover:bg-[#f1f3f6] hover:text-[#1f2123] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
                    >
                      <Mic className="size-[18px]" strokeWidth={1.85} />
                    </button>

                    {/* Send control button (36px, 8px radius, #f1f3f6 idle -> #111 active) */}
                    <motion.button
                      type="submit"
                      disabled={!canSend}
                      whileTap={canSend ? { scale: 0.94 } : undefined}
                      aria-label="Send message"
                      className={cn(
                        "grid size-[36px] shrink-0 place-items-center rounded-[8px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]",
                        canSend
                          ? "cursor-pointer bg-[#111] text-white hover:bg-[#222]"
                          : "cursor-not-allowed bg-[#f1f3f6] text-[#62646a]"
                      )}
                    >
                      <ArrowUp className="size-[18px]" strokeWidth={2} />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </MotionConfig>
  );
}

const WAVE_BAR_COUNT = 52;
const INITIAL_WAVE: number[] = Array.from(
  { length: WAVE_BAR_COUNT },
  () => 0.05
);

/** Scrolling horizontal live microphone waveform shown while dictating. */
function VoiceWaveform({
  analyserRef,
  energyRef,
}: {
  analyserRef: { current: AnalyserNode | null };
  energyRef: { current: number };
}) {
  const prefersReducedMotion = useReducedMotion();
  const [levels, setLevels] = useState<number[]>(INITIAL_WAVE);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let timeData: Uint8Array<ArrayBuffer> | null = null;

    const id = window.setInterval(() => {
      let micLevel = 0;
      const analyser = analyserRef.current;

      if (analyser) {
        if (!timeData || timeData.length !== analyser.fftSize) {
          timeData = new Uint8Array(new ArrayBuffer(analyser.fftSize));
        }
        analyser.getByteTimeDomainData(timeData);
        let sumSq = 0;
        for (let i = 0; i < timeData.length; i += 1) {
          const sample = (timeData[i] - 128) / 128;
          sumSq += sample * sample;
        }
        const rms = Math.sqrt(sumSq / timeData.length);
        micLevel = Math.min(1, Math.max(0, (rms - 0.01) * 7));
      }

      const fallbackBurst = energyRef.current;
      energyRef.current = Math.max(0, fallbackBurst * 0.78);
      const next = Math.min(1, Math.max(0.05, Math.max(micLevel, fallbackBurst)));

      setLevels((prev) => [...prev.slice(1), next]);
    }, 55);

    return () => clearInterval(id);
  }, [analyserRef, energyRef, prefersReducedMotion]);

  return (
    <div
      aria-hidden
      className="flex h-[28px] min-w-0 flex-1 items-center justify-center gap-[3px] overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]"
    >
      {levels.map((level, i) => {
        const height = Math.round(2 + level * 20);
        const isActive = level > 0.16;
        return (
          <span
            key={i}
            className={cn(
              "w-[2px] shrink-0 rounded-full transition-[height,opacity,background-color] duration-100 ease-out",
              isActive ? "bg-[#3f4248]" : "bg-[#b0b5bf]"
            )}
            style={{
              height,
              opacity: isActive ? 0.45 + level * 0.5 : 0.42,
            }}
          />
        );
      })}
    </div>
  );
}

const formatBytes = (b: number) =>
  b < 1024
    ? `${b} B`
    : b < 1048576
      ? `${Math.round(b / 1024)} KB`
      : `${(b / 1048576).toFixed(1)} MB`;

const formatFileMetadata = (file: File) => {
  const nameExt = file.name.includes(".")
    ? file.name.split(".").pop()?.trim().toUpperCase()
    : "";
  const mimeExt = file.type.includes("/")
    ? file.type.split("/").pop()?.split("+")[0]?.trim().toUpperCase()
    : "";
  const label =
    nameExt && nameExt.length <= 6
      ? nameExt
      : mimeExt && mimeExt.length <= 6
        ? mimeExt
        : "";
  const size = formatBytes(file.size);
  return label ? `${label} · ${size}` : size;
};

export default AIComposer;
