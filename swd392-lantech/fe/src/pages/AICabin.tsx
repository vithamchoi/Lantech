import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, RotateCcw, Loader2 } from "lucide-react";
import { aiService } from "../services/aiService";
import { useAppStore } from "../store/appStore";
import { toast } from "sonner";
import { parseMarkdownToHtml } from "../utils/markdown";
import { useTranslation } from "../hooks/useTranslation";

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

const QUICK_PROMPTS_KEYS = [
  "quickPrompt1",
  "quickPrompt2",
  "quickPrompt3",
  "quickPrompt4"
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
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [analyzerSentence, setAnalyzerSentence] = useState("");
  const [analyzerLang, setAnalyzerLang] = useState(user?.nativeLang || "vi");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "analyzer">("chat");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: "0",
        role: "tutor",
        text: t("aiCabinWelcome"),
        time: "now",
      }
    ]);
  }, [t]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", text, time: "now" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const tutorMsgId = Date.now().toString() + "r";
    setIsTyping(true);

    let accumulatedText = "";
    let addedPlaceholder = false;

    try {
      await aiService.chatTutorStream(
        text,
        analyzerLang,
        (chunk) => {
          setIsTyping(false);
          accumulatedText += chunk;
          if (!addedPlaceholder) {
            addedPlaceholder = true;
            const newTutorMsg: Message = { id: tutorMsgId, role: "tutor", text: accumulatedText, time: "now" };
            setMessages(prev => [...prev, newTutorMsg]);
          } else {
            setMessages(prev =>
              prev.map(m => m.id === tutorMsgId ? { ...m, text: accumulatedText } : m)
            );
          }
        },
        (error) => {
          console.error("Streaming error:", error);
          toast.error(t("aiSystemError"));
          setIsTyping(false);
          if (!addedPlaceholder) {
            const errorMsg: Message = { 
              id: tutorMsgId, 
              role: "tutor", 
              text: t("aiTutorOfflineMsg"), 
              time: "now" 
            };
            setMessages(prev => [...prev, errorMsg]);
          } else {
            setMessages(prev =>
              prev.map(m =>
                m.id === tutorMsgId
                  ? { ...m, text: accumulatedText + "\n\n⚠️ *[Connection Error]*" }
                  : m
              )
            );
          }
        }
      );
    } catch (error: any) {
      toast.error(t("failedToGetAiResponse"));
      setIsTyping(false);
      if (!addedPlaceholder) {
        const errorMsg: Message = { 
          id: tutorMsgId, 
          role: "tutor", 
          text: t("aiTutorOfflineMsg"), 
          time: "now" 
        };
        setMessages(prev => [...prev, errorMsg]);
      }
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
      toast.error(t("failedToAnalyzeSentence"));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex w-full text-left overflow-hidden" style={{ fontFamily: "var(--font-family)", background: "var(--background)", height: "calc(100vh - 70px)" }}>
      {/* Main panel */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Chat header */}
        <div
          className="px-6 border-b flex items-center justify-between shrink-0"
          style={{ background: "var(--card)", borderColor: "var(--border)", height: 70, boxSizing: "border-box" }}
        >
          <div className="flex items-center gap-3 text-left">
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
                <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600 }}>{t("aiCabinStatus")}</span>
              </div>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl" style={{ border: "1.5px solid var(--border)" }}>
            <button
              onClick={() => setActiveTab("chat")}
              type="button"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border-none outline-none cursor-pointer transition-all"
              style={{
                background: activeTab === "chat" ? "var(--card)" : "transparent",
                color: activeTab === "chat" ? "var(--foreground)" : "var(--muted-foreground)",
                fontWeight: 700,
                fontSize: 13,
                boxShadow: activeTab === "chat" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
              }}
              title={t("chatTabTitle")}
            >
              {t("chatTabLabel")}
            </button>
            <button
              onClick={() => setActiveTab("analyzer")}
              type="button"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border-none outline-none cursor-pointer transition-all"
              style={{
                background: activeTab === "analyzer" ? "var(--card)" : "transparent",
                color: activeTab === "analyzer" ? "var(--foreground)" : "var(--muted-foreground)",
                fontWeight: 700,
                fontSize: 13,
                boxShadow: activeTab === "analyzer" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
              }}
              title={t("analyzerTabTitle")}
            >
              {t("analyzerTabLabel")}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm(t("refreshChatConfirm"))) {
                  setMessages([{ id: "0", role: "tutor", text: t("aiCabinWelcome"), time: "now" }]);
                }
              }}
              type="button"
              className="cursor-pointer border-none outline-none bg-transparent hover:opacity-80 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: "#aaa" }}
              title={t("refreshChatTitle")}
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Tab body content */}
        {activeTab === "chat" ? (
          <>
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
                      __html: parseMarkdownToHtml(msg.text),
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
            <div className="px-5 pb-2 flex gap-2 overflow-x-auto shrink-0">
              {QUICK_PROMPTS_KEYS.map(key => {
                const promptText = t(key);
                return (
                  <button
                    key={key}
                    onClick={() => sendMessage(promptText)}
                    type="button"
                    className="shrink-0 px-3 py-1.5 rounded-full cursor-pointer border-none outline-none"
                    style={{ background: "#f5f3ff", border: "1.5px solid #ddd6fe", color: "#7c3aed", fontWeight: 600, fontSize: 12 }}
                  >
                    {promptText}
                  </button>
                );
              })}
            </div>

            {/* Input */}
            <div
              className="px-5 py-4 border-t flex gap-3 shrink-0"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                placeholder={t("aiCabinPlaceholder")}
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
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col lg:flex-row gap-6 text-left" style={{ background: "var(--background)" }}>
            {/* Left side: Analyzer Input */}
            <div className="flex-1 flex flex-col gap-5 max-w-xl">
              <div className="p-6 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <h3 className="m-0 mb-4 flex items-center gap-2" style={{ fontSize: 16, fontWeight: 800, color: "var(--foreground)" }}>
                  <Sparkles size={18} style={{ color: "var(--brand-orange)" }} />
                  {t("grammarAnalysisHeader")}
                </h3>
                <p className="m-0 mb-4" style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
                  {t("grammarAnalysisDesc")}
                </p>
                <textarea
                  value={analyzerSentence}
                  onChange={e => setAnalyzerSentence(e.target.value)}
                  placeholder={t("analyzerTextareaPlaceholder")}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{
                    border: "2px solid var(--border)",
                    fontSize: 13.5,
                    fontFamily: "var(--font-family)",
                    background: "var(--input-background)",
                    color: "var(--foreground)",
                    minHeight: 120,
                    lineHeight: 1.7,
                    resize: "vertical",
                  }}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !analyzerSentence.trim()}
                  className="w-full py-3 mt-4 rounded-xl cursor-pointer border-none outline-none flex items-center justify-center gap-2 text-white font-bold"
                  style={{
                    background: analyzerSentence.trim() ? "var(--brand-orange)" : "var(--muted)",
                    fontSize: 13.5,
                    opacity: analyzing || !analyzerSentence.trim() ? 0.6 : 1,
                  }}
                >
                  <Sparkles size={16} />
                  {analyzing ? t("analyzerBtnAnalyzing") : t("analyzerBtnAnalyze")}
                </button>
              </div>
            </div>

            {/* Right side: Analyzer Results */}
            <div className="flex-1 flex flex-col gap-5">
              <div className="p-6 rounded-2xl border flex-1 flex flex-col justify-between" style={{ background: "var(--card)", borderColor: "var(--border)", minHeight: 300 }}>
                <div>
                  <h3 className="m-0 mb-4" style={{ fontSize: 16, fontWeight: 800, color: "var(--foreground)" }}>
                    {t("analyzerResultHeader")}
                  </h3>

                  {analyzing && (
                    <div className="text-center py-12">
                      <div className="flex gap-1.5 justify-center mb-2">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ background: "var(--brand-orange)", animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>{t("analyzerAnalyzingStatus")}</div>
                    </div>
                  )}

                  {analysis && !analyzing && (
                    <div
                      className="overflow-y-auto pr-2"
                      style={{ fontSize: 13.5, color: "var(--foreground)", lineHeight: 1.8, maxHeight: 400 }}
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdownToHtml(analysis),
                      }}
                    />
                  )}

                  {!analysis && !analyzing && (
                    <div className="text-center py-12 opacity-60">
                      <span style={{ fontSize: 40, display: "block", marginBottom: 16 }}>📝</span>
                      <p className="m-0" style={{ fontSize: 13.5, color: "var(--muted-foreground)" }}>
                        {t("analyzerNoData")}
                      </p>
                    </div>
                  )}
                </div>

                {analysis && !analyzing && (
                  <div className="mt-6 pt-4 border-t flex gap-3" style={{ borderColor: "var(--border)" }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(analysis);
                        toast.success(t("analysisCopied"));
                      }}
                      type="button"
                      className="flex-1 py-2.5 rounded-xl cursor-pointer border outline-none font-bold text-xs"
                      style={{ background: "transparent", borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      {t("btnCopyResult")}
                    </button>
                    <button
                      onClick={() => {
                        const userMsg: Message = { id: Date.now().toString(), role: "user", text: t("analyzerChatPrefix", { sentence: analyzerSentence }), time: "now" };
                        const tutorMsg: Message = { id: (Date.now() + 1).toString(), role: "tutor", text: analysis, time: "now" };
                        setMessages(prev => [...prev, userMsg, tutorMsg]);
                        setActiveTab("chat");
                        toast.success(t("analysisSavedToChat"));
                      }}
                      type="button"
                      className="flex-1 py-2.5 rounded-xl cursor-pointer border-none outline-none font-bold text-xs"
                      style={{ background: "var(--brand-purple)", color: "#fff" }}
                    >
                      {t("btnSaveToChat")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
