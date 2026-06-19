import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { Compass, BookOpen, Layers, Mic, Bot, Trophy, User, LogOut } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { motion } from "motion/react";

interface MobileNavProps {
  onLogout: () => void;
}

export default function MobileNav({ onLogout }: MobileNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user } = useAppStore();
  const { t } = useTranslation();

  if (!user) return null;

  const studentNavItems = [
    { path: "/dashboard", label: t("navDashboard") || "Lộ trình", icon: Compass },
    { path: "/vocabulary", label: t("navVocabulary") || "Từ vựng", icon: BookOpen },
    { path: "/flashcards", label: t("navFlashcards") || "Flashcards", icon: Layers },
    { path: "/pronunciation", label: t("navPronunciation") || "Phát âm", icon: Mic },
    { path: "/ai-cabin", label: t("navAiCabin") || "AI Cabin", icon: Bot },
  ];

  const adminNavItems = [
    { path: "/ranger", label: t("navAdminConsole") || "Console", icon: Compass },
    { path: "/ranger/translations", label: t("navAdminTranslations") || "Dịch", icon: BookOpen },
    { path: "/ranger/curriculum", label: t("navAdminCurriculum") || "Khóa học", icon: Layers },
    { path: "/ranger/users", label: t("navAdminUsers") || "Học viên", icon: User },
  ];

  const navItems = role === "Admin" ? adminNavItems : studentNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 border-t md:hidden flex items-center justify-around z-45 bg-card border-border select-none shadow-lg pb-safe">
      {navItems.map(({ path, label, icon: Icon }) => {
        const isActive = location.pathname === path || (path !== "/ranger" && location.pathname.startsWith(path + "/"));
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center justify-center w-14 h-12 rounded-xl relative border-none outline-none bg-transparent cursor-pointer group"
          >
            {isActive && (
              <motion.div
                layoutId="activeMobileIndicator"
                className="absolute inset-0 rounded-xl"
                style={{ background: "var(--brand-light)" }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Icon
              size={20}
              className="relative z-10 transition-transform duration-200 group-hover:scale-110"
              style={{ color: isActive ? "var(--brand)" : "var(--muted-foreground)" }}
            />
            <span
              className="text-[9px] font-bold mt-0.5 relative z-10 truncate max-w-full"
              style={{ color: isActive ? "var(--brand-dark)" : "var(--muted-foreground)" }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
