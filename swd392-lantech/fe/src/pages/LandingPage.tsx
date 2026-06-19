import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { useTranslation } from "../hooks/useTranslation";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Globe, ChevronDown, Check, Map, Layers, Bot, Mic } from "lucide-react";
import heroMascot from "../assets/hero-mascot.png";

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
      className="min-h-screen w-full flex flex-col bg-white dark:bg-background transition-colors duration-300 relative overflow-x-hidden"
      style={{
        fontFamily: "var(--font-family)",
      }}
    >
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full bg-brand/10 blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full bg-sky-500/10 blur-[120px] pointer-events-none z-0" />

      {/* Top Navbar */}
      <nav className="w-full max-w-[1360px] mx-auto px-6 sm:px-12 py-6 flex items-center justify-between z-40 bg-white dark:bg-background">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#58CC02] shadow-sm transition-transform hover:rotate-12 duration-300">
            <span className="text-2xl">🌱</span>
          </div>
          <div>
            <span className="font-extrabold text-2xl text-[#1e293b] dark:text-foreground">Lantech</span>
            <span className="font-extrabold text-2xl text-[#58CC02]"> English</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-10">
          {[
            { label: t("navDashboard") || "Tính năng", id: "features" },
            { label: "Cách hoạt động", id: "how-it-works" },
            { label: "Bảng giá", id: "pricing" },
            { label: "Về chúng tôi", id: "about-us" }
          ].map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="text-[#4b5563] dark:text-muted-foreground hover:text-[#58CC02] font-bold text-base transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Action Buttons, Lang Dropdown & Theme Toggle */}
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

          {/* Sign In Button */}
          <motion.button
            onClick={() => handleEnterAuth("login")}
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: "rgba(0, 0, 0, 0.02)"
            }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 rounded-full cursor-pointer border outline-none font-bold text-base transition-colors hidden sm:block"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
              background: "transparent",
            }}
          >
            {t("landingSignIn")}
          </motion.button>
          
          {/* Join Trail Button */}
          <motion.button
            onClick={() => handleEnterAuth("register")}
            whileHover={{ 
              scale: 1.05,
              filter: "brightness(1.05)",
              boxShadow: "0 4px 15px rgba(88, 204, 2, 0.2)"
            }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 rounded-full cursor-pointer border-none outline-none text-white font-bold text-base hidden sm:block shadow-sm"
            style={{
              background: "var(--brand)",
            }}
          >
            {t("landingJoinTrail")}
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-12 pt-8 pb-4 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[640px] z-10">
        {/* Left Column (Content) */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E7F9D4] text-[#58CC02] text-sm font-black tracking-wider uppercase mb-6 shadow-sm">
            <span>🌱</span> Học • Luyện tập • Tiến bộ
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-black tracking-tight text-foreground leading-[1.05] mb-6">
            {t("landingHeroHeaderMain") || "Phát triển tiếng Anh"} <br />
            <span className="text-[#58CC02]">{t("landingHeroHeaderSub") || "Qua từng thử thách"}</span>
          </h1>

          {/* Subhead */}
          <p className="text-muted-foreground text-lg lg:text-xl font-bold leading-relaxed mb-10 max-w-xl">
            {t("landingHeroDesc") || "Nâng tầm kỹ năng tiếng Anh qua các thử thách ngữ pháp, luyện nói và từ vựng — tất cả trong một hành trình học tập đầy thú vị."}
          </p>

          {/* 3D CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 w-full sm:w-auto mb-6">
            {/* Primary Green 3D Button */}
            <motion.button
              onClick={() => handleEnterAuth("register")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group px-10 py-5 bg-[#58CC02] hover:bg-[#61E202] text-white font-extrabold text-lg rounded-2xl cursor-pointer border-b-[6px] border-[#3D8F00] active:border-b-0 active:translate-y-[6px] transition-all duration-100 flex items-center justify-center gap-2"
            >
              <span>🌱</span> {t("landingCtaJoin") || "Bắt đầu học — Miễn phí!"}
              <span className="absolute bottom-0 left-0 w-full h-[6px] bg-[#3D8F00] rounded-b-2xl -z-10 group-active:h-0" />
            </motion.button>

            {/* Secondary White 3D Button */}
            <motion.button
              onClick={() => handleEnterAuth("login")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group px-10 py-5 bg-white dark:bg-card hover:bg-[#FAF8F5] text-gray-700 dark:text-foreground font-extrabold text-lg rounded-2xl cursor-pointer border-2 border-b-[6px] border-[#E5E5E5] dark:border-border active:border-b-2 active:translate-y-[4px] transition-all duration-100 flex items-center justify-center gap-2"
            >
              <span className="text-sm">▶</span> {t("landingCtaLogin") || "Vào phòng học"}
              <span className="absolute bottom-0 left-0 w-full h-[6px] bg-[#E5E5E5] dark:bg-border rounded-b-2xl -z-10 group-active:h-0" />
            </motion.button>
          </div>

          {/* Guarantee Text */}
          <div className="flex items-center gap-2 text-sm font-bold text-green-600/95">
            <span>✓</span> 100% Miễn phí bắt đầu
            <span className="text-gray-300 font-normal">•</span> Không cần thẻ tín dụng
          </div>
        </div>

        {/* Right Column (Hero Visual) */}
        <div className="lg:col-span-6 flex justify-center items-center w-full relative">
          <img
            src={heroMascot}
            alt="Lantech English Mascot and App Dashboard"
            className="w-full max-w-[620px] h-auto object-contain select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-12 pt-4 pb-16 z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Map className="w-8 h-8 text-[#58CC02]" />,
              iconBg: "bg-green-50 dark:bg-green-950/20",
              title: t("landingFeat1Title") || "Lộ trình học tập",
              desc: t("landingFeat1Desc") || "Đi theo con đường học tập được thiết kế qua các cấp độ ngữ pháp và theo dõi tiến trình của bạn.",
            },
            {
              icon: <Layers className="w-8 h-8 text-[#CE82FF]" />,
              iconBg: "bg-purple-50 dark:bg-purple-950/20",
              title: t("landingFeat2Title") || "Bàn học Flashcard",
              desc: t("landingFeat2Desc") || "Phương pháp lặp lại ngắt quãng giúp ghi nhớ từ vựng mới hiệu quả và lâu dài.",
            },
            {
              icon: <Bot className="w-8 h-8 text-[#1CB0F6]" />,
              iconBg: "bg-sky-50 dark:bg-sky-950/20",
              title: t("landingFeat3Title") || "Gia sư AI",
              desc: t("landingFeat3Desc") || "Nhận giải thích ngữ pháp và phân tích câu chi tiết tức thì bất cứ lúc nào.",
            },
            {
              icon: <Mic className="w-8 h-8 text-indigo-500" />,
              iconBg: "bg-indigo-50 dark:bg-indigo-950/20",
              title: t("landingFeat4Title") || "Trung tâm luyện âm",
              desc: t("landingFeat4Desc") || "Trí tuệ nhân tạo chấm điểm bài nói và giúp bạn phát âm chuẩn như người bản xứ.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ 
                y: -6, 
                scale: 1.02, 
                borderColor: "var(--brand)",
                boxShadow: darkMode ? "0 12px 30px rgba(0,0,0,0.4)" : "0 12px 28px rgba(0,0,0,0.05)"
              }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-start p-7 bg-white dark:bg-card border-2 border-gray-100 dark:border-border rounded-[28px] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              {/* Styled Icon */}
              <div className={`p-4 rounded-[20px] ${feature.iconBg} mb-6 flex items-center justify-center`}>
                {feature.icon}
              </div>
              {/* Title */}
              <h3 className="text-foreground font-extrabold text-xl mb-3">{feature.title}</h3>
              {/* Description */}
              <p className="text-muted-foreground text-base leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card z-10">
        <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground font-semibold">
            {t("rightsReserved")}
          </div>
          <div className="flex items-center gap-6">
            <motion.button
              onClick={() => handleEnterAuth("login", "ranger")}
              whileHover={{ scale: 1.05, color: "#f472b6" }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer text-xs text-pink-500 font-bold hover:underline bg-none border-none"
            >
              {t("landingDemoAdmin")}
            </motion.button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#58CC02] inline-block animate-pulse" />
              <span className="text-sm text-muted-foreground font-semibold">
                {t("landingServerStatus")}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
