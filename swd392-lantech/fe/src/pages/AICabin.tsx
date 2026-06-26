import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, RotateCcw, Loader2, Plus, Trash2, MessageSquare, PanelLeftClose, PanelLeftOpen, Check, X } from "lucide-react";
import { aiService } from "../services/aiService";
import { useAppStore } from "../store/appStore";
import { toast } from "sonner";
import { parseMarkdownToHtml } from "../utils/markdown";
import { useTranslation } from "../hooks/useTranslation";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "tutor";
  text: string;
  time: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

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
  const { user, darkMode } = useAppStore();
  const { t, language } = useTranslation();
  
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const currentUser = useAppStore.getState().user;
    const key = `lantech_chat_sessions_${currentUser?.id || "guest"}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved chat sessions", e);
      }
    }
    
    // Migrate old single-chat messages if present
    const oldKey = `lantech_chat_messages_${currentUser?.id || "guest"}`;
    const oldSaved = localStorage.getItem(oldKey);
    if (oldSaved) {
      try {
        const oldMsgs = JSON.parse(oldSaved);
        if (Array.isArray(oldMsgs) && oldMsgs.length > 0) {
          return [
            {
              id: "default",
              title: t("newChatTitle"),
              messages: oldMsgs,
              createdAt: new Date().toISOString()
            }
          ];
        }
      } catch (e) {
        // ignore
      }
    }
    
    // Default initial session
    return [
      {
        id: "default",
        title: t("newChatTitle"),
        messages: [
          {
            id: "0",
            role: "tutor",
            text: "Hello! 👋 I'm your English AI Tutor. I can help you with grammar questions, sentence analysis, vocabulary examples, and much more! What would you like to work on today?",
            time: "now"
          }
        ],
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const currentUser = useAppStore.getState().user;
    const key = `lantech_active_session_id_${currentUser?.id || "guest"}`;
    const saved = localStorage.getItem(key);
    return saved || "default";
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [analyzerSentence, setAnalyzerSentence] = useState("");
  const [analyzerLang, setAnalyzerLang] = useState(user?.nativeLang || "vi");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "analyzer">("chat");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });
  const endRef = useRef<HTMLDivElement>(null);

  // Validate activeSessionId exists in sessions
  useEffect(() => {
    const exists = sessions.some(s => s.id === activeSessionId);
    if (!exists && sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  // Current session derivation
  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Save sessions to localStorage
  useEffect(() => {
    const key = `lantech_chat_sessions_${user?.id || "guest"}`;
    localStorage.setItem(key, JSON.stringify(sessions));
  }, [sessions, user?.id]);

  // Save activeSessionId to localStorage
  useEffect(() => {
    const key = `lantech_active_session_id_${user?.id || "guest"}`;
    localStorage.setItem(key, activeSessionId);
  }, [activeSessionId, user?.id]);

  // Handle translation update
  useEffect(() => {
    setSessions(prevSessions => {
      return prevSessions.map(s => {
        return {
          ...s,
          messages: s.messages.map(m => m.id === "0" ? { ...m, text: t("aiCabinWelcome") } : m)
        };
      });
    });
  }, [language]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const updateActiveSessionMessages = (updater: Message[] | ((prev: Message[]) => Message[])) => {
    setSessions(prevSessions => {
      return prevSessions.map(s => {
        if (s.id === activeSessionId) {
          const newMsgs = typeof updater === "function" ? updater(s.messages) : updater;
          
          // Auto-generate title if this is a default title
          let newTitle = s.title;
          const firstUserMsg = newMsgs.find(m => m.role === "user");
          if (firstUserMsg) {
            const isDefault = !s.title || 
              s.title === "default" ||
              s.title === "Cuộc trò chuyện mới" ||
              s.title === "New Chat" ||
              s.title === "新しいチャット" ||
              s.title === "새로운 채팅" ||
              s.title === t("newChatTitle") ||
              s.title.startsWith("Cuộc trò chuyện mới") ||
              s.title.startsWith("New Chat") ||
              s.title.startsWith("新しいチャット") ||
              s.title.startsWith("새로운 채팅");

            if (isDefault) {
              newTitle = firstUserMsg.text.length > 25 
                ? firstUserMsg.text.slice(0, 22) + "..." 
                : firstUserMsg.text;
            }
          }
          
          return {
            ...s,
            title: newTitle,
            messages: newMsgs
          };
        }
        return s;
      });
    });
  };

  const handleCreateNewSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: t("newChatTitle"),
      messages: [
        {
          id: "0",
          role: "tutor",
          text: t("aiCabinWelcome"),
          time: "now"
        }
      ],
      createdAt: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      toast.error(t("cannotDeleteLastChat"));
      return;
    }
    
    setDeleteConfirm({
      isOpen: true,
      title: t("deleteChatConfirmTitle"),
      message: t("deleteChatConfirm"),
      onConfirm: () => {
        const remaining = sessions.filter(s => s.id !== id);
        setSessions(remaining);
        if (activeSessionId === id) {
          setActiveSessionId(remaining[0].id);
        }
        toast.success(t("chatDeleted"));
      }
    });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", text, time: "now" };
    updateActiveSessionMessages(prev => [...prev, userMsg]);
    setInput("");

    const tutorMsgId = Date.now().toString() + "r";
    setIsTyping(true);

    let accumulatedText = "";
    let addedPlaceholder = false;

    try {
      const history = messages
        .filter(m => m.id !== "0")
        .map(m => ({
          role: (m.role === "tutor" ? "assistant" : "user") as "assistant" | "user",
          content: m.text
        }));

      await aiService.chatTutorStream(
        text,
        analyzerLang,
        history,
        (chunk) => {
          setIsTyping(false);
          accumulatedText += chunk;
          if (!addedPlaceholder) {
            addedPlaceholder = true;
            const newTutorMsg: Message = { id: tutorMsgId, role: "tutor", text: accumulatedText, time: "now" };
            updateActiveSessionMessages(prev => [...prev, newTutorMsg]);
          } else {
            updateActiveSessionMessages(prev =>
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
            updateActiveSessionMessages(prev => [...prev, errorMsg]);
          } else {
            updateActiveSessionMessages(prev =>
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
        updateActiveSessionMessages(prev => [...prev, errorMsg]);
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
      {/* Sidebar for chat history */}
      {activeTab === "chat" && isHistoryOpen && (
        <div 
          className="hidden md:flex flex-col shrink-0 border-r"
          style={{ 
            width: 260, 
            background: "var(--card)", 
            borderColor: "var(--border)",
            height: "100%"
          }}
        >
          {/* New Chat button */}
          <div className="p-4 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
            <motion.button
              onClick={handleCreateNewSession}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl cursor-pointer border font-bold text-sm transition-all duration-200"
              style={{
                background: "var(--brand-purple)",
                borderColor: "var(--brand-purple)",
                color: "#fff"
              }}
            >
              <Plus size={16} />
              {t("newChatBtn")}
            </motion.button>
          </div>

          {/* Session history list */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 scrollbar-thin">
            {sessions.map(s => {
              const isActive = s.id === activeSessionId;
              const firstUserMsg = s.messages.find(m => m.role === "user");
              const isDefaultTitle = !s.title || 
                s.title === "default" ||
                s.title === "Cuộc trò chuyện mới" ||
                s.title === "New Chat" ||
                s.title === "新しいチャット" ||
                s.title === "새로운 채팅" ||
                s.title === "New Chat Session";

              const displayTitle = firstUserMsg 
                ? (firstUserMsg.text.length > 25 
                    ? firstUserMsg.text.slice(0, 22) + "..." 
                    : firstUserMsg.text)
                : (isDefaultTitle ? t("newChatTitle") : s.title);

              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={`group relative flex items-center gap-2.5 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? "bg-gray-100 dark:bg-gray-800 font-bold" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/40 text-muted-foreground hover:text-foreground"
                  }`}
                  style={{
                    border: isActive 
                      ? "1.5px solid var(--border)" 
                      : "1.5px solid transparent"
                  }}
                >
                  <MessageSquare size={15} style={{ color: isActive ? "var(--brand-purple)" : "inherit" }} className="shrink-0" />
                  
                  <span 
                    className="truncate text-xs select-none"
                    style={{ 
                      color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                      paddingRight: "28px",
                      flex: 1
                    }}
                  >
                    {displayTitle}
                  </span>
                  
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      type="button"
                      className="absolute right-2 p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-955/30 transition-all border-none bg-transparent cursor-pointer opacity-50 group-hover:opacity-100"
                      style={{
                        zIndex: 10
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main panel */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Chat header */}
        <div
          className="px-6 border-b flex items-center justify-between shrink-0"
          style={{ background: "var(--card)", borderColor: "var(--border)", height: 70, boxSizing: "border-box" }}
        >
          <div className="flex items-center gap-3 text-left">
            {activeTab === "chat" && (
              <motion.button
                onClick={() => setIsHistoryOpen(prev => !prev)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="cursor-pointer border-none outline-none bg-transparent p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title={isHistoryOpen ? t("hideHistory") : t("showHistory")}
              >
                {isHistoryOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
              </motion.button>
            )}
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
          <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl relative" style={{ border: "1.5px solid var(--border)" }}>
            <motion.button
              onClick={() => setActiveTab("chat")}
              whileHover={{ 
                scale: activeTab === "chat" ? 1 : 1.02,
                backgroundColor: activeTab === "chat" 
                  ? (darkMode ? "rgba(139, 92, 246, 0.25)" : "rgba(139, 92, 246, 0.15)")
                  : (darkMode ? "rgba(139, 92, 246, 0.12)" : "rgba(139, 92, 246, 0.06)"),
                color: darkMode ? "#c084fc" : "#7c3aed"
              }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border-none outline-none cursor-pointer relative z-0"
              style={{
                background: activeTab === "chat" 
                  ? (darkMode ? "#2e1065" : "#ffffff") 
                  : "transparent",
                color: activeTab === "chat" 
                  ? (darkMode ? "#c084fc" : "#6d28d9") 
                  : "var(--muted-foreground)",
                fontWeight: 800,
                fontSize: 13,
                boxShadow: activeTab === "chat" 
                  ? "0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(139, 92, 246, 0.1)" 
                  : "none",
                border: activeTab === "chat" 
                  ? `1.5px solid ${darkMode ? "#8b5cf6" : "#c084fc"}` 
                  : "1.5px solid transparent",
              }}
              title={t("chatTabTitle")}
            >
              <span className="relative z-10">{t("chatTabLabel")}</span>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab("analyzer")}
              whileHover={{ 
                scale: activeTab === "analyzer" ? 1 : 1.02,
                backgroundColor: activeTab === "analyzer" 
                  ? (darkMode ? "rgba(249, 115, 22, 0.25)" : "rgba(249, 115, 22, 0.15)")
                  : (darkMode ? "rgba(249, 115, 22, 0.12)" : "rgba(249, 115, 22, 0.06)"),
                color: darkMode ? "#fdba74" : "#ea580c"
              }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border-none outline-none cursor-pointer relative z-0"
              style={{
                background: activeTab === "analyzer" 
                  ? (darkMode ? "#431407" : "#ffffff") 
                  : "transparent",
                color: activeTab === "analyzer" 
                  ? (darkMode ? "#fdba74" : "#ea580c") 
                  : "var(--muted-foreground)",
                fontWeight: 800,
                fontSize: 13,
                boxShadow: activeTab === "analyzer" 
                  ? "0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(249, 115, 22, 0.1)" 
                  : "none",
                border: activeTab === "analyzer" 
                  ? `1.5px solid ${darkMode ? "#f97316" : "#ffedd5"}` 
                  : "1.5px solid transparent",
              }}
              title={t("analyzerTabTitle")}
            >
              <span className="relative z-10">{t("analyzerTabLabel")}</span>
            </motion.button>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => {
                setDeleteConfirm({
                  isOpen: true,
                  title: t("clearChatConfirmTitle"),
                  message: t("refreshChatConfirm"),
                  onConfirm: () => {
                    setSessions(prev => prev.map(s => {
                      if (s.id === activeSessionId) {
                        return {
                          ...s,
                          title: t("newChatTitle"),
                          messages: [{ id: "0", role: "tutor", text: t("aiCabinWelcome"), time: "now" }]
                        };
                      }
                      return s;
                    }));
                    toast.success(t("chatCleared"));
                  }
                });
              }}
              whileHover={{ scale: 1.1, rotate: -30 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              className="cursor-pointer border-none outline-none bg-transparent p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: "#aaa" }}
              title={t("refreshChatTitle")}
            >
              <RotateCcw size={15} />
            </motion.button>
          </div>
        </div>
        
        {/* Tab body content */}
        {activeTab === "chat" ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: msg.role === "user" ? 30 : -30, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
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
                      className="px-4 py-3 rounded-2xl max-w-[85%] lg:max-w-[80%] text-left shadow-sm"
                      style={{
                        background: msg.role === "tutor" ? "var(--card)" : "var(--brand)",
                        border: msg.role === "tutor" ? "1.5px solid var(--border)" : "none",
                        color: msg.role === "tutor" ? "var(--foreground)" : (darkMode ? "#041401" : "#062002"),
                        fontWeight: msg.role === "tutor" ? 400 : 500,
                        fontSize: 13.5,
                        lineHeight: 1.7,
                        borderRadius: msg.role === "tutor" ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdownToHtml(msg.text),
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--brand-purple)", fontSize: 16, marginTop: 4 }}
                  >
                    🦉
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
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
                </motion.div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-5 pb-3 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
              {QUICK_PROMPTS_KEYS.map(key => {
                const promptText = t(key);
                return (
                  <motion.button
                    key={key}
                    onClick={() => sendMessage(promptText)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    className="shrink-0 px-4 py-2 rounded-full cursor-pointer border font-bold text-xs shadow-sm transition-all duration-200"
                    style={{
                      background: darkMode ? "rgba(124, 58, 237, 0.15)" : "#f5f3ff",
                      borderColor: darkMode ? "rgba(124, 58, 237, 0.3)" : "#ddd6fe",
                      color: darkMode ? "#c084fc" : "#7c3aed",
                      borderStyle: "solid",
                      borderWidth: "1.5px"
                    }}
                  >
                    {promptText}
                  </motion.button>
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
              <motion.button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                whileHover={input.trim() ? { scale: 1.05 } : {}}
                whileTap={input.trim() ? { scale: 0.95 } : {}}
                type="button"
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-none outline-none shrink-0"
                style={{
                  background: input.trim() ? "var(--brand-purple)" : "var(--muted)",
                }}
              >
                <Send size={15} color="#fff" />
              </motion.button>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col lg:flex-row gap-6 text-left" 
            style={{ background: "var(--background)" }}
          >
            {/* Left side: Analyzer Input */}
            <div className="flex-1 flex flex-col gap-5 max-w-xl">
              <div className="p-6 rounded-2xl border shadow-diffuse" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
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
                <motion.button
                  onClick={handleAnalyze}
                  disabled={analyzing || !analyzerSentence.trim()}
                  whileHover={analyzerSentence.trim() ? { scale: 1.01 } : {}}
                  whileTap={analyzerSentence.trim() ? { scale: 0.99 } : {}}
                  className="w-full py-3 mt-4 rounded-xl cursor-pointer border-none outline-none flex items-center justify-center gap-2 text-white font-bold"
                  style={{
                    background: analyzerSentence.trim() ? "var(--brand-orange)" : "var(--muted)",
                    fontSize: 13.5,
                    opacity: analyzing || !analyzerSentence.trim() ? 0.6 : 1,
                  }}
                >
                  <Sparkles size={16} />
                  {analyzing ? t("analyzerBtnAnalyzing") : t("analyzerBtnAnalyze")}
                </motion.button>
              </div>
            </div>

            {/* Right side: Analyzer Results */}
            <div className="flex-1 flex flex-col gap-5">
              <div className="p-6 rounded-2xl border flex-1 flex flex-col justify-between shadow-diffuse" style={{ background: "var(--card)", borderColor: "var(--border)", minHeight: 300 }}>
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

                  <AnimatePresence mode="wait">
                    {analysis && !analyzing && (
                      <motion.div
                        key="analysis-result"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        className="overflow-y-auto pr-2"
                        style={{ fontSize: 13.5, color: "var(--foreground)", lineHeight: 1.8, maxHeight: 400 }}
                        dangerouslySetInnerHTML={{
                          __html: parseMarkdownToHtml(analysis),
                        }}
                      />
                    )}

                    {!analysis && !analyzing && (
                      <motion.div
                        key="no-analysis"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 opacity-60"
                      >
                        <span style={{ fontSize: 40, display: "block", marginBottom: 16 }}>📝</span>
                        <p className="m-0" style={{ fontSize: 13.5, color: "var(--muted-foreground)" }}>
                          {t("analyzerNoData")}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {analysis && !analyzing && (
                  <div className="mt-6 pt-4 border-t flex gap-3" style={{ borderColor: "var(--border)" }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(analysis);
                        toast.success(t("analysisCopied"));
                      }}
                      type="button"
                      className="flex-1 py-2.5 rounded-xl cursor-pointer border outline-none font-bold text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      style={{ background: "transparent", borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      {t("btnCopyResult")}
                    </button>
                    <button
                      onClick={() => {
                        const userMsg: Message = { id: Date.now().toString(), role: "user", text: t("analyzerChatPrefix", { sentence: analyzerSentence }), time: "now" };
                        const tutorMsg: Message = { id: (Date.now() + 1).toString(), role: "tutor", text: analysis, time: "now" };
                        updateActiveSessionMessages(prev => [...prev, userMsg, tutorMsg]);
                        setActiveTab("chat");
                        toast.success(t("analysisSavedToChat"));
                      }}
                      type="button"
                      className="flex-1 py-2.5 rounded-xl cursor-pointer border-none outline-none font-bold text-xs hover:opacity-90 transition-opacity"
                      style={{ background: "var(--brand-purple)", color: "#fff" }}
                    >
                      {t("btnSaveToChat")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border border-border rounded-xl p-6 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-155" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--foreground)" }}>{deleteConfirm.title}</h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>{deleteConfirm.message}</p>
            <div className="flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg cursor-pointer text-sm font-semibold border-none transition-all hover:bg-neutral-200 dark:hover:bg-neutral-800"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                {t("btnCancel")}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  deleteConfirm.onConfirm();
                  setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-2 rounded-lg cursor-pointer text-sm font-semibold border-none text-white transition-all hover:brightness-95"
                style={{ background: "var(--destructive)" }}
              >
                {t("btnDelete")}
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
