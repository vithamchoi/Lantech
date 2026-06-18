import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { Compass, BookOpen, Layers, Mic, Bot, Trophy, User, ShieldCheck, LogOut } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAppStore();
  const { t } = useTranslation();

  if (!user) return null;

  const studentNavItems = [
    { path: "/dashboard", label: t("navDashboard"), icon: Compass },
    { path: "/vocabulary", label: t("navVocabulary"), icon: BookOpen },
    { path: "/flashcards", label: t("navFlashcards"), icon: Layers },
    { path: "/pronunciation", label: t("navPronunciation"), icon: Mic },
    { path: "/ai-cabin", label: t("navAiCabin"), icon: Bot },
    { path: "/leaderboard", label: t("navLeaderboard"), icon: Trophy },
    { path: "/profile", label: t("navProfile"), icon: User },
  ];

  const adminNavItems = [
    { path: "/ranger", label: t("navAdminConsole"), icon: Compass },
    { path: "/ranger/translations", label: t("navAdminTranslations"), icon: BookOpen },
    { path: "/ranger/curriculum", label: t("navAdminCurriculum"), icon: Layers },
    { path: "/ranger/vocabulary-badges", label: t("navAdminVocabulary"), icon: Trophy },
    { path: "/ranger/users", label: t("navAdminUsers"), icon: User },
  ];

  const navItems = role === "Admin" ? adminNavItems : studentNavItems;

  return (
    <aside
      className="flex flex-col shrink-0 border-r h-full transition-all duration-300"
      style={{
        width: 220,
        background: "var(--sidebar)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-5 border-b shrink-0"
        style={{ borderColor: "var(--sidebar-border)", height: 70, boxSizing: "border-box" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
          style={{ background: "var(--brand)" }}
          onClick={() => navigate(role === "Admin" ? "/ranger" : "/dashboard")}
        >
          <span style={{ fontSize: 18 }}>🌱</span>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--sidebar-foreground)", lineHeight: 1.1 }}>Lantech</div>
          <div style={{ fontSize: 10, color: "var(--brand)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>English</div>
        </div>
      </div>
 
      {/* Nav items */}
      <nav className="flex-1 py-3 px-3 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path || (path !== "/ranger" && location.pathname.startsWith(path + "/"));
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left w-full cursor-pointer border-none outline-none"
              style={{
                background: isActive ? "var(--brand-light)" : "transparent",
                color: isActive ? "var(--brand-dark)" : "var(--sidebar-foreground)",
                opacity: isActive ? 1 : 0.7,
                fontWeight: isActive ? 700 : 500,
                fontSize: 13.5,
              }}
            >
              <Icon
                size={18}
                style={{ color: isActive ? "var(--brand)" : "var(--sidebar-foreground)", opacity: isActive ? 1 : 0.5, flexShrink: 0 }}
              />
              {label}
            </button>
          );
        })}
 
        {/* Ranger Console link if student role but has admin privileges or shortcut */}
        {role === "Student" && user.email.includes("ranger") && (
          <>
            <div style={{ height: 1, background: "var(--sidebar-border)", margin: "8px 4px" }} />
            <button
              onClick={() => navigate("/ranger")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left w-full cursor-pointer border-none outline-none"
              style={{
                background: "transparent",
                color: "var(--sidebar-foreground)",
                opacity: 0.6,
                fontWeight: 500,
                fontSize: 13.5,
              }}
            >
              <ShieldCheck size={18} style={{ color: "var(--sidebar-foreground)", opacity: 0.5, flexShrink: 0 }} />
              {t("navAdmin")}
            </button>
          </>
        )}
      </nav>
 
      {/* Bottom: user info + logout */}
      <div className="px-3 py-3 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--brand)", color: "#fff", fontWeight: 800, fontSize: 12 }}
          >
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--sidebar-foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--sidebar-foreground)", opacity: 0.6, fontWeight: 600 }}>
              {role === "Admin" ? t("roleAdmin") : t("roleStudent")}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl cursor-pointer transition-all border-none outline-none"
          style={{ background: "transparent", color: "#f87171", fontSize: 13, fontWeight: 600 }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut size={15} style={{ color: "#f87171" }} />
          {t("navLogout")}
        </button>
      </div>
    </aside>
  );
}
