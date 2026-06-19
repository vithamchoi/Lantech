import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { Compass, BookOpen, Layers, Mic, Bot, Trophy, User, ShieldCheck, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, darkMode } = useAppStore();
  const { t } = useTranslation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("lantech-sidebar-collapsed") === "true";
  });
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  if (!user) return null;

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("lantech-sidebar-collapsed", String(nextState));
  };

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

  const getActiveStyles = (isActive: boolean) => {
    if (!isActive) return { color: "var(--sidebar-foreground)", bg: "transparent" };
    if (role === "Admin") {
      return {
        color: darkMode ? "#f472b6" : "#db2777",
        bg: darkMode ? "rgba(236, 72, 153, 0.15)" : "#fce7f3",
      };
    } else {
      return {
        color: darkMode ? "var(--brand)" : "var(--brand-dark)",
        bg: darkMode ? "rgba(88, 204, 2, 0.15)" : "var(--brand-light)",
      };
    }
  };

  return (
    <motion.aside
      animate={{ 
        width: isCollapsed ? 68 : 220 
      }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      style={{
        background: "var(--sidebar)",
        borderColor: "var(--sidebar-border)",
        overflow: isCollapsed ? "visible" : "hidden",
      }}
      className={`hidden md:flex flex-col shrink-0 border-r h-full relative z-20 ${
        isCollapsed ? "overflow-visible" : "overflow-hidden"
      }`}
    >
      {/* Floating Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full border bg-[var(--card)] hover:bg-[var(--muted)] flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-all z-50 border-solid"
        style={{
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo */}
      <div
        className="flex items-center gap-2 px-4 border-b shrink-0 overflow-hidden"
        style={{ borderColor: "var(--sidebar-border)", height: 70, boxSizing: "border-box" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer shrink-0"
          style={{ background: "var(--brand)" }}
          onClick={() => navigate(role === "Admin" ? "/ranger" : "/dashboard")}
        >
          <span style={{ fontSize: 18 }}>🌱</span>
        </div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ fontWeight: 800, fontSize: 15, color: "var(--sidebar-foreground)", lineHeight: 1.1 }}>Lantech</div>
            <div style={{ fontSize: 10, color: "var(--brand)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>English</div>
          </motion.div>
        )}
      </div>

      {/* Nav items */}
      <nav 
        className={`flex-1 py-3 px-3 flex flex-col gap-1 relative ${isCollapsed ? "overflow-visible" : "overflow-y-auto"}`}
        style={{ overflow: isCollapsed ? "visible" : "auto" }}
      >
        <AnimatePresence>
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path || (path !== "/ranger" && location.pathname.startsWith(path + "/"));
            const activeStyles = getActiveStyles(isActive);
            
            const hoverBg = role === "Admin"
              ? (darkMode ? "rgba(236, 72, 153, 0.16)" : "rgba(236, 72, 153, 0.08)")
              : (darkMode ? "rgba(88, 204, 2, 0.16)" : "rgba(88, 204, 2, 0.08)");

            const isHovered = hoveredPath === path;
            const itemColor = isHovered 
              ? (role === "Admin" ? (darkMode ? "#f472b6" : "#db2777") : (darkMode ? "var(--brand)" : "var(--brand-dark)"))
              : activeStyles.color;

            return (
              <motion.button
                key={path}
                onClick={() => navigate(path)}
                onMouseEnter={() => setHoveredPath(path)}
                onMouseLeave={() => setHoveredPath(null)}
                whileHover={{ 
                  backgroundColor: isActive ? activeStyles.bg : hoverBg,
                  scale: 1.02
                }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center text-left cursor-pointer relative border-none outline-none group ${
                  isHovered ? "z-50" : "z-10"
                } ${
                  isActive 
                    ? "font-extrabold opacity-100" 
                    : "opacity-75 hover:opacity-100"
                } ${
                  isCollapsed 
                    ? "justify-center rounded-full px-0 py-0 w-9 h-9 mx-auto my-1" 
                    : "gap-3 px-3 py-2.5 w-full rounded-xl"
                }`}
                style={{
                  background: "transparent",
                  color: itemColor,
                  fontSize: 13.5,
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className={`absolute inset-0 -z-10 ${isCollapsed ? "rounded-full" : "rounded-xl"}`}
                    style={{ background: activeStyles.bg }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <Icon
                  size={18}
                  className="relative z-10 group-hover:scale-110 transition-transform duration-200"
                  style={{ 
                    color: itemColor, 
                    opacity: isActive ? 1 : 0.8,
                    flexShrink: 0 
                  }}
                />
                {!isCollapsed && <span className="relative z-10">{label}</span>}

                {/* Tooltip */}
                <AnimatePresence>
                  {isCollapsed && isHovered && (
                    <motion.div
                      key={`${path}-tooltip`}
                      initial={{ opacity: 0, scale: 0.9, x: -5 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -5 }}
                      className="absolute left-[54px] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold z-[9999] border border-solid min-w-max w-max whitespace-nowrap pointer-events-none"
                      style={{
                        background: "var(--card)",
                        color: "var(--foreground)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <span className="whitespace-nowrap">{label}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}

          {/* Ranger Console link if student role but has admin privileges or shortcut */}
          {role === "Student" && user.email.includes("ranger") && (
            <>
              <div style={{ height: 1, background: "var(--sidebar-border)", margin: isCollapsed ? "8px auto" : "8px 4px", width: isCollapsed ? 20 : "auto" }} />
              <motion.button
                onClick={() => navigate("/ranger")}
                onMouseEnter={() => setHoveredPath("ranger")}
                onMouseLeave={() => setHoveredPath(null)}
                whileHover={{ 
                  backgroundColor: darkMode ? "rgba(236, 72, 153, 0.16)" : "rgba(236, 72, 153, 0.08)",
                  scale: 1.02
                }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center text-left cursor-pointer relative border-none outline-none group text-[var(--sidebar-foreground)] opacity-70 hover:opacity-100 ${
                  hoveredPath === "ranger" ? "z-50" : "z-10"
                } ${
                  isCollapsed 
                    ? "justify-center rounded-full px-0 py-0 w-9 h-9 mx-auto my-1" 
                    : "gap-3 px-3 py-2.5 w-full rounded-xl"
                }`}
                style={{
                  background: "transparent",
                  fontSize: 13.5,
                  color: hoveredPath === "ranger" ? (darkMode ? "#f472b6" : "#db2777") : "var(--sidebar-foreground)"
                }}
              >
                <ShieldCheck 
                  size={18} 
                  className="relative z-10 group-hover:scale-110 transition-transform duration-200" 
                  style={{ 
                    color: hoveredPath === "ranger" ? (darkMode ? "#f472b6" : "#db2777") : "currentColor", 
                    opacity: 0.8, 
                    flexShrink: 0 
                  }} 
                />
                {!isCollapsed && <span className="relative z-10">{t("navAdmin")}</span>}

                <AnimatePresence>
                  {isCollapsed && hoveredPath === "ranger" && (
                    <motion.div
                      key="ranger-tooltip"
                      initial={{ opacity: 0, scale: 0.9, x: -5 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -5 }}
                      className="absolute left-[54px] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold z-[9999] border border-solid min-w-max w-max whitespace-nowrap pointer-events-none"
                      style={{
                        background: "var(--card)",
                        color: "var(--foreground)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <span className="whitespace-nowrap">{t("navAdmin")}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Bottom: user info + logout */}
      <div className="px-2.5 py-2.5 border-t shrink-0" style={{ borderColor: "var(--sidebar-border)" }}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 px-2 py-1.5 mb-1.5">
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
            <motion.button
              whileHover={{ scale: 1.02, background: "rgba(239, 68, 68, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-xl cursor-pointer transition-colors duration-200 border-none outline-none"
              style={{ background: "transparent", color: "#f87171", fontSize: 13, fontWeight: 600 }}
            >
              <LogOut size={15} style={{ color: "#f87171" }} />
              {t("navLogout")}
            </motion.button>
          </>
        ) : (
          <div className="flex flex-col gap-2 items-center py-1 relative">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer relative group"
              style={{ background: "var(--brand)", color: "#fff", fontWeight: 800, fontSize: 13 }}
              onMouseEnter={() => setHoveredPath("avatar")}
              onMouseLeave={() => setHoveredPath(null)}
            >
              {user.name.substring(0, 2).toUpperCase()}

              <AnimatePresence>
                {isCollapsed && hoveredPath === "avatar" && (
                  <motion.div
                    key="avatar-tooltip"
                    initial={{ opacity: 0, scale: 0.9, x: -5 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -5 }}
                    className="absolute left-[54px] top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-lg shadow-xl text-xs font-bold z-[9999] border border-solid text-left min-w-max w-max whitespace-nowrap pointer-events-none"
                    style={{
                      background: "var(--card)",
                      color: "var(--foreground)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="font-extrabold whitespace-nowrap">{user.name}</div>
                    <div className="text-[10px] opacity-75 font-semibold mt-0.5 whitespace-nowrap">{role === "Admin" ? t("roleAdmin") : t("roleStudent")}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              onMouseEnter={() => setHoveredPath("logout")}
              onMouseLeave={() => setHoveredPath(null)}
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none outline-none text-red-400 hover:bg-red-500/10 relative group"
              style={{ background: "transparent" }}
            >
              <LogOut size={18} />

              <AnimatePresence>
                {isCollapsed && hoveredPath === "logout" && (
                  <motion.div
                    key="logout-tooltip"
                    initial={{ opacity: 0, scale: 0.9, x: -5 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -5 }}
                    className="absolute left-[54px] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold z-[9999] border border-solid min-w-max w-max whitespace-nowrap pointer-events-none"
                    style={{
                      background: "var(--card)",
                      color: "var(--foreground)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <span className="whitespace-nowrap">{t("navLogout")}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

