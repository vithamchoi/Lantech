import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { Lock, CheckCircle, Play, ChevronRight, Zap, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { learningService, LessonDto } from "../services/learningService";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, darkMode } = useAppStore();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const recommendedLessons = await learningService.getRecommendedLessons();
        setLessons(recommendedLessons);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        toast.error("Could not load your learning trail");
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

  const handleNodeAction = (nodeId: string) => {
    navigate(`/lesson/${nodeId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" size={48} color="var(--brand)" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
      {/* Main trail area */}
      <div className="flex-1 overflow-y-auto px-8 py-7">
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div
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
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted-foreground)" }}>Trail Progress</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "var(--foreground)" }}>{progressPercent}%</div>
            <div
              className="mt-2 rounded-full overflow-hidden"
              style={{ height: 6, background: "var(--muted)" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${progressPercent}%`, background: "var(--brand)", transition: "width 0.8s ease" }}
              />
            </div>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{
              background: darkMode ? "rgba(253,230,138,0.15)" : "#fff8cc",
              border: `2px solid ${darkMode ? "#f59e0b" : "#fde68a"}`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div style={{ fontSize: 22 }}>⚡</div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: darkMode ? "#fdba74" : "#b45309" }}>Weekly XP</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: darkMode ? "#f59e0b" : "#92400e" }}>{user.xp} XP</div>
            <div style={{ fontSize: 12, color: darkMode ? "#fdba74" : "#b45309", fontWeight: 600, marginTop: 6 }}>Keep it up!</div>
          </div>

          <div
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
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--brand-sky)" }}>Next Lesson</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--brand-sky)" }}>{activeLesson?.title || "All done!"}</div>
            {activeLesson && (
              <button
                onClick={() => handleNodeAction(activeLesson.id)}
                className="mt-2 flex items-center gap-1 cursor-pointer border-none outline-none bg-transparent"
                style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-sky)", padding: 0 }}
              >
                Continue <ChevronRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Trail heading */}
        <div className="text-left">
          <h2 style={{ fontSize: 19, fontWeight: 900, color: "var(--foreground)", marginBottom: 6 }}>
            Your Learning Trail
          </h2>
          <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", marginBottom: 28 }}>
            Complete each quest node to unlock the next adventure!
          </p>
        </div>

        {/* Trail nodes */}
        <div className="flex flex-col items-center gap-0">
          {lessons.length === 0 && (
            <div className="p-10 text-center text-slate-500">
              No lessons available. Complete an assessment first!
            </div>
          )}
          {lessons.map((node, index) => {
            const isLeft = index % 2 === 0;
            const isHovered = hoveredNode === node.id;
            
            // Một node là active nếu nó là node chưa xong đầu tiên
            const isNodeActive = activeLesson?.id === node.id;
            const isNodeLocked = !isNodeActive && node.progressStatus !== 'Completed' && index > lessons.findIndex(l => l.id === activeLesson?.id);

            return (
              <div key={node.id} className="w-full flex flex-col items-center">
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
                    <button
                      onClick={() => !isNodeLocked && handleNodeAction(node.id)}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="relative flex flex-col items-center transition-all border-none outline-none bg-transparent"
                      style={{ cursor: isNodeLocked ? "not-allowed" : "pointer" }}
                    >
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all"
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
                          transform: isHovered && !isNodeLocked ? "scale(1.08)" : "scale(1)",
                        }}
                      >
                        {node.progressStatus === "Completed" ? (
                          <CheckCircle size={30} color="#fff" />
                        ) : isNodeActive ? (
                          <span style={{ fontSize: 32 }}>{node.skill === 'Listening' ? '🎧' : node.skill === 'Speaking' ? '🗣️' : node.skill === 'Reading' ? '📖' : '✍️'}</span>
                        ) : (
                          <Lock size={22} color="#aaa" />
                        )}
                      </div>

                      {/* Node Tooltip/Label */}
                      <div
                        className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg shadow-sm border transition-all"
                        style={{
                          background: "var(--card)",
                          borderColor: isNodeActive ? "var(--brand)" : "var(--border)",
                          opacity: isHovered ? 1 : 0.8,
                          transform: isHovered ? "translate(-50%, -4px)" : "translate(-50%, 0)",
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--foreground)" }}>
                          {node.title}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)" }}>
                          {node.topic || node.skill} • {node.xpReward} XP
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
