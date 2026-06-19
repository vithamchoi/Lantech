import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";
import MobileNav from "../components/MobileNav";
import { Toaster } from "../components/ui/sonner";
import { motion, AnimatePresence } from "motion/react";

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const { role, logout, darkMode } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (!localStorage.getItem("theme")) {
        useAppStore.setState({ darkMode: mediaQuery.matches });
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Group routes to avoid unnecessary page-level remount transitions
  const getRouteTransitionKey = (pathname: string) => {
    if (pathname.startsWith("/ranger")) {
      return "/ranger";
    }
    return pathname;
  };

  // Define paths where sidebar and app header are hidden
  const hideSidebar =
    role === "Visitor" ||
    ["/", "/auth", "/onboarding", "/assessment", "/assessment-results"].includes(location.pathname);

  const showSidebar = !hideSidebar;

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: "var(--background)", fontFamily: "var(--font-family)" }}
    >
      {showSidebar && (
        <Sidebar onLogout={handleLogout} />
      )}
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {showSidebar && (
          <AppHeader />
        )}
        
        <main className="flex-1 overflow-auto pb-16 md:pb-0 relative">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={getRouteTransitionKey(location.pathname)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="h-full w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {showSidebar && (
          <MobileNav onLogout={handleLogout} />
        )}
      </div>

      <Toaster />
    </div>
  );
}

