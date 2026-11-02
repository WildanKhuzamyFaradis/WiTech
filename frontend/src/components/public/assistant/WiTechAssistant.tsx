import React, { useState, useRef, useEffect } from "react"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { MessageCircle, X, Send, Sparkles } from "lucide-react"

import { usePublicData } from "../../../context/PublicDataContext"

import type { ChatMessage, AssistantAction } from "../../../lib/assistant/types"

import { fetchAssistantResponse } from "../../../lib/assistant/assistantClient"

function generateSafeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function formatCurrentTime(): string {
  const d = new Date()

  const hh = String(d.getHours()).padStart(2, "0")

  const mm = String(d.getMinutes()).padStart(2, "0")

  return `${hh}:${mm}`
}

const DEFAULT_QUICK_ACTIONS: AssistantAction[] = [
  { label: "Divisi", payload: "divisi" },

  { label: "Project", payload: "project" },

  { label: "Event", payload: "event" },

  { label: "Cara Gabung", payload: "cara gabung" },

  { label: "FAQ", payload: "faq" },

  { label: "Kontak", payload: "kontak" },

  { label: "Anggota", payload: "anggota" },
]

/**
 * Safely renders AI-generated markdown with clickable links without dangerouslySetInnerHTML.
 */

function SafeFormattedText({ text }: { text: string }) {
  return (
    <div className="markdown-content leading-relaxed text-inherit [&_p]:mb-1 [&_p:last-child]:mb-0 [&_a]:text-inherit [&_a]:font-bold [&_a]:underline [&_a]:break-all [&_a:hover]:text-primary [&_strong]:font-bold [&_em]:italic [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-2 [&_blockquote]:text-current/80 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-foreground [&_pre]:p-2 [&_pre]:text-background [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[10px] [&_code]:sm:text-[11px] [&_h1]:mt-3 [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-black [&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-sm [&_h2]:font-black [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-xs [&_h3]:font-black [&_hr]:my-2 [&_hr]:border-border">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
              className="text-secondary font-bold underline hover:text-primary break-all transition-colors"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary pl-2 text-current/80">
              {children}
            </blockquote>
          ),
          code: ({ children, className, ...props }) => {
            const isInline = !className

            return isInline ? (
              <code
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:text-[11px]"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-lg bg-foreground p-2 text-background">
              {children}
            </pre>
          ),
          h1: ({ children }) => <h1 className="text-base font-black leading-relaxed">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-black leading-relaxed">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs font-black leading-relaxed">{children}</h3>,
          hr: () => <hr className="my-2 border-border" />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

export default function WiTechAssistant() {
  const { loading } = usePublicData()

  const [isOpen, setIsOpen] = useState(false)

  const [input, setInput] = useState("")

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",

      role: "assistant",

      content:
        "Halo 👋\nAku WiTECH Assistant. Mau cari informasi tentang WiTECH?",

      timestamp: formatCurrentTime(),

      responseMeta: {
        type: "direct",

        text: "",

        actions: DEFAULT_QUICK_ACTIONS,
      },
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  // Auto scroll to bottom when message arrives

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  // Focus input when opened

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Close on Escape key

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  const handleSendMessage = (textToSend: string) => {
    const trimmed = textToSend.trim()

    if (!trimmed) return

    const userMsg: ChatMessage = {
      id: generateSafeId(),

      role: "user",

      content: trimmed,

      timestamp: formatCurrentTime(),
    }

    const thinkingId = generateSafeId()

    const thinkingMsg: ChatMessage = {
      id: thinkingId,

      role: "assistant",

      content: "WiTECH Assistant sedang berpikir...",

      timestamp: formatCurrentTime(),

      responseMeta: undefined,
    }

    setMessages((prev) => [...prev, userMsg, thinkingMsg])

    setInput("")

    fetchAssistantResponse(trimmed)

      .then((aiRes) => {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== thinkingId) return m

            if (aiRes.ok && aiRes.reply) {
              return {
                ...m,

                content: aiRes.reply,

                responseMeta: {
                  type: "needs_ai",

                  text: aiRes.reply,

                  actions: [
                    { label: "Lihat Divisi", payload: "divisi" },

                    { label: "Hubungi WiTECH", payload: "kontak" },
                  ],
                },
              }
            }

            // Differentiate rate limit from a general service failure.

            const fallbackText =
              aiRes.reason === "rate_limited"
                ? "Kamu sudah cukup banyak menggunakan fitur jawaban pintar. Coba lagi sebentar."
                : "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia."

            return {
              ...m,

              content: fallbackText,

              responseMeta: {
                type: "direct",

                text: fallbackText,

                actions: [
                  { label: "Divisi", payload: "divisi" },

                  { label: "FAQ", payload: "faq" },

                  { label: "Hubungi WiTECH", payload: "kontak" },
                ],
              },
            }
          }),
        )
      })

      .catch(() => {
        // Fallback on network failure

        const fallbackText =
          "Fitur jawaban pintar sedang tidak tersedia. Aku masih bisa bantu lewat informasi WiTECH yang tersedia."

        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? {
                  ...m,

                  content: fallbackText,

                  responseMeta: {
                    type: "direct",

                    text: fallbackText,

                    actions: [
                      { label: "Divisi", payload: "divisi" },

                      { label: "FAQ", payload: "faq" },

                      { label: "Hubungi WiTECH", payload: "kontak" },
                    ],
                  },
                }
              : m,
          ),
        )
      })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (input.trim()) {
      handleSendMessage(input)
    }
  }

  const handleActionClick = (action: AssistantAction) => {
    if (
      action.payload.startsWith("http://") ||
      action.payload.startsWith("https://")
    ) {
      window.open(action.payload, "_blank", "noopener,noreferrer")

      return
    }

    handleSendMessage(action.payload)
  }

  return (
    <>
      {/* Floating launcher button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Tutup WiTECH Assistant" : "Buka WiTECH Assistant"}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-secondary text-white neo-shadow-md hover:neo-shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border-2 border-border cursor-pointer group"
      >
        {isOpen ? (
          <X
            size={24}
            strokeWidth={2.5}
            className="group-hover:rotate-90 transition-transform"
          />
        ) : (
          <>
            <MessageCircle
              size={26}
              strokeWidth={2.5}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="absolute -top-1 -right-1 flex size-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full size-3.5 bg-primary border-2 border-white" />
            </span>
          </>
        )}
      </button>

      {/* Floating chat dialog */}
      {isOpen && (
        <section
          role="dialog"
          aria-modal="false"
          aria-label="WiTECH Assistant"
          className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 sm:w-[390px] h-[520px] max-h-[82vh] bg-card text-card-foreground border-2 border-border rounded-2xl neo-shadow-lg flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <header className="px-4 py-3.5 bg-foreground text-background border-b-2 border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/40 shrink-0">
                <Sparkles size={16} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight leading-none text-white">
                  WiTECH Assistant
                </h2>
                <p className="text-[11px] font-medium text-background/70 mt-0.5">
                  {loading ? "Memuat data..." : "Bantuan Resmi WiTECH"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup WiTECH Assistant"
              className="p-1.5 rounded-lg text-background/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </header>

          {/* Messages list */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-muted/30 text-sm font-sans"
            tabIndex={0}
            aria-label="Daftar pesan"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm neo-shadow-sm ${
                    msg.role === "user"
                      ? "bg-secondary text-white rounded-tr-xs font-medium"
                      : "bg-card text-foreground border border-border rounded-tl-xs"
                  }`}
                >
                  <SafeFormattedText text={msg.content} />
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Quick actions if provided */}
                {msg.role === "assistant" &&
                  msg.responseMeta?.actions &&
                  msg.responseMeta.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-full">
                      {msg.responseMeta.actions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className="px-2.5 py-1 bg-card hover:bg-muted border border-border rounded-lg text-[11px] font-bold text-secondary hover:text-primary transition-colors neo-shadow-sm cursor-pointer active:scale-95"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-card border-t border-border flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              maxLength={500}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya divisi, project, event..."
              aria-label="Ketik pertanyaan untuk WiTECH Assistant"
              className="flex-1 bg-muted px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-border focus:border-secondary focus:outline-none transition-colors placeholder:text-muted-foreground/60 text-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Kirim pesan"
              className="size-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary/90 disabled:opacity-40 disabled:hover:bg-primary transition-all cursor-pointer neo-shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
            >
              <Send size={15} strokeWidth={2.5} />
            </button>
          </form>
        </section>
      )}
    </>
  )
}
