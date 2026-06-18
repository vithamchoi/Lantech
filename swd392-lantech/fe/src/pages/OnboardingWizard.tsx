import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { onboardingService, OnboardingOptionsDto } from "../services/onboardingService";
import { profileService } from "../services/profileService";
import { authService } from "../services/authService";
import { toast } from "sonner";
import { Loader2, Sun, Moon } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { user, login, setUser, darkMode, toggleDarkMode } = useAppStore();
  const { t, language, setLanguage } = useTranslation();
  
  const [step, setStep] = useState(1);
  
  const [options, setOptions] = useState<OnboardingOptionsDto | null>(null);
  
  const [nativeLanguage, setNativeLanguage] = useState(() => {
    if (user?.nativeLang && ["vi", "ja", "ko"].includes(user.nativeLang)) {
      return user.nativeLang;
    }
    return language;
  });
  
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  useEffect(() => {
    // If native language is already set, sync it
    if (user?.nativeLang && ["vi", "ja", "ko"].includes(user.nativeLang)) {
      setNativeLanguage(user.nativeLang);
      setLanguage(user.nativeLang as "vi" | "ja" | "ko");
    }
  }, [user?.nativeLang, setLanguage]);

  useEffect(() => {
    // Sync local state if language changes
    setNativeLanguage(language);
  }, [language]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await onboardingService.getOptions();
        setOptions(data);
      } catch (error) {
        toast.error(t("failedLoadOnboarding"));
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  if (!user) return null;

  const nativeLanguages = [
    {
      code: "vi",
      name: t("langVi"),
      nativeName: "Tiếng Việt",
      flag: (
        <svg viewBox="0 0 82 60" className="w-16 h-12 sm:w-20 sm:h-16 drop-shadow-md">
          {/* Rounded flag base */}
          <rect x="1" y="1" width="80" height="56" rx="16" fill="#ff4b4b" />
          {/* Star in the center */}
          <polygon 
            points="40,16 43,24 52,24 45,29 48,38 40,33 32,38 35,29 28,24 37,24" 
            fill="#ffd000" 
          />
        </svg>
      )
    },
    {
      code: "ja",
      name: t("langJa"),
      nativeName: "日本語",
      flag: (
        <svg viewBox="0 0 82 60" className="w-16 h-12 sm:w-20 sm:h-16 drop-shadow-md">
          {/* Rounded flag base with light border */}
          <rect x="1" y="1" width="80" height="56" rx="16" fill="#ffffff" stroke="var(--border)" strokeWidth="2" />
          {/* Red circle in the center */}
          <circle cx="41" cy="29" r="13" fill="#ff4b4b" />
        </svg>
      )
    },
    {
      code: "ko",
      name: t("langKo"),
      nativeName: "한국어",
      flag: (
        <svg viewBox="0 0 82 60" className="w-16 h-12 sm:w-20 sm:h-16 drop-shadow-md">
          {/* Flag base */}
          <rect x="1" y="1" width="80" height="56" rx="16" fill="#ffffff" stroke="var(--border)" strokeWidth="2" />
          
          {/* Taegeuk in the center */}
          <g transform="translate(41, 29) rotate(-30)">
            {/* Blue background circle */}
            <circle cx="0" cy="0" r="13" fill="#1d4ed8" />
            {/* Red top half */}
            <path d="M -13 0 A 13 13 0 0 1 13 0 A 6.5 6.5 0 0 1 0 0 A 6.5 6.5 0 0 0 -13 0" fill="#ff4b4b" />
          </g>
          
          {/* Trigrams in corners */}
          {/* Top Left */}
          <g transform="translate(18, 14) rotate(35)" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round">
            <line x1="-5" y1="-3.5" x2="5" y2="-3.5" />
            <line x1="-5" y1="0" x2="5" y2="0" />
            <line x1="-5" y1="3.5" x2="5" y2="3.5" />
          </g>
          {/* Bottom Right */}
          <g transform="translate(64, 44) rotate(35)" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round">
            <line x1="-5" y1="-3.5" x2="-1.5" y2="-3.5" /> <line x1="1.5" y1="-3.5" x2="5" y2="-3.5" />
            <line x1="-5" y1="0" x2="-1.5" y2="0" /> <line x1="1.5" y1="0" x2="5" y2="0" />
            <line x1="-5" y1="3.5" x2="-1.5" y2="3.5" /> <line x1="1.5" y1="3.5" x2="5" y2="3.5" />
          </g>
          {/* Top Right */}
          <g transform="translate(64, 14) rotate(-35)" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round">
            <line x1="-5" y1="-3.5" x2="-1.5" y2="-3.5" /> <line x1="1.5" y1="-3.5" x2="5" y2="-3.5" />
            <line x1="-5" y1="0" x2="5" y2="0" />
            <line x1="-5" y1="3.5" x2="-1.5" y2="3.5" /> <line x1="1.5" y1="3.5" x2="5" y2="3.5" />
          </g>
          {/* Bottom Left */}
          <g transform="translate(18, 44) rotate(-35)" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round">
            <line x1="-5" y1="-3.5" x2="5" y2="-3.5" />
            <line x1="-5" y1="0" x2="-1.5" y2="0" /> <line x1="1.5" y1="0" x2="5" y2="0" />
            <line x1="-5" y1="3.5" x2="5" y2="3.5" />
          </g>
        </svg>
      )
    }
  ];

  const handleStep2 = async () => {
    if (!nativeLanguage) return;
    try {
      setUser({ ...user, nativeLang: nativeLanguage });
      await profileService.updateSourceLanguage(nativeLanguage);
      setStep(2);
    } catch (error) {
      toast.error(t("failedUpdateLang"));
    }
  };

  const handleSelfSelect = async () => {
    if (!selectedLevel) return;
    setGenerating(true);
    try {
      const result = await onboardingService.selfSelectLevel({
        nativeLanguageCode: nativeLanguage,
        targetLevel: selectedLevel
      });
      
      // Update global user state
      const updatedUser = await authService.getMe();
      login(updatedUser.role === 'Admin' ? 'Admin' : 'Student', updatedUser);

      toast.success(t("learningPath"));
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("failedInitProfile"));
    } finally {
      setGenerating(false);
    }
  };

  const handlePlacementTest = () => {
    navigate("/assessment");
  };

  if (isLoadingOptions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Loader2 className="animate-spin" size={48} color="var(--brand)" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start sm:justify-center py-6 sm:py-12 px-4 overflow-y-auto transition-colors duration-300"
      style={{
        background: darkMode ? "var(--background)" : "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)",
        fontFamily: "var(--font-family)",
      }}
    >
      {/* Top Floating Controls */}
      <div className="w-full max-w-2xl flex justify-end items-center gap-3 mb-6 shrink-0">
        {/* Language selector */}
        <div className="flex items-center bg-neutral-200/50 dark:bg-neutral-800/50 p-1 rounded-xl border border-neutral-300/20">
          {(['vi', 'ja', 'ko'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                setLanguage(lang);
                setNativeLanguage(lang);
              }}
              className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-bold rounded-lg border-none cursor-pointer transition-all"
              style={{
                background: language === lang ? "var(--brand)" : "transparent",
                color: language === lang ? "#ffffff" : "var(--muted-foreground)",
              }}
            >
              {lang === 'vi' ? '🇻🇳 VI' : lang === 'ja' ? '🇯🇵 JA' : '🇰🇷 KO'}
            </button>
          ))}
        </div>

        {/* Theme selector */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-neutral-200/50 dark:bg-neutral-800/50 text-slate-600 dark:text-slate-300 hover:text-slate dark:hover:text-white transition-colors border-none cursor-pointer"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {generating ? (
        <div className="text-center p-6 max-w-md my-auto">
          <div style={{ fontSize: 80, marginBottom: 20 }}>🐣</div>
          <div className="text-xl md:text-2xl font-black mb-3 text-slate-800 dark:text-white">
            {t("growingOrchard")}
          </div>
          <div className="text-sm text-slate-500 dark:text-neutral-400 mb-8 leading-relaxed">
            {t("plantingTrail")}
          </div>
          <div className="flex gap-2 justify-center">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-3.5 h-3.5 rounded-full animate-bounce"
                style={{
                  background: "var(--brand)",
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div
          className="w-full max-w-2xl rounded-3xl p-5 sm:p-8 shadow-2xl transition-all duration-300 border text-center my-4 sm:my-auto"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          {/* Progress dots */}
          <div className="flex gap-2 justify-center mb-5 sm:mb-8">
            {[1, 2].map(s => (
              <div
                key={s}
                className="rounded-full transition-all"
                style={{
                  width: step === s ? 32 : 10,
                  height: 10,
                  background: step >= s ? "var(--brand)" : "var(--border)",
                }}
              />
            ))}
          </div>

          {step === 1 && (
            <>
              <div className="text-center mb-4 sm:mb-6">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">👋</div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-1">
                  {t("onboardingTitle", { name: user.name.split(" ")[0] })}
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-neutral-400 leading-relaxed">
                  {t("onboardingSubtitle")}
                </p>
              </div>

              <div className="mb-4 sm:mb-6 text-left">
                <label className="text-xs sm:text-sm font-black text-slate-800 dark:text-white block mb-2 uppercase tracking-wider">
                  {t("nativeLanguageLabel")}
                </label>
                
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {nativeLanguages.map(lang => {
                    const isSelected = nativeLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setNativeLanguage(lang.code);
                          setLanguage(lang.code);
                        }}
                        type="button"
                        className="flex flex-col items-center p-2 sm:p-4 rounded-3xl cursor-pointer transition-all duration-150 text-center select-none"
                        style={{
                          border: `3px solid ${isSelected ? "var(--brand)" : "var(--border)"}`,
                          borderBottomWidth: isSelected ? "3px" : "7px",
                          borderBottomColor: isSelected 
                            ? "var(--brand-dark)" 
                            : (darkMode ? "rgba(255, 255, 255, 0.12)" : "var(--border)"),
                          background: isSelected 
                            ? (darkMode ? "rgba(88, 204, 2, 0.2)" : "var(--brand-light)") 
                            : "var(--card)",
                          transform: isSelected ? "translateY(4px)" : "translateY(0px)",
                          boxShadow: isSelected ? "none" : "0 6px 12px -2px rgba(0,0,0,0.04)",
                        }}
                      >
                        <div className="mb-1 sm:mb-2 transform hover:scale-105 transition-transform duration-200">
                          {lang.flag}
                        </div>
                        <div className="text-[11px] sm:text-base leading-tight" style={{ fontWeight: 900, color: isSelected ? (darkMode ? "var(--brand)" : "var(--brand-dark)") : "var(--foreground)" }}>
                          {lang.name}
                        </div>
                        <div className="text-[9px] sm:text-xs leading-tight" style={{ fontWeight: 700, color: isSelected ? "var(--brand)" : "var(--muted-foreground)", marginTop: 2 }}>
                          {lang.nativeName}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-5 sm:mb-6 text-left">
                <label className="text-xs sm:text-sm font-black text-slate-800 dark:text-white block mb-1 uppercase tracking-wider">
                  {t("englishGoalLabel")}
                </label>
                <p className="text-[11px] sm:text-xs text-slate-400 dark:text-neutral-500 mb-2 leading-normal">
                  {t("englishGoalSubtitle")}
                </p>
                <div className="flex gap-2.5 flex-wrap">
                  {options?.supportedLevels.slice(-3).map(level => {
                    const isSelected = selectedLevel === level;
                    return (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        type="button"
                        className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl cursor-pointer transition-all duration-150 font-bold"
                        style={{
                          border: `2px solid ${isSelected ? "var(--brand)" : "var(--border)"}`,
                          borderBottomWidth: isSelected ? "2px" : "5px",
                          borderBottomColor: isSelected ? "var(--brand-dark)" : "var(--border)",
                          background: isSelected ? "var(--brand)" : "var(--card)",
                          color: isSelected ? "#ffffff" : "var(--foreground)",
                          transform: isSelected ? "translateY(3px)" : "translateY(0px)",
                          fontSize: 14,
                        }}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleStep2}
                className="w-full py-3.5 rounded-2xl cursor-pointer transition-all border-none text-white font-extrabold text-base shadow-md"
                style={{
                  background: "var(--brand)",
                  borderBottom: "4px solid var(--brand-dark)",
                }}
              >
                {t("continueBtn")}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-4 sm:mb-6">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🎯</div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-1">
                  {t("knowYourLevelTitle")}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 leading-relaxed max-w-lg mx-auto">
                  {t("knowYourLevelSubtitle")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-6 text-left">
                {options?.supportedLevels.map(level => {
                  const isSelected = selectedLevel === level;
                  return (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      type="button"
                      className="flex items-center gap-2.5 px-3 py-2 sm:py-2.5 rounded-2xl cursor-pointer transition-all text-left outline-none"
                      style={{
                        border: `2px solid ${isSelected ? "var(--brand)" : "var(--border)"}`,
                        background: isSelected ? "var(--brand-light)" : "var(--card)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: isSelected ? "var(--brand)" : "var(--input-background)",
                          color: isSelected ? "#fff" : "var(--muted-foreground)",
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        {level}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-white truncate">
                          {t("levelTitle", { level })}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate">
                          {t("cefrProficiency", { level })}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-brand flex items-center justify-center text-white shrink-0">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                            <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 flex-col sm:flex-row">
                <button
                  onClick={handleSelfSelect}
                  disabled={!selectedLevel}
                  type="button"
                  className="flex-1 py-3.5 rounded-2xl cursor-pointer transition-all border-none font-extrabold text-sm"
                  style={{
                    background: selectedLevel ? "var(--brand)" : "var(--border)",
                    color: selectedLevel ? "#fff" : "var(--muted-foreground)",
                    boxShadow: selectedLevel ? "0 4px 0 var(--brand-dark)" : "none",
                  }}
                >
                  {t("plantTrailBtn")}
                </button>
                <button
                  onClick={handlePlacementTest}
                  type="button"
                  className="flex-1 py-3.5 rounded-2xl cursor-pointer transition-all border-none font-extrabold text-sm text-white"
                  style={{
                    background: "var(--brand-sky)",
                    boxShadow: "0 4px 0 #0e7cb0",
                  }}
                >
                  {t("takeDiagnosticBtn")}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
