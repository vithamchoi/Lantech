import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { useTranslation } from "../hooks/useTranslation";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Globe, ChevronDown, Check } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { role, login, darkMode, toggleDarkMode, language, setLanguage } = useAppStore();
  const { t } = useTranslation();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const handleEnterAuth = (mode: "login" | "register", selectRole?: "student" | "ranger") => {
    if (selectRole === "ranger") {
      login("Admin", "ranger@lantech.org");
      navigate("/ranger");
    } else {
      navigate("/auth", { state: { mode } });
    }
  };

  const languagesList = [
    { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
    { code: "ko", label: "한국어", flag: "🇰🇷" },
  ];

  const currentLangObj = languagesList.find((l) => l.code === language) || languagesList[0];

  return (
    <div
      className="min-h-screen w-full flex flex-col transition-colors duration-300 relative overflow-x-hidden"
      style={{
        background: "var(--background)",
        fontFamily: "var(--font-family)",
      }}
    >
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full bg-brand/10 blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full bg-sky-500/10 blur-[120px] pointer-events-none z-0" />

      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 sm:px-12 py-5 backdrop-blur-md sticky top-0 z-40 border-b border-border bg-background/80">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:rotate-12 duration-300"
            style={{ background: "var(--brand)" }}
          >
            <span style={{ fontSize: 22 }}>🌱</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-xl tracking-tight leading-none text-foreground">
              Lantech <span style={{ color: "var(--brand)" }}>English</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-1">Language Orchard</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Light/Dark Toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl cursor-pointer border border-border bg-card text-foreground hover:bg-muted transition-colors outline-none shadow-sm flex items-center justify-center"
            title={darkMode ? t("lightModeTitle") : t("darkModeTitle")}
          >
            {darkMode ? (
              <Sun className="w-4.5 h-4.5 text-brand-gold animate-pulse" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-brand-purple" />
            )}
          </motion.button>

          {/* Language Switcher */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="px-3.5 py-2.5 rounded-xl cursor-pointer border border-border bg-card text-foreground hover:bg-muted transition-all outline-none shadow-sm flex items-center gap-2 font-bold text-xs"
            >
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span>{currentLangObj.flag}</span>
              <span className="hidden md:inline">{currentLangObj.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {isLangDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-40 rounded-xl bg-card border border-border shadow-xl z-50 p-1.5 flex flex-col gap-0.5"
                  >
                    {languagesList.map((langItem) => (
                      <button
                        key={langItem.code}
                        onClick={() => {
                          setLanguage(langItem.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-lg cursor-pointer border-none text-left flex items-center justify-between text-xs font-bold transition-colors ${
                          language === langItem.code
                            ? "bg-brand/10 text-brand-dark dark:text-brand"
                            : "bg-transparent text-foreground hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{langItem.flag}</span>
                          <span>{langItem.label}</span>
                        </div>
                        {language === langItem.code && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <motion.button
            onClick={() => handleEnterAuth("login")}
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: "rgba(88, 204, 2, 0.08)"
            }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2.5 rounded-xl cursor-pointer border outline-none font-bold text-xs transition-colors hidden sm:block"
            style={{
              border: "2px solid var(--brand)",
              color: "var(--brand)",
              background: "transparent",
            }}
          >
            {t("landingSignIn")}
          </motion.button>
          
          <motion.button
            onClick={() => handleEnterAuth("register")}
            whileHover={{ 
              scale: 1.05,
              filter: "brightness(1.05)",
              boxShadow: "0 4px 15px rgba(88, 204, 2, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2.5 rounded-xl cursor-pointer border-none outline-none font-bold text-xs text-white shadow-md transition-all"
            style={{
              background: "var(--brand)",
            }}
          >
            {t("landingJoinTrail")}
          </motion.button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-5xl mx-auto z-10">
        {/* Mascot illustration */}
        <div className="relative mb-10">
          <motion.div
            className="w-36 h-36 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, var(--brand) 0%, #34d399 100%)" }}
            animate={{ 
              y: [0, -8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Soft inner glow ring */}
            <div className="absolute inset-1.5 rounded-full border-2 border-white/20 pointer-events-none" />
            <span style={{ fontSize: 72 }}>🐣</span>
          </motion.div>
          
          <motion.div
            className="absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-[#1E2522]"
            style={{ background: "var(--brand-gold)", fontSize: 22 }}
            animate={{ 
              y: [0, 5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            ⭐
          </motion.div>
          <motion.div
            className="absolute -bottom-2 -left-3 w-11 h-11 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-[#1E2522]"
            style={{ background: darkMode ? "#2C3531" : "#e0f2fe", fontSize: 20 }}
            animate={{ 
              x: [0, 4, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8
            }}
          >
            🌿
          </motion.div>
        </div>

        <h1
          className="mb-6 font-outfit text-foreground tracking-tight text-left sm:text-center"
          style={{
            fontSize: "clamp(2.2rem, 6vw, 3.5rem)",
            fontWeight: 900,
            lineHeight: 1.15,
            maxWidth: 800,
          }}
        >
          {t("landingHeroHeaderMain")}<br />
          <span style={{ color: "var(--brand)" }}>{t("landingHeroHeaderSub")}</span>
        </h1>
        
        <p
          className="mb-12 text-muted-foreground font-medium max-w-2xl text-left sm:text-center"
          style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)", lineHeight: 1.8 }}
        >
          {t("landingHeroDesc")}
        </p>

        {/* CTA buttons */}
        <div className="flex items-center gap-5 flex-wrap justify-center mb-20">
          <motion.button
            onClick={() => handleEnterAuth("register")}
            whileHover={{ 
              y: -3,
              boxShadow: "0 8px 0 var(--brand-dark), 0 12px 28px rgba(88,204,2,0.35)",
              scale: 1.02
            }}
            whileTap={{ 
              y: 3,
              boxShadow: "0 2px 0 var(--brand-dark), 0 4px 10px rgba(88,204,2,0.15)",
              scale: 0.98
            }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="px-10 py-4 rounded-2xl cursor-pointer border-none outline-none text-white font-black text-lg shadow-lg flex items-center gap-2"
            style={{
              background: "var(--brand)",
              boxShadow: "0 6px 0 var(--brand-dark), 0 8px 20px rgba(88,204,2,0.25)",
            }}
          >
            {t("landingCtaJoin")}
          </motion.button>
          
          <motion.button
            onClick={() => handleEnterAuth("login")}
            whileHover={{ 
              y: -3,
              boxShadow: darkMode ? "0 6px 0 rgba(255,255,255,0.08), 0 10px 24px rgba(0,0,0,0.3)" : "0 6px 0 rgba(0,0,0,0.12), 0 10px 24px rgba(0,0,0,0.08)",
              scale: 1.02
            }}
            whileTap={{ 
              y: 1,
              boxShadow: darkMode ? "0 2px 0 rgba(255,255,255,0.04)" : "0 2px 0 rgba(0,0,0,0.05)",
              scale: 0.98
            }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="px-10 py-4 rounded-2xl cursor-pointer border outline-none font-bold text-lg"
            style={{
              background: "var(--card)",
              color: "var(--foreground)",
              borderColor: "var(--border)",
              boxShadow: darkMode ? "0 4px 0 rgba(255,255,255,0.06)" : "0 4px 0 rgba(0,0,0,0.08)",
            }}
          >
            {t("landingCtaLogin")}
          </motion.button>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl w-full text-left">
          {[
            { icon: "🗺️", titleKey: "landingFeat1Title", descKey: "landingFeat1Desc" },
            { icon: "🃏", titleKey: "landingFeat2Title", descKey: "landingFeat2Desc" },
            { icon: "🤖", titleKey: "landingFeat3Title", descKey: "landingFeat3Desc" },
            { icon: "🎤", titleKey: "landingFeat4Title", descKey: "landingFeat4Desc" },
            { icon: "🏆", titleKey: "landingFeat5Title", descKey: "landingFeat5Desc" },
            { icon: "🎖️", titleKey: "landingFeat6Title", descKey: "landingFeat6Desc" },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ 
                y: -6, 
                scale: 1.03, 
                borderColor: "var(--brand)",
                boxShadow: darkMode ? "0 12px 30px rgba(0,0,0,0.5)" : "0 12px 28px rgba(0,0,0,0.08)"
              }}
              whileTap={{ scale: 0.98 }}
              className="rounded-3xl p-6 cursor-pointer border border-solid transition-all duration-300 flex flex-col items-start gap-3"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: darkMode ? "none" : "0 4px 20px rgba(0,0,0,0.02)",
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-brand/5 dark:bg-brand/10 flex items-center justify-center text-3xl shadow-sm mb-1">
                {f.icon}
              </div>
              <h3 className="font-extrabold text-[15px] text-foreground tracking-tight">
                {t(f.titleKey)}
              </h3>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                {t(f.descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer
        className="px-6 sm:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-10"
        style={{ borderTop: "1px solid var(--border)", background: "var(--card)" }}
      >
        <div className="text-xs text-muted-foreground font-semibold">
          {t("rightsReserved")}
        </div>
        
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <motion.button
            onClick={() => handleEnterAuth("login", "ranger")}
            whileHover={{ scale: 1.05, color: "#f472b6" }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer border-none outline-none bg-transparent"
            style={{ fontSize: 12, color: "#ec4899", fontWeight: 700, textDecoration: "underline" }}
          >
            {t("landingDemoAdmin")}
          </motion.button>
          
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
              style={{ background: "var(--brand)" }}
            />
            <span className="text-xs text-muted-foreground font-semibold">
              {t("landingServerStatus")}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
