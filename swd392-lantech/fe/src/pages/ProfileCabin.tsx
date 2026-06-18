import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { Edit2, LogOut, Calendar, Award, Save, Loader2 } from "lucide-react";
import { profileService } from "../services/profileService";
import { gamificationService, UserBadgeDto, XpTransactionDto } from "../services/gamificationService";
import { toast } from "sonner";

export default function ProfileCabin() {
  const navigate = useNavigate();
  const { user, setUser, logout, role, darkMode } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(user?.name || "");
  const [activeTab, setActiveTab] = useState<"achievements" | "xp-log">("achievements");
  
  const [badges, setBadges] = useState<UserBadgeDto[]>([]);
  const [xpHistory, setXpHistory] = useState<XpTransactionDto[]>([]);
  const [streakCalendar, setStreakCalendar] = useState<{ date: string; studied: boolean }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoadingData(true);
      try {
        const [badgeData, xpData, calendarData] = await Promise.all([
          gamificationService.getMyBadges(),
          gamificationService.getMyXpTransactions(),
          profileService.getStreakCalendar()
        ]);
        setBadges(badgeData);
        setXpHistory(xpData);
        setStreakCalendar(calendarData);
      } catch (error) {
        console.error("Failed to fetch profile data");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await profileService.updateProfile({ fullName: tempName });
      setUser({ ...user, name: tempName });
      setEditing(false);
      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-full min-h-screen text-left flex-col md:flex-row" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
      {/* Left panel */}
      <div
        className="shrink-0 border-r overflow-y-auto px-6 py-7 flex flex-col gap-6"
        style={{ width: 300, background: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Avatar */}
        <div className="flex flex-col items-center text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4 relative"
            style={{ background: "linear-gradient(135deg, var(--brand) 0%, #34d399 100%)", fontSize: 28, fontWeight: 800, color: "#fff" }}
          >
            {user.name.substring(0, 2).toUpperCase()}
            <button
              onClick={() => setEditing(true)}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-none outline-none"
              style={{ background: "var(--card)", border: "2px solid var(--brand)", color: "var(--brand)" }}
            >
              <Edit2 size={11} />
            </button>
          </div>

          {editing ? (
            <div className="w-full flex gap-2">
              <input
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl outline-none"
                style={{ border: "2px solid var(--brand)", fontSize: 14, fontFamily: "var(--font-family)" }}
              />
              <button
                onClick={handleSave}
                type="button"
                className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none outline-none"
                style={{ background: "var(--brand)" }}
              >
                <Save size={14} color="#fff" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 17, fontWeight: 800, color: "var(--foreground)" }}>{user.name}</span>
              <button onClick={() => setEditing(true)} className="cursor-pointer border-none bg-transparent outline-none" style={{ color: "#aaa" }}>
                <Edit2 size={13} />
              </button>
            </div>
          )}

          <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4 }}>{user.email}</div>

          <div
            className="mt-3 px-4 py-1.5 rounded-full"
            style={{ background: "var(--brand-light)", color: "var(--brand-dark)", fontWeight: 700, fontSize: 13 }}
          >
            {role === "Admin" ? "⚔️ Ranger" : "🌱 Student"}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Day Streak", value: user.streak, icon: "🔥", color: "#f97316" },
            { label: "Total XP", value: user.xp.toLocaleString(), icon: "⭐", color: "#f59e0b" },
            { label: "Level", value: user.cefr, icon: "🎓", color: "#8b5cf6" },
            { label: "Badges", value: badges.length, icon: "🏅", color: "var(--brand)" },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center"
              style={{ background: "var(--background)", border: "1.5px solid var(--border)" }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontWeight: 900, fontSize: 18, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Streak calendar */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={14} style={{ color: "var(--brand)" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#3c3c3c" }}>Streak Calendar</span>
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-center" style={{ fontSize: 9, fontWeight: 700, color: "#aaa", paddingBottom: 2 }}>{d}</div>
            ))}
            {streakCalendar.map((day, i) => (
              <div
                key={i}
                className="aspect-square rounded-md flex items-center justify-center"
                style={{
                  background: day.studied ? "var(--brand-light)" : "#f3f4f6",
                }}
                title={day.studied ? `Studied on ${day.date}` : "No activity"}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ background: "var(--brand)" }} />
              <span style={{ fontSize: 10.5, color: "#888" }}>Today</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ background: "var(--brand-light)" }} />
              <span style={{ fontSize: 10.5, color: "#888" }}>Studied</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl cursor-pointer w-full border-none outline-none font-bold text-white transition-all shadow-md"
          style={{ background: "#dc2626" }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto px-7 py-7">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([["achievements", "🏅 Achievements"], ["xp-log", "⭐ XP History"]] as [typeof activeTab, string][]).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
              className="px-5 py-2 rounded-full cursor-pointer transition-all border-none outline-none font-bold text-sm"
              style={{
                background: activeTab === tab ? "var(--brand)" : "var(--card)",
                color: activeTab === tab ? "#fff" : "var(--muted-foreground)",
                border: `2px solid ${activeTab === tab ? "var(--brand)" : "var(--border)"}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "achievements" && (
          <>
            <div className="flex items-center gap-2 mb-5">
              <Award size={16} style={{ color: "#f59e0b" }} />
              <h2 style={{ fontSize: 17, fontWeight: 900, color: "var(--foreground)" }}>Achievements Shelf</h2>
              <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--muted-foreground)" }}>
                {badges.length} unlocked
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {isLoadingData ? (
                 <div className="col-span-4 flex justify-center py-10"><Loader2 className="animate-spin" /></div>
              ) : badges.map(ub => (
                <div
                  key={ub.id}
                  className="rounded-2xl p-4 text-center flex flex-col items-center gap-2"
                  style={{
                    background: "var(--card)",
                    border: `2px solid ${darkMode ? "var(--brand-dark)" : "var(--brand-light)"}`,
                    boxShadow: darkMode ? "none" : "0 2px 12px rgba(88,204,2,0.15)",
                  }}
                >
                  <div style={{ fontSize: 32 }}>
                    {ub.badge.imageUrl || '🏅'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.4 }}>
                    {ub.badge.name}
                  </div>
                  <div
                    className="px-2 py-0.5 rounded-full"
                    style={{ background: "var(--brand-light)", color: "var(--brand-dark)", fontSize: 10, fontWeight: 700 }}
                  >
                    Unlocked ✓
                  </div>
                </div>
              ))}
              {!isLoadingData && badges.length === 0 && (
                <div className="col-span-4 text-center py-10 text-slate-400">No badges earned yet. Keep studying!</div>
              )}
            </div>
          </>
        )}

        {activeTab === "xp-log" && (
          <>
            <h2 style={{ fontSize: 17, fontWeight: 900, color: "var(--foreground)", marginBottom: 20 }}>XP History</h2>
            <div
              className="rounded-2xl px-5 py-4 mb-6 flex items-center justify-between"
              style={{
                background: darkMode ? "rgba(253,230,138,0.15)" : "#fff8cc",
                border: `2px solid ${darkMode ? "#f59e0b" : "#fde68a"}`,
              }}
            >
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: darkMode ? "#fdba74" : "#b45309" }}>Total XP Earned</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: darkMode ? "#f59e0b" : "#92400e" }}>{user.xp.toLocaleString()} XP</div>
              </div>
              <div style={{ fontSize: 40 }}>⭐</div>
            </div>
            <div className="flex flex-col gap-3">
              {isLoadingData ? (
                 <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
              ) : xpHistory.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                  style={{ background: "var(--card)", border: "1.5px solid var(--border)" }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>✨</span>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--foreground)" }}>{entry.reason}</div>
                    <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{new Date(entry.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full shrink-0"
                    style={{ background: "var(--brand-light)", color: "var(--brand-dark)", fontWeight: 800, fontSize: 13 }}
                  >
                    +{entry.amount} XP
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
