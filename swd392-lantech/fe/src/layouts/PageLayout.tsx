import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";
import { Toaster } from "../components/ui/sonner";

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
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {showSidebar && (
          <AppHeader />
        )}
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
}
