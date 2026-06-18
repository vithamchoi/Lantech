import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";

export default function LandingPage() {
  const navigate = useNavigate();
  const { role, login, darkMode } = useAppStore();

  const handleEnterAuth = (mode: "login" | "register", selectRole?: "student" | "ranger") => {
    if (selectRole === "ranger") {
      login("Admin", "ranger@lantech.org");
      navigate("/ranger");
    } else {
      navigate("/auth", { state: { mode } });
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col transition-colors duration-300"
      style={{
        background: "var(--background)",
        fontFamily: "var(--font-family)",
      }}
    >
      {/* Top nav */}
      <nav className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: "var(--brand)" }}
          >
            <span style={{ fontSize: 20 }}>🌱</span>
          </div>
          <div>
            <span style={{ fontWeight: 900, fontSize: 20, color: "var(--foreground)" }}>Lantech</span>
            <span style={{ fontWeight: 900, fontSize: 20, color: "var(--brand)" }}> English</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleEnterAuth("login")}
            className="px-5 py-2 rounded-full cursor-pointer transition-all"
            style={{
              border: "2px solid var(--brand)",
              color: "var(--brand)",
              fontWeight: 700,
              fontSize: 14,
              background: "transparent",
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => handleEnterAuth("register")}
            className="px-5 py-2 rounded-full cursor-pointer transition-all shadow-md"
            style={{
              background: "var(--brand)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
            }}
          >
            Join the Trail
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        {/* Mascot illustration */}
        <div className="relative mb-8">
          <div
            className="w-36 h-36 rounded-full flex items-center justify-center shadow-2xl"
            style={{ background: "linear-gradient(135deg, var(--brand) 0%, #34d399 100%)" }}
          >
            <span style={{ fontSize: 72 }}>🐣</span>
          </div>
          <div
            className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg animate-bounce"
            style={{ background: "var(--brand-gold)", fontSize: 22 }}
          >
            ⭐
          </div>
          <div
            className="absolute -bottom-1 -left-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md"
            style={{ background: darkMode ? "#1e293b" : "#e0f2fe", fontSize: 18 }}
          >
            🌿
          </div>
        </div>

        <h1
          className="mb-4"
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: "var(--foreground)",
            lineHeight: 1.15,
            maxWidth: 640,
          }}
        >
          Grow Your English<br />
          <span style={{ color: "var(--brand)" }}>One Quest at a Time</span>
        </h1>
        <p
          style={{ fontSize: 18, color: "var(--muted-foreground)", fontWeight: 500, maxWidth: 520, lineHeight: 1.7 }}
          className="mb-10"
        >
          Level up your English skills through gamified grammar quests, speaking challenges, and spaced-repetition vocabulary — all in one vibrant learning orchard.
        </p>

        {/* CTA buttons */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <button
            onClick={() => handleEnterAuth("register")}
            className="px-10 py-4 rounded-2xl cursor-pointer transition-all shadow-xl"
            style={{
              background: "var(--brand)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 17,
              border: "none",
              boxShadow: "0 6px 0 var(--brand-dark), 0 8px 20px rgba(88,204,2,0.3)",
            }}
          >
            🌱 Join the Trail — It's Free!
          </button>
          <button
            onClick={() => handleEnterAuth("login")}
            className="px-10 py-4 rounded-2xl cursor-pointer transition-all"
            style={{
              background: "var(--card)",
              color: "var(--foreground)",
              fontWeight: 700,
              fontSize: 17,
              border: "2px solid var(--border)",
              boxShadow: darkMode ? "none" : "0 4px 0 rgba(0,0,0,0.1)",
            }}
          >
            Enter the Study
          </button>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-20 max-w-3xl w-full">
          {[
            { icon: "🗺️", title: "Learning Trail", desc: "Follow a winding quest path through grammar levels" },
            { icon: "🃏", title: "Flashcard Desk", desc: "Spaced repetition keeps new words in your memory" },
            { icon: "🤖", title: "AI Tutor", desc: "Get instant grammar explanations and sentence analysis" },
            { icon: "🎤", title: "Pronunciation Hub", desc: "AI grades your spoken English phoneme by phoneme" },
            { icon: "🏆", title: "Leaderboards", desc: "Compete weekly with learners around the world" },
            { icon: "🎖️", title: "Achievements", desc: "Unlock badges as you grow your English orchard" },
          ].map((f, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 text-center"
              style={{
                background: "var(--card)",
                border: "2px solid var(--border)",
                boxShadow: darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "var(--foreground)", marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted-foreground)", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer
        className="px-8 py-5 flex items-center justify-between"
        style={{ borderTop: "1px solid var(--border)", background: "var(--card)" }}
      >
        <div style={{ fontSize: 12.5, color: "var(--muted-foreground)", fontWeight: 600 }}>
          © 2026 Lantech English. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleEnterAuth("login", "ranger")}
            className="cursor-pointer"
            style={{ fontSize: 12, color: "#ec4899", fontWeight: 700, background: "none", border: "none", textDecoration: "underline" }}
          >
            ⚔️ Demo as Ranger Admin
          </button>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: "var(--brand)" }}
            />
            <span style={{ fontSize: 12.5, color: "var(--muted-foreground)", fontWeight: 600 }}>Orchard Server: Stable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
