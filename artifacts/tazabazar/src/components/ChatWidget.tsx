import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Phone, Bot } from "lucide-react";
import { useCreateOpenaiConversation, useGetOpenaiConversation } from "@workspace/api-client-react";
import { useLang } from "@/context/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export default function ChatWidget() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const createConvo = useCreateOpenaiConversation();
  const { data: existingConvo } = useGetOpenaiConversation(conversationId ?? 0, {
    query: { enabled: false } as any,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ensureConversation = async (): Promise<number> => {
    if (conversationId) return conversationId;
    const convo = await createConvo.mutateAsync({
      data: { title: `Chat ${new Date().toLocaleString()}`, phone: phone || undefined },
    });
    setConversationId(convo.id);
    return convo.id;
  };

  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0) {
      setMessages([{ role: "assistant", content: t.chatGreeting }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput("");
    setSending(true);

    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      const id = await ensureConversation();
      const response = await fetch(`/api/openai/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: userMsg }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                accumulated += data.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: accumulated, streaming: true };
                  return updated;
                });
              }
              if (data.done) {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: accumulated, streaming: false };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Sorry, something went wrong. Please try again.", streaming: false };
        return updated;
      });
    }

    setSending(false);
  };

  const handleSavePhone = () => {
    setPhone(phoneInput);
    setShowPhoneForm(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleOpen}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all ${open ? "opacity-0 pointer-events-none scale-75" : "opacity-100 scale-100"}`}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* Chat window */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-border flex flex-col transition-all duration-300 ${open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"}`}
        style={{ height: "500px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary rounded-t-2xl text-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">TazaBot</p>
              <p className="text-xs text-green-100">{t.chatSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowPhoneForm(!showPhoneForm)}
              className="p-1.5 rounded-full hover:bg-white/20 transition"
              title="Link phone number"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-white/20 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Phone form */}
        {showPhoneForm && (
          <div className="px-4 py-2 bg-primary/10 border-b border-border flex gap-2 flex-shrink-0">
            <input
              type="tel"
              placeholder={t.yourPhone}
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
            <button onClick={handleSavePhone} className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition">
              {t.savePhone}
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {msg.content || (msg.streaming && <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>)}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-3 border-t border-border flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={t.typeMessage}
            className="flex-1 text-sm px-3 py-2 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-muted/30"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
