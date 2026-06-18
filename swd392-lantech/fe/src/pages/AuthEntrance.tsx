import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { KeyRound, Mail, UserPlus, ArrowLeft, Loader2, Sun, Moon } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import { authService } from "../services/authService";
import { toast } from "sonner";
import { useTranslation } from "../hooks/useTranslation";

export default function AuthEntrance() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, darkMode, toggleDarkMode } = useAppStore();
  const { t, language, setLanguage } = useTranslation();

  const initialMode = (location.state as any)?.mode || "login";
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      if (activeTab === "login") {
        const data = await authService.login(email, password);
        const role = data.user.role === "Admin" ? "Admin" : "Student";
        login(role, data.user, data.accessToken, data.refreshToken);
        
        toast.success(t("loginSuccess"));
        
        // Use a small delay to ensure state is updated before navigation
        setTimeout(() => {
          if (role === "Admin") {
            navigate("/ranger");
          } else {
            const hasCefr = data.user.currentCefrLevel && data.user.currentCefrLevel !== 'N/A';
            const isDemoStudent = data.user.email === 'user@lantech.local';
            if (hasCefr || isDemoStudent) {
              navigate("/dashboard");
            } else {
              navigate("/onboarding");
            }
          }
        }, 100);
      } else {
        if (!name) {
          toast.error(t("pleaseEnterName"));
          return;
        }
        const data = await authService.register(email, password, name, language);
        login("Student", data.user, data.accessToken, data.refreshToken);
        
        toast.success(t("registerSuccess"));
        setTimeout(() => {
          navigate("/onboarding");
        }, 100);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const message = error.response?.data?.message || t("invalidEmailOrPassword");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    
    setIsLoading(true);
    try {
      const data = await authService.googleLogin(credentialResponse.credential);
      const role = data.user.role === "Admin" ? "Admin" : "Student";
      login(role, data.user, data.accessToken, data.refreshToken);
      
      toast.success(t("loginSuccess"));
      setTimeout(() => {
        if (role === 'Admin') {
          navigate("/ranger");
        } else {
          const hasCefr = data.user.currentCefrLevel && data.user.currentCefrLevel !== 'N/A';
          const isDemoStudent = data.user.email === 'user@lantech.local';
          if (hasCefr || isDemoStudent) {
            navigate("/dashboard");
          } else {
            navigate("/onboarding");
          }
        }
      }, 100);
    } catch (error: any) {
      console.error("Google Auth error:", error);
      toast.error(t("googleLoginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (type: 'Student' | 'Admin') => {
    const demoEmail = type === 'Student' ? 'user@lantech.local' : 'admin@lantech.local';
    const demoPassword = type === 'Student' ? 'User@123456' : 'Admin@123456';
    
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    setIsLoading(true);
    try {
      const data = await authService.login(demoEmail, demoPassword);
      const role = data.user.role === "Admin" ? "Admin" : "Student";
      login(role, data.user, data.accessToken, data.refreshToken);
      
      toast.success(`${t("loginSuccess")} (${role})`);
      
      setTimeout(() => {
        if (role === 'Admin') {
          navigate("/ranger");
        } else {
          const hasCefr = data.user.currentCefrLevel && data.user.currentCefrLevel !== 'N/A';
          const isDemoStudent = data.user.email === 'user@lantech.local';
          if (hasCefr || isDemoStudent) {
            navigate("/dashboard");
          } else {
            navigate("/onboarding");
          }
        }
      }, 100);
    } catch (error: any) {
      console.error("Demo login error:", error);
      toast.error(t("demoLoginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between py-4 sm:py-6 px-4 md:px-8 overflow-y-auto transition-colors duration-300"
      style={{
        background: "var(--background)",
        fontFamily: "var(--font-family)",
      }}
    >
      {/* Top Bar / Header */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between gap-4 flex-wrap shrink-0">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate dark:text-slate-400 dark:hover:text-cream-50 font-bold text-sm bg-transparent border-none cursor-pointer outline-none transition-colors"
        >
          <ArrowLeft size={16} /> {t("backToLanding")}
        </button>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Native Language Toggle */}
          <div className="flex items-center bg-neutral-200/50 dark:bg-neutral-800/50 p-1 rounded-xl border border-neutral-300/20">
            {(['vi', 'ja', 'ko'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
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

          {/* Dark Mode Selector */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-neutral-200/50 dark:bg-neutral-800/50 text-slate-600 dark:text-slate-300 hover:text-slate dark:hover:text-white transition-colors border-none cursor-pointer"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[380px] mx-auto my-4 sm:my-auto py-2">
        <div
          className="rounded-3xl shadow-2xl overflow-hidden transition-all duration-300"
          style={{ background: "var(--card)", border: "2px solid var(--border)" }}
        >
          {/* Tab Headers */}
          <div
            className="flex border-b"
            style={{
              borderColor: "var(--border)",
              background: darkMode ? "rgba(255,255,255,0.03)" : "#fafafa",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className="flex-1 py-3 text-sm font-bold tracking-wide transition-all border-none outline-none cursor-pointer"
              style={{
                background: activeTab === "login" ? "var(--card)" : "transparent",
                color: activeTab === "login" ? (darkMode ? "var(--brand)" : "var(--brand-dark)") : "var(--muted-foreground)",
                borderBottom: activeTab === "login" ? "3px solid var(--brand)" : "3px solid transparent",
              }}
            >
              {t("signIn")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className="flex-1 py-3 text-sm font-bold tracking-wide transition-all border-none outline-none cursor-pointer"
              style={{
                background: activeTab === "register" ? "var(--card)" : "transparent",
                color: activeTab === "register" ? (darkMode ? "var(--brand)" : "var(--brand-dark)") : "var(--muted-foreground)",
                borderBottom: activeTab === "register" ? "3px solid var(--brand)" : "3px solid transparent",
              }}
            >
              {t("createAccount")}
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3.5">
            <div className="text-center space-y-1">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md mx-auto mb-1.5"
                style={{ background: "var(--brand)" }}
              >
                <span style={{ fontSize: 20 }}>🌿</span>
              </div>
              <h2
                className="text-xl md:text-2xl font-bold text-slate dark:text-cream-50"
                style={{ color: "var(--foreground)", fontWeight: 900 }}
              >
                {t("welcomeTitle")}
              </h2>
              <p style={{ fontSize: 13, color: "var(--muted-foreground)", fontWeight: 500 }}>
                {activeTab === "login"
                  ? t("signInSubtitle")
                  : t("signUpSubtitle")}
              </p>
            </div>

            <div className="space-y-3.5 text-left">
              {activeTab === "register" && (
                <div className="space-y-1">
                  <label style={{ fontSize: 11, fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {t("fullNameLabel")}
                  </label>
                  <div className="relative">
                    <UserPlus
                      size={18}
                      className="absolute left-4 top-3"
                      style={{ color: "#aaa" }}
                    />
                    <input
                      type="text"
                      required
                      placeholder={t("fullNamePlaceholder")}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 outline-none transition-all rounded-xl"
                      style={{
                        border: "2px solid var(--border)",
                        background: "var(--input-background)",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--foreground)",
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {t("emailLabel")}
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-3"
                    style={{ color: "#aaa" }}
                  />
                  <input
                    type="email"
                    required
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 outline-none transition-all rounded-xl"
                    style={{
                      border: "2px solid var(--border)",
                      background: "var(--input-background)",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--foreground)",
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label style={{ fontSize: 11, fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {t("passwordLabel")}
                </label>
                <div className="relative">
                  <KeyRound
                    size={18}
                    className="absolute left-4 top-3"
                    style={{ color: "#aaa" }}
                  />
                  <input
                    type="password"
                    required
                    placeholder={t("passwordPlaceholder")}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 outline-none transition-all rounded-xl"
                    style={{
                      border: "2px solid var(--border)",
                      background: "var(--input-background)",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--foreground)",
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl cursor-pointer transition-all border-none font-extrabold text-white text-base shadow-lg flex items-center justify-center gap-2"
              style={{
                background: "var(--brand)",
                boxShadow: "0 4px 0 var(--brand-dark)",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading && <Loader2 size={20} className="animate-spin" />}
              {activeTab === "login" ? t("signIn") : t("createAccount")}
            </button>

            {/* Google Login Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-neutral-800" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">{t("orContinueWith")}</span>
                <div className="h-[1px] flex-1 bg-slate-200 dark:bg-neutral-800" />
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={() => toast.error("Google Login Failed")}
                  useOneTap
                  theme={darkMode ? "filled_black" : "outline"}
                  size="large"
                  shape="pill"
                  width="100%"
                />
              </div>
            </div>

            <div className="pt-2 text-center flex flex-col gap-1.5">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleDemoLogin('Student')}
                className="text-xs hover:underline font-bold bg-transparent border-none cursor-pointer"
                style={{ color: "var(--brand-dark)" }}
              >
                {t("demoStudent")}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleDemoLogin('Admin')}
                className="text-xs hover:underline font-bold bg-transparent border-none cursor-pointer"
                style={{ color: "#ec4899" }}
              >
                {t("demoAdmin")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer copyright space */}
      <div style={{ fontSize: 12, color: "var(--muted-foreground)", textAlign: "center", fontWeight: 600 }}>
        {t("rightsReserved")}
      </div>
    </div>
  );
}
