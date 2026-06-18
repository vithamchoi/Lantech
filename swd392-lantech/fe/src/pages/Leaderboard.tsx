import React, { useState, useEffect } from "react";
import { useAppStore } from "../store/appStore";
import { gamificationService, LeaderboardEntryDto } from "../services/gamificationService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Period = "weekly" | "monthly" | "all-time";

const PODIUM_COLORS = ["#FFCD00", "#C0C0C0", "#CD7F32"];
const PODIUM_EMOJIS = ["🥇", "🥈", "🥉"];
const PODIUM_HEIGHTS = [120, 90, 70];

export default function Leaderboard() {
  const { user } = useAppStore();
  const [period, setPeriod] = useState<Period>("weekly");
  const [entries, setEntries] = useState<LeaderboardEntryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await gamificationService.getLeaderboard(period);
        setEntries(data.entries);
      } catch (error) {
        toast.error("Failed to load leaderboard");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  if (!user) return null;

  // Podium logic: top 3
  const podiumEntries = [entries[1], entries[0], entries[2]].filter(e => !!e);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" size={48} color="var(--brand)" />
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full px-8 py-7 text-left" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#3c3c3c", marginBottom: 4 }}>🏆 Leaderboard</h1>
          <p style={{ fontSize: 14, color: "#888" }}>See how you stack up against other learners worldwide</p>
        </div>

        {/* Period tabs */}
        <div
          className="flex rounded-2xl p-1 mb-8"
          style={{ background: "#f3f4f6" }}
        >
          {([["weekly", "Weekly"], ["monthly", "Monthly"], ["all-time", "All Time"]] as [Period, string][]).map(([p, label]) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              type="button"
              className="flex-1 py-2 rounded-xl cursor-pointer transition-all border-none outline-none"
              style={{
                background: period === p ? "#fff" : "transparent",
                color: period === p ? "#3c3c3c" : "#888",
                fontWeight: 700,
                fontSize: 13.5,
                boxShadow: period === p ? "0 1px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {label}
            </button>
          ))}
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
                        color: podiumIndex === 0 ? "#fff" : "#3c3c3c",
                      }}
                    >
                      {player.avatarUrl ? <img src={player.avatarUrl} alt="" className="w-full h-full rounded-full" /> : (player.fullName || "Un").substring(0, 2).toUpperCase()}
                    </div>
                    <div
                      className="absolute -top-2 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ fontSize: 12, background: "#fff", border: "1.5px solid #e5e7eb" }}
                    >
                      {PODIUM_EMOJIS[podiumIndex]}
                    </div>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: 13, color: "#3c3c3c", marginBottom: 4, textAlign: "center" }}>
                    {player.fullName?.split(" ")[0] || "Unknown"}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 6 }}>
                    {(player.totalXp || 0).toLocaleString()} XP
                  </div>

                  {/* Podium block */}
                  <div
                    className="w-24 rounded-t-2xl flex items-center justify-center"
                    style={{
                      height: PODIUM_HEIGHTS[podiumIndex],
                      background: `linear-gradient(180deg, ${PODIUM_COLORS[podiumIndex]}44 0%, ${PODIUM_COLORS[podiumIndex]}22 100%)`,
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
          <div className="text-center p-10 text-slate-400 font-bold">Not enough entries for podium yet.</div>
        )}

        {/* Detailed ranking table */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ border: "2px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
        >
          {/* Table header */}
          <div
            className="grid px-5 py-3"
            style={{
              background: "#f7f7f7",
              gridTemplateColumns: "40px 1fr 100px",
              fontSize: 11.5,
              fontWeight: 700,
              color: "#aaa",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            <div>Rank</div>
            <div>Player</div>
            <div className="text-right">XP Points</div>
          </div>

          {/* Rows */}
          {entries.map((player, i) => (
            <div
              key={player.userId}
              className="grid items-center px-5 py-3.5 border-t transition-all"
              style={{
                gridTemplateColumns: "40px 1fr 100px",
                background: player.isCurrentUser ? "linear-gradient(90deg, var(--brand-light), #f0fdf4)" : i % 2 === 0 ? "#fff" : "#fafafa",
                borderColor: "rgba(0,0,0,0.06)",
                borderLeft: player.isCurrentUser ? "4px solid var(--brand)" : "4px solid transparent",
              }}
            >
              {/* Rank */}
              <div>
                {player.rank <= 3 ? (
                  <span style={{ fontSize: 18 }}>{PODIUM_EMOJIS[player.rank - 1]}</span>
                ) : (
                  <span style={{ fontWeight: 800, fontSize: 14, color: "#aaa" }}>#{player.rank}</span>
                )}
              </div>

              {/* Player */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: player.isCurrentUser ? "var(--brand)" : "#e5e7eb",
                    fontWeight: 800,
                    fontSize: 12,
                    color: player.isCurrentUser ? "#fff" : "#888",
                  }}
                >
                  {player.avatarUrl ? <img src={player.avatarUrl} alt="" className="w-full h-full rounded-full" /> : (player.fullName || "Un").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#3c3c3c" }}>{player.fullName || "Unknown"}</span>
                    {player.isCurrentUser && (
                      <span
                        className="px-2 py-0.5 rounded-full"
                        style={{ background: "var(--brand)", color: "#fff", fontSize: 10, fontWeight: 700 }}
                      >
                        You
                      </span>
                    )}
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{ background: "#e0f2fe", color: "#0369a1", fontSize: 10.5, fontWeight: 700 }}
                  >
                    {player.level || "Beginner"}
                  </span>
                </div>
              </div>

              {/* XP */}
              <div className="text-right">
                <span style={{ fontWeight: 800, fontSize: 14, color: player.isCurrentUser ? "var(--brand-dark)" : "#3c3c3c" }}>
                  {(player.totalXp || 0).toLocaleString()}
                </span>
                <span style={{ fontSize: 11.5, color: "#aaa", marginLeft: 2 }}>XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
