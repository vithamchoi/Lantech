import React, { useState, useEffect } from "react";
import { useAppStore } from "../store/appStore";
import { gamificationService, LeaderboardEntryDto } from "../services/gamificationService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "../hooks/useTranslation";
import { motion, AnimatePresence } from "motion/react";

type Period = "weekly" | "monthly" | "all-time";

const PODIUM_COLORS = ["#FFCD00", "#C0C0C0", "#CD7F32"];
const PODIUM_EMOJIS = ["🥇", "🥈", "🥉"];
const PODIUM_HEIGHTS = [120, 90, 70];

export default function Leaderboard() {
  const { user, darkMode } = useAppStore();
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>("weekly");
  const [entries, setEntries] = useState<LeaderboardEntryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await gamificationService.getLeaderboard(period);
        const mappedEntries = (data.entries || []).map((entry: any) => ({
          ...entry,
          totalXp: entry.xp ?? entry.totalXp ?? 0,
          isCurrentUser: user ? entry.userId === user.id : false
        }));
        setEntries(mappedEntries);
      } catch (error) {
        toast.error(t("failedToLoadLeaderboard"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period, user?.id]);

  if (!user) return null;

  // Podium logic: top 3
  const podiumEntries = [entries[1], entries[0], entries[2]].filter(e => !!e);

  return (
    <div className="overflow-y-auto h-full px-8 py-7 text-left bg-background text-foreground relative w-full" style={{ fontFamily: "var(--font-family)" }}>
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
            className="max-w-2xl mx-auto w-full"
          >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[26px] font-black text-foreground mb-1">🏆 {t("leaderboardTitle")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("leaderboardSubtitle")}</p>
        </div>

        {/* Period tabs */}
        <div
          className="flex rounded-2xl p-1 mb-8 bg-cream-200 dark:bg-slate-900/50 border border-sage/50 dark:border-[#2C3531]/50 relative"
        >
          {([["weekly", t("periodWeekly")], ["monthly", t("periodMonthly")], ["all-time", t("periodAllTime")]] as [Period, string][]).map(([p, label]) => {
            const isSelected = period === p;
            return (
              <motion.button
                key={p}
                onClick={() => setPeriod(p)}
                type="button"
                whileHover={{ 
                  scale: isSelected ? 1 : 1.02,
                  backgroundColor: isSelected 
                    ? "var(--brand)" 
                    : (darkMode ? "rgba(88, 204, 2, 0.25)" : "rgba(88, 204, 2, 0.15)"),
                  color: isSelected 
                    ? "#fff" 
                    : (darkMode ? "var(--brand)" : "var(--brand-dark)") 
                }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2 rounded-xl cursor-pointer border-none outline-none font-bold text-[13.5px] relative z-0"
                style={{
                  background: isSelected ? "var(--brand)" : "transparent",
                  color: isSelected ? "#fff" : "var(--muted-foreground)",
                  boxShadow: isSelected ? "0 4px 12px rgba(88, 204, 2, 0.25)" : "none",
                }}
              >
                <span className="relative z-10">{label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Top 3 podium */}
        {entries.length >= 3 ? (
          <div className="flex items-end justify-center gap-3 mb-10">
            {podiumEntries.map((player, i) => {
              // podiumIndex: 1 (left), 0 (center), 2 (right)
              const podiumIndex = entries.indexOf(player);
              return (
                <div key={player.userId} className="flex flex-col items-center">
                  {/* Avatar */}
                  <div style={{ position: "relative", marginBottom: 8 }}>
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center border-none"
                      style={{
                        background: player.isCurrentUser
                          ? "linear-gradient(135deg, var(--brand) 0%, #34d399 100%)"
                          : `linear-gradient(135deg, ${PODIUM_COLORS[podiumIndex]}88 0%, ${PODIUM_COLORS[podiumIndex]} 100%)`,
                        border: `3px solid ${PODIUM_COLORS[podiumIndex]}`,
                        fontWeight: 800,
                        fontSize: 16,
                        color: podiumIndex === 0 ? "#fff" : "var(--foreground)",
                      }}
                    >
                      {player.avatarUrl ? <img src={player.avatarUrl} alt="" className="w-full h-full rounded-full" /> : (player.fullName || "Un").substring(0, 2).toUpperCase()}
                    </div>
                    <div
                      className="absolute -top-2 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-white dark:bg-[#1E2522] border border-sage dark:border-[#2C3531]"
                      style={{ fontSize: 12 }}
                    >
                      {PODIUM_EMOJIS[podiumIndex]}
                    </div>
                  </div>

                  <div className="font-extrabold text-[13px] text-foreground mb-1 text-center">
                    {player.fullName?.split(" ")[0] || "Unknown"}
                  </div>
                  <div className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold mb-1.5">
                    {(player.totalXp || 0).toLocaleString()} XP
                  </div>

                  {/* Podium block */}
                  <div
                    className="w-24 rounded-t-2xl flex items-center justify-center"
                    style={{
                      height: PODIUM_HEIGHTS[podiumIndex],
                      background: `linear-gradient(180deg, ${PODIUM_COLORS[podiumIndex]}44 0%, ${PODIUM_COLORS[podiumIndex]}11 100%)`,
                      border: `2px solid ${PODIUM_COLORS[podiumIndex]}66`,
                      fontWeight: 900,
                      fontSize: 24,
                      color: PODIUM_COLORS[podiumIndex],
                    }}
                  >
                    #{player.rank}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-10 text-slate-400 font-bold">{t("notEnoughEntries")}</div>
        )}

        {/* Detailed ranking table */}
        <div
          className="rounded-3xl overflow-hidden border border-sage dark:border-[#2C3531] shadow-diffuse"
        >
          {/* Table header */}
          <div
            className="grid px-5 py-3 bg-cream-200 dark:bg-slate-900/80 border-b border-sage dark:border-[#2C3531]"
            style={{
              gridTemplateColumns: "40px 1fr 100px",
              fontSize: 11.5,
              fontWeight: 700,
              color: "var(--muted-foreground)",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            <div>{t("rankLabel")}</div>
            <div>{t("userLabel")}</div>
            <div className="text-right">{t("xpLabel")}</div>
          </div>

          {/* Rows */}
          {entries.map((player, i) => {
            const isDarkMode = document.documentElement.classList.contains("dark");
            const rowBg = player.isCurrentUser 
              ? "var(--accent)" 
              : i % 2 === 0 ? "var(--card)" : "var(--background)";
            const hoverBg = player.isCurrentUser 
              ? "var(--accent)" 
              : (isDarkMode ? "rgba(88, 204, 2, 0.12)" : "rgba(88, 204, 2, 0.06)");

            return (
              <motion.div
                layout
                key={player.userId}
                className="grid items-center px-5 py-3.5 border-t border-sage dark:border-[#2C3531] cursor-pointer"
                whileHover={{ 
                  scale: 1.005,
                  backgroundColor: hoverBg 
                }}
                style={{
                  gridTemplateColumns: "40px 1fr 100px",
                  backgroundColor: rowBg,
                  borderLeft: player.isCurrentUser ? "4px solid var(--brand)" : "4px solid transparent",
                }}
              >
              {/* Rank */}
              <div>
                {player.rank <= 3 ? (
                  <span style={{ fontSize: 18 }}>{PODIUM_EMOJIS[player.rank - 1]}</span>
                ) : (
                  <span className="font-extrabold text-[14px] text-slate-400 dark:text-slate-500">#{player.rank}</span>
                )}
              </div>

              {/* Player */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: player.isCurrentUser ? "var(--brand)" : "var(--input-background)",
                    fontWeight: 800,
                    fontSize: 12,
                    color: player.isCurrentUser ? "#fff" : "var(--foreground)",
                  }}
                >
                  {player.avatarUrl ? <img src={player.avatarUrl} alt="" className="w-full h-full rounded-full" /> : (player.fullName || "Un").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[14px] text-foreground">{player.fullName || "Unknown"}</span>
                    {player.isCurrentUser && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-brand"
                      >
                        {t("youLabel")}
                      </span>
                    )}
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10.5px] font-bold"
                    style={{ background: "var(--input-background)", color: "var(--muted-foreground)" }}
                  >
                    {player.level || t("levelBeginner")}
                  </span>
                </div>
              </div>

              {/* XP */}
              <div className="text-right">
                <span className="font-extrabold text-[14px] text-foreground">
                  {(player.totalXp || 0).toLocaleString()}
                </span>
                <span className="text-[11.5px] text-slate-400 dark:text-slate-500 ml-1">XP</span>
              </div>
            </motion.div>
            );
          })}
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
