import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, RotateCcw, Loader2 } from "lucide-react";
import { aiService } from "../services/aiService";
import { useAppStore } from "../store/appStore";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "tutor";
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "0",
    role: "tutor",
    text: "Hello! 👋 I'm your English AI Tutor. I can help you with grammar questions, sentence analysis, vocabulary examples, and much more! What would you like to work on today?",
    time: "now",
  },
];

const QUICK_PROMPTS = [
  "Explain the difference between 'since' and 'for'",
  "Give me examples of modal verbs",
  "What's the passive voice?",
  "Help me with phrasal verbs",
];

const ANALYZER_LANGUAGE_OPTIONS = [
  { code: "vi", label: "Vietnamese" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" }
];

export default function AICabin() {
  const { user } = useAppStore();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [analyzerSentence, setAnalyzerSentence] = useState("");
  const [analyzerLang, setAnalyzerLang] = useState(user?.nativeLang || "vi");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", text, time: "now" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const tutorMsgId = Date.now().toString() + "r";
    const tutorPlaceholder: Message = { id: tutorMsgId, role: "tutor", text: "", time: "now" };
    setMessages(prev => [...prev, tutorPlaceholder]);
    setIsTyping(true);

    let accumulatedText = "";
    try {
      await aiService.chatTutorStream(
        text,
        analyzerLang,
        (chunk) => {
          setIsTyping(false);
          accumulatedText += chunk;
          setMessages(prev =>
            prev.map(m => m.id === tutorMsgId ? { ...m, text: accumulatedText } : m)
          );
        },
        (error) => {
          console.error("Streaming error:", error);
          toast.error("Hệ thống AI đang gặp sự cố. Vui lòng thử lại!");
          setMessages(prev =>
            prev.map(m =>
              m.id === tutorMsgId
                ? { ...m, text: accumulatedText ? accumulatedText + "\n\n⚠️ *[Lỗi kết nối giữa chừng]*" : "🦉 Rất tiếc, hệ thống AI Tutor đang gặp sự cố kỹ thuật. Bạn vui lòng thử lại sau nhé!" }
                : m
            )
          );
          setIsTyping(false);
        }
      );
    } catch (error: any) {
      toast.error("Failed to get response from AI Tutor");
      setMessages(prev =>
        prev.map(m =>
          m.id === tutorMsgId
            ? { ...m, text: "🦉 Rất tiếc, hệ thống AI Tutor đang gặp sự cố kỹ thuật. Bạn vui lòng thử lại sau nhé!" }
            : m
        )
      );
      setIsTyping(false);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analyzerSentence.trim()) return;
    setAnalyzing(true);
    setAnalysis(null);
    
    try {
      const result = await aiService.explainSentence(analyzerSentence, "", analyzerLang);
      setAnalysis(result);
    } catch (error: any) {
      toast.error("Failed to analyze sentence");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex h-full min-h-screen text-left" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
      {/* Chat panel */}
      <div className="flex flex-col flex-1 min-w-0 border-r" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
        {/* Chat header */}
        <div className="px-6 py-4 border-b flex items-center gap-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--brand-purple)" }}
          >
            <span style={{ fontSize: 20 }}>🦉</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "var(--foreground)" }}>AI Tutor Hoot</div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--brand)" }} />
              <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600 }}>Online — always ready to help</span>
            </div>
          </div>
          <button
            onClick={() => setMessages(INITIAL_MESSAGES)}
            type="button"
            className="ml-auto cursor-pointer border-none outline-none bg-transparent"
            style={{ color: "#aaa" }}
            title="Clear chat"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: msg.role === "tutor"
                    ? "var(--brand-purple)"
                    : "var(--brand)",
                  fontSize: msg.role === "tutor" ? 16 : 13,
                  color: "#fff",
                  fontWeight: 800,
                  marginTop: 4,
                }}
              >
                {msg.role === "tutor" ? "🦉" : "A"}
              </div>
              <div
                className="px-4 py-3 rounded-2xl max-w-sm text-left"
                style={{
                  background: msg.role === "tutor" ? "var(--card)" : "var(--brand)",
                  border: msg.role === "tutor" ? "1.5px solid var(--border)" : "none",
                  color: msg.role === "tutor" ? "var(--foreground)" : "#fff",
                  fontSize: 13.5,
                  lineHeight: 1.7,
                  borderRadius: msg.role === "tutor" ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
                }}
                dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                }}
              />
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--brand-purple)", fontSize: 16, marginTop: 4 }}
              >
                🦉
              </div>
              <div
                className="px-4 py-3 rounded-2xl flex items-center gap-1"
                style={{ background: "var(--card)", border: "1.5px solid var(--border)", borderRadius: "4px 18px 18px 18px" }}
              >
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full animate-bounce"
                    style={{ background: "var(--brand-purple)", animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-5 pb-2 flex gap-2 overflow-x-auto">
          {QUICK_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              type="button"
              className="shrink-0 px-3 py-1.5 rounded-full cursor-pointer border-none outline-none"
              style={{ background: "#f5f3ff", border: "1.5px solid #ddd6fe", color: "#7c3aed", fontWeight: 600, fontSize: 12 }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div
          className="px-5 py-4 border-t flex gap-3"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask Hoot anything about English..."
            className="flex-1 px-4 py-2.5 rounded-2xl outline-none"
            style={{
              border: "2px solid var(--border)",
              fontSize: 14,
              fontFamily: "var(--font-family)",
              background: "var(--input-background)",
              color: "var(--foreground)",
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-none outline-none shrink-0"
            style={{
              background: input.trim() ? "var(--brand-purple)" : "var(--muted)",
            }}
          >
            <Send size={15} color="#fff" />
          </button>
        </div>
      </div>

      {/* Sentence Analyzer panel */}
      <div
        className="shrink-0 flex flex-col overflow-hidden hidden lg:flex border-l"
        style={{ width: 340, background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="px-6 py-4 border-b flex items-center gap-2 text-left" style={{ borderColor: "var(--border)" }}>
          <Sparkles size={16} style={{ color: "var(--brand-orange)" }} />
          <span style={{ fontWeight: 800, fontSize: 15, color: "var(--foreground)" }}>Sentence Analyzer</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-left">
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 8 }}>
              Enter a sentence to analyze
            </label>
            <textarea
              value={analyzerSentence}
              onChange={e => setAnalyzerSentence(e.target.value)}
              placeholder="e.g. She have been studying since morning."
              rows={4}
              className="w-full px-4 py-3 rounded-xl outline-none resize-none"
              style={{
                border: "2px solid var(--border)",
                fontSize: 13.5,
                fontFamily: "var(--font-family)",
                background: "var(--input-background)",
                color: "var(--foreground)",
                lineHeight: 1.7,
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted-foreground)", display: "block", marginBottom: 8 }}>
              Explanation language
            </label>
            <select
              value={analyzerLang}
              onChange={e => setAnalyzerLang(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl outline-none cursor-pointer"
              style={{
                border: "2px solid var(--border)",
                fontSize: 13.5,
                fontFamily: "var(--font-family)",
                background: "var(--input-background)",
                color: "var(--foreground)",
              }}
            >
              {ANALYZER_LANGUAGE_OPTIONS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!analyzerSentence.trim() || analyzing}
            type="button"
            className="py-3 rounded-xl cursor-pointer border-none outline-none text-white transition-all shadow-md"
            style={{
              background: analyzerSentence.trim() ? "var(--brand-orange)" : "var(--muted)",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {analyzing ? "Analyzing..." : "⚡ Analyze Sentence"}
          </button>

          {analyzing && (
            <div className="text-center py-4">
              <div className="flex gap-1.5 justify-center mb-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ background: "var(--brand-orange)", animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>Analyzing your sentence...</div>
            </div>
          )}

          {analysis && !analyzing && (
            <div
              className="rounded-2xl p-5 animate-fade-in"
              style={{ background: "var(--brand-gold-light)", border: "2px solid var(--brand-gold)" }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-orange)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                Analysis Result
              </div>
              <div
                style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{
                  __html: analysis.replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
