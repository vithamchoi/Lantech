import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { Lock, CheckCircle, Play, ChevronRight, Zap, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { learningService, LessonDto } from "../services/learningService";
import { gamificationService } from "../services/gamificationService";
import { toast } from "sonner";
import { useTranslation } from "../hooks/useTranslation";
import { motion, AnimatePresence } from "motion/react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, darkMode } = useAppStore();
  const { t } = useTranslation();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shakingNodeId, setShakingNodeId] = useState<string | null>(null);
  const [weeklyXp, setWeeklyXp] = useState<number>(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [recommendedLessons, xpTransactions] = await Promise.all([
          learningService.getRecommendedLessons(),
          gamificationService.getMyXpTransactions()
        ]);
        setLessons(recommendedLessons);

        // Sum XP earned in the last 7 days (today and past 6 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const weeklySum = xpTransactions
          .filter(tx => new Date(tx.createdAt) >= sevenDaysAgo)
          .reduce((sum, tx) => sum + tx.amount, 0);

        setWeeklyXp(weeklySum);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        toast.error(t("noPathFound"));
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user) return null;

  const completedCount = lessons.filter(l => l.progressStatus === 'Completed').length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  
  // Logic tìm bài học active: bài học đầu tiên chưa hoàn thành
  const activeLesson = lessons.find(l => l.progressStatus !== 'Completed');

  const handleNodeAction = (nodeId: string, isLocked: boolean) => {
    if (isLocked) {
      setShakingNodeId(nodeId);
      setTimeout(() => setShakingNodeId(null), 400);
      toast.warning(t("completePreviousLesson") || "Hãy hoàn thành bài học trước để mở khóa!");
      return;
    }
    navigate(`/lesson/${nodeId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <div className="flex h-full min-h-screen relative w-full" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center absolute inset-0 z-50 bg-background h-full w-full"
          >
            <Loader2 className="animate-spin" size={48} color="var(--brand)" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col min-w-0"
          >
            {/* Main trail area */}
            <div className="flex-1 overflow-y-auto px-8 py-7">
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.05 }}
            className="rounded-2xl p-5 transition-colors duration-300"
            style={{ background: "var(--card)", border: "2px solid var(--border)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "var(--brand-light)" }}
              >
                <TrendingUp size={16} style={{ color: "var(--brand)" }} />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted-foreground)" }}>{t("trailProgress")}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "var(--foreground)" }}>{progressPercent}%</div>
            <div
              className="mt-2 rounded-full overflow-hidden"
              style={{ height: 6, background: "var(--muted)" }}
            >
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ background: "var(--brand)" }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
            className="rounded-2xl p-5"
            style={{
              background: darkMode ? "rgba(253,230,138,0.15)" : "#fff8cc",
              border: `2px solid ${darkMode ? "#f59e0b" : "#fde68a"}`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div style={{ fontSize: 22 }}>⚡</div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: darkMode ? "#fdba74" : "#b45309" }}>{t("weeklyXp")}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: darkMode ? "#f59e0b" : "#92400e" }}>{weeklyXp.toLocaleString()} XP</div>
            <div style={{ fontSize: 12, color: darkMode ? "#fdba74" : "#b45309", fontWeight: 600, marginTop: 6 }}>{t("keepItUp")}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.15 }}
            className="rounded-2xl p-5 transition-colors duration-300"
            style={{
              background: darkMode ? "rgba(28,176,246,0.15)" : "var(--brand-sky-light)",
              border: "2px solid var(--brand-sky)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: darkMode ? "rgba(28,176,246,0.2)" : "var(--brand-sky-light)", opacity: 0.8 }}
              >
                <Zap size={16} style={{ color: "var(--brand-sky)" }} />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--brand-sky)" }}>{t("nextLesson")}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--brand-sky)" }}>{activeLesson?.title || t("allDone")}</div>
            {activeLesson && (
              <button
                onClick={() => handleNodeAction(activeLesson.id, false)}
                className="mt-2 flex items-center gap-1 cursor-pointer border-none outline-none bg-transparent"
                style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-sky)", padding: 0 }}
              >
                {t("continue")} <ChevronRight size={13} />
              </button>
            )}
          </motion.div>
        </div>

        {/* Trail heading */}
        <div className="text-left">
          <h2 style={{ fontSize: 19, fontWeight: 900, color: "var(--foreground)", marginBottom: 6 }}>
            {t("yourLearningTrail")}
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", marginBottom: 28 }}>
            {t("learningTrailSubtitle")}
          </p>
        </div>

        {/* Trail nodes */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-0 w-full"
        >
          {lessons.length === 0 && (
            <div className="p-10 text-center text-slate-500">
              {t("noLessonsAvailable")}
            </div>
          )}
          {lessons.map((node, index) => {
            const isLeft = index % 2 === 0;
            const isHovered = hoveredNode === node.id;
            
            // Một node là active nếu nó là node chưa xong đầu tiên
            const isNodeActive = activeLesson?.id === node.id;
            const isNodeLocked = !isNodeActive && node.progressStatus !== 'Completed' && index > lessons.findIndex(l => l.id === activeLesson?.id);

            return (
              <motion.div
                key={node.id}
                variants={itemVariants}
                className="w-full flex flex-col items-center"
              >
                {/* Connector line */}
                {index > 0 && (
                  <div
                    className="w-1 rounded-full"
                    style={{
                      height: 32,
                      background: lessons[index - 1].progressStatus === "Completed"
                        ? "var(--brand)"
                        : "#e5e7eb",
                    }}
                  />
                )}

                {/* Node row */}
                <div
                  className={`flex items-center w-full max-w-xl ${isLeft ? "justify-start" : "justify-end"}`}
                  style={{ paddingLeft: isLeft ? 32 : 0, paddingRight: isLeft ? 0 : 32 }}
                >
                  <div className="relative">
                    {/* Node button */}
                    <motion.button
                      onClick={() => handleNodeAction(node.id, isNodeLocked)}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      whileHover={!isNodeLocked ? { scale: 1.08 } : {}}
                      whileTap={!isNodeLocked ? { scale: 0.95 } : {}}
                      className={`relative flex flex-col items-center transition-all border-none outline-none bg-transparent ${
                        shakingNodeId === node.id ? "animate-wiggle" : ""
                      }`}
                      style={{ cursor: isNodeLocked ? "not-allowed" : "pointer" }}
                    >
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all relative"
                        style={{
                          background:
                            node.progressStatus === "Completed"
                              ? "linear-gradient(135deg, var(--brand) 0%, #34d399 100%)"
                              : isNodeActive
                              ? "linear-gradient(135deg, #1CB0F6 0%, #60a5fa 100%)"
                              : "#e5e7eb",
                          boxShadow:
                            isNodeActive
                              ? "0 0 0 6px rgba(28,176,246,0.2), 0 6px 20px rgba(28,176,246,0.3)"
                              : node.progressStatus === "Completed"
                              ? "0 6px 0 var(--brand-dark)"
                              : "0 4px 0 #d1d5db",
                        }}
                      >
                        {isNodeActive && (
                          <div className="absolute inset-0 rounded-full bg-brand-sky opacity-40 animate-ping pointer-events-none" />
                        )}
                        {node.progressStatus === "Completed" ? (
                          <CheckCircle size={30} color="#fff" />
                        ) : isNodeActive ? (
                          <span style={{ fontSize: 32 }}>{node.skill === 'Listening' ? '🎧' : node.skill === 'Speaking' ? '🗣️' : node.skill === 'Reading' ? '📖' : '✍️'}</span>
                        ) : (
                          <Lock size={22} color="#aaa" />
                        )}
                      </div>

                      {/* Node Tooltip/Label */}
                      <motion.div
                        initial={false}
                        animate={{
                          y: isHovered ? -4 : 0,
                          opacity: isHovered ? 1 : 0.8,
                          scale: isHovered ? 1.02 : 1
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg shadow-sm border transition-all z-20"
                        style={{
                          background: "var(--card)",
                          borderColor: isNodeActive ? "var(--brand)" : "var(--border)",
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--foreground)" }}>
                          {node.title}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)" }}>
                          {node.topic || (
                            node.skill === 'Listening' ? t('listeningSection') :
                            node.skill === 'Speaking' ? t('speakingSection') :
                            node.skill === 'Reading' ? t('readingSection') :
                            node.skill === 'Writing' ? t('writingSection') :
                            node.skill
                          )} • {node.xpReward} XP
                        </div>
                      </motion.div>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

