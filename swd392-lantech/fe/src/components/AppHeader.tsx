import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "../store/appStore";
import { Flame, Sprout, Bell, CheckCheck, Trophy, Zap, BookOpen, Mic, Sun, Moon } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

const LEVEL_COLORS: Record<string, string> = {
  A1: "#60a5fa",
  A2: "#34d399",
  B1: "#fbbf24",
  B2: "#f97316",
  C1: "#a78bfa",
  C2: "#ec4899",
};

export default function AppHeader() {
  const { user, darkMode, toggleDarkMode } = useAppStore();
  const { t } = useTranslation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const notificationsList = [
    { id: "1", icon: Trophy, iconColor: "#f59e0b", iconBg: "#fef9c3", title: t("notifTitle1"), body: t("notifBody1"), time: t("notifTime1"), unread: true },
    { id: "2", icon: Zap, iconColor: "var(--brand)", iconBg: "var(--brand-light)", title: t("notifTitle2"), body: t("notifBody2"), time: t("notifTime2"), unread: true },
    { id: "3", icon: BookOpen, iconColor: "#3b82f6", iconBg: "#dbeafe", title: t("notifTitle3"), body: t("notifBody3"), time: t("notifTime3"), unread: true },
    { id: "4", icon: Mic, iconColor: "#8b5cf6", iconBg: "#ede9fe", title: t("notifTitle4"), body: t("notifBody4"), time: t("notifTime4"), unread: false },
    { id: "5", icon: Trophy, iconColor: "#ec4899", iconBg: "#fce7f3", title: t("notifTitle5"), body: t("notifBody5"), time: t("notifTime5"), unread: false },
  ];

  const levelColor = LEVEL_COLORS[user.cefr] || "#60a5fa";
  const unreadCount = notificationsList.filter(n => n.unread && !readIds.has(n.id)).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  const markAllRead = () => setReadIds(new Set(notificationsList.map(n => n.id)));

  return (
    <header
      className="flex items-center justify-between px-6 border-b shrink-0 transition-colors duration-300"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
        height: 70,
        boxSizing: "border-box",
      }}
    >
      {/* Left: greeting */}
      <div>
        <span style={{ fontSize: 13.5, color: "var(--muted-foreground)", fontWeight: 500 }}>
          {t("welcomeBack", { name: user.name.split(" ")[0] })}
        </span>
      </div>

      {/* Right: stats */}
      <div className="flex items-center gap-4">
        {/* Streak */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer"
          style={{
            background: darkMode ? "rgba(249,115,22,0.15)" : "#fff7ed",
            border: `2px solid ${darkMode ? "rgba(249,115,22,0.4)" : "#fed7aa"}`,
          }}
          title={t("dayStreak")}
        >
          <Flame size={15} style={{ color: "#f97316" }} />
          <span style={{ fontWeight: 800, fontSize: 13.5, color: darkMode ? "#fdba74" : "#c2410c" }}>{user.streak}</span>
        </div>

        {/* XP */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer"
          style={{
            background: darkMode ? "rgba(88,204,2,0.15)" : "#f0fdf4",
            border: `2px solid ${darkMode ? "rgba(88,204,2,0.4)" : "var(--brand-light)"}`,
          }}
          title={t("totalXp")}
        >
          <Sprout size={15} style={{ color: "var(--brand)" }} />
          <span style={{ fontWeight: 800, fontSize: 13.5, color: darkMode ? "var(--brand)" : "var(--brand-dark)" }}>
            {user.xp.toLocaleString()} XP
          </span>
        </div>

        {/* CEFR Level */}
        <div
          className="px-3 py-1.5 rounded-full"
          style={{
            background: levelColor + "22",
            border: `2px solid ${levelColor}55`,
            fontWeight: 800,
            fontSize: 13,
            color: levelColor,
            letterSpacing: 1,
          }}
        >
          {user.cefr}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border-none outline-none"
          style={{ background: "var(--muted)" }}
          title={darkMode ? t("lightModeTitle") : t("darkModeTitle")}
        >
          {darkMode ? (
            <Sun size={15} style={{ color: "var(--foreground)", opacity: 0.8 }} />
          ) : (
            <Moon size={15} style={{ color: "var(--foreground)", opacity: 0.8 }} />
          )}
        </button>

        {/* Notification bell */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors relative cursor-pointer border-none outline-none"
            style={{ background: notifOpen ? "var(--secondary)" : "var(--muted)" }}
          >
            <Bell size={15} style={{ color: "var(--foreground)", opacity: 0.8 }} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "var(--brand-ruby)", fontSize: 9, fontWeight: 800, color: "#fff" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-11 z-50 rounded-2xl shadow-2xl overflow-hidden"
              style={{ width: 340, background: "var(--card)", border: "1.5px solid var(--border)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "var(--foreground)" }}>{t("notifications")}</div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1.5 cursor-pointer border-none outline-none bg-transparent"
                    style={{ fontSize: 12, fontWeight: 700, color: darkMode ? "var(--brand)" : "var(--brand-dark)", padding: 0 }}
                  >
                    <CheckCheck size={13} />
                    {t("markAllRead")}
                  </button>
                )}
              </div>

              {/* List */}
              <div style={{ maxHeight: 380 }} className="overflow-y-auto">
                {notificationsList.map(n => {
                  const isUnread = n.unread && !readIds.has(n.id);
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => setReadIds(prev => new Set([...prev, n.id]))}
                      className="flex gap-3 px-5 py-4 cursor-pointer transition-colors"
                      style={{
                        background: isUnread ? (darkMode ? "rgba(88, 204, 2, 0.15)" : "rgba(88, 204, 2, 0.08)") : "transparent",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: n.iconBg }}
                      >
                        <Icon size={16} style={{ color: n.iconColor }} />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-start justify-between gap-2">
                          <div style={{ fontSize: 13, fontWeight: isUnread ? 700 : 600, color: "var(--foreground)", lineHeight: 1.4 }}>{n.title}</div>
                          {isUnread && (
                            <span
                              className="w-2 h-2 rounded-full shrink-0 mt-1"
                              style={{ background: "var(--brand)" }}
                            />
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.5, marginTop: 2 }}>{n.body}</div>
                        <div style={{ fontSize: 11, color: "var(--muted-foreground)", opacity: 0.6, marginTop: 4, fontWeight: 600 }}>{n.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div
                className="px-5 py-3 text-center cursor-pointer border-t"
                style={{ borderColor: "var(--border)" }}
                onClick={() => setNotifOpen(false)}
              >
                <span style={{ fontSize: 12.5, fontWeight: 700, color: darkMode ? "var(--brand)" : "var(--brand-dark)" }}>{t("seeAllNotif")}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
