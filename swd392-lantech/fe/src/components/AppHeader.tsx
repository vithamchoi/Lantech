import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "../store/appStore";
import { Flame, Sprout, Bell, CheckCheck, Trophy, Zap, BookOpen, Mic, Sun, Moon } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { motion, AnimatePresence } from "motion/react";
import { notificationService, NotificationDto } from "../services/notificationService";

const LEVEL_COLORS: Record<string, string> = {
  A1: "#60a5fa",
  A2: "#34d399",
  B1: "#fbbf24",
  B2: "#f97316",
  C1: "#a78bfa",
  C2: "#ec4899",
};

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Trophy: Trophy,
  Zap: Zap,
  BookOpen: BookOpen,
  Mic: Mic,
};

export default function AppHeader() {
  const { user, darkMode, toggleDarkMode, role } = useAppStore();
  const { t, language } = useTranslation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (notifOpen) {
      fetchNotifications();
    }
  }, [notifOpen]);

  const levelColor = LEVEL_COLORS[user.cefr] || "#60a5fa";
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    const isVi = language === "vi";
    const isJa = language === "ja";
    const isKo = language === "ko";

    if (diffMins < 1) {
      return isVi ? "Vừa xong" : isJa ? "たった今" : isKo ? "방금 전" : "Just now";
    }
    if (diffMins < 60) {
      return isVi ? `${diffMins} phút trước` : isJa ? `${diffMins}分前` : isKo ? `${diffMins}분 전` : `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      return isVi ? `${diffHours} giờ trước` : isJa ? `${diffHours}時間前` : isKo ? `${diffHours}時間 전` : `${diffHours}h ago`;
    }
    return isVi ? `${diffDays} ngày trước` : isJa ? `${diffDays}日前` : isKo ? `${diffDays}일 전` : `${diffDays}d ago`;
  };

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
        {role !== "Admin" && (
          <>
            {/* Streak */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer"
              style={{
                background: darkMode ? "rgba(249,115,22,0.15)" : "#fff7ed",
                border: `2px solid ${darkMode ? "rgba(249,115,22,0.4)" : "#fed7aa"}`,
              }}
              title={t("dayStreak")}
            >
              <Flame size={15} style={{ color: "#f97316" }} />
              <span style={{ fontWeight: 800, fontSize: 13.5, color: darkMode ? "#fdba74" : "#c2410c" }}>{user.streak}</span>
            </motion.div>

            {/* XP */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
            </motion.div>

            {/* CEFR Level */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="px-3 py-1.5 rounded-full select-none"
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
            </motion.div>
          </>
        )}

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.15, rotate: 15 }}
          whileTap={{ scale: 0.85, rotate: -15 }}
          onClick={toggleDarkMode}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border-none outline-none relative overflow-hidden"
          style={{ background: "var(--muted)" }}
          title={darkMode ? t("lightModeTitle") : t("darkModeTitle")}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={darkMode ? "sun" : "moon"}
              initial={{ y: -20, opacity: 0, rotate: -40 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 20, opacity: 0, rotate: 40 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {darkMode ? (
                <Sun size={15} style={{ color: "var(--foreground)", opacity: 0.8 }} />
              ) : (
                <Moon size={15} style={{ color: "var(--foreground)", opacity: 0.8 }} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Notification bell */}
        <div className="relative" ref={panelRef}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setNotifOpen(v => !v)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors relative cursor-pointer border-none outline-none"
            style={{ background: notifOpen ? "var(--secondary)" : "var(--muted)" }}
          >
            <Bell size={15} style={{ color: "var(--foreground)", opacity: 0.8 }} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                style={{ background: "var(--brand-ruby)", fontSize: 9, fontWeight: 800, color: "#fff" }}
              >
                {unreadCount}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
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
                  {notifications.map(n => {
                    const isUnread = !n.isRead;
                    const Icon = ICON_MAP[n.icon] || Bell;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id)}
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
                          <div style={{ fontSize: 11, color: "var(--muted-foreground)", opacity: 0.6, marginTop: 4, fontWeight: 600 }}>{formatTimeAgo(n.createdAt)}</div>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

