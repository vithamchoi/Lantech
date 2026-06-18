import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { KeyRound, Mail, UserPlus, ArrowLeft, Loader2 } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import { authService } from "../services/authService";
import { toast } from "sonner";

export default function AuthEntrance() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAppStore();

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
        
        toast.success("Login successful!");
        
        // Use a small delay to ensure state is updated before navigation
        setTimeout(() => {
          if (role === "Admin") {
            navigate("/ranger");
          } else {
            navigate("/dashboard");
          }
        }, 100);
      } else {
        if (!name) {
          toast.error("Please enter your full name");
          return;
        }
        const data = await authService.register(email, password, name);
        login("Student", data.user, data.accessToken, data.refreshToken);
        
        toast.success("Account created successfully!");
        setTimeout(() => {
          navigate("/onboarding");
        }, 100);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const message = error.response?.data?.message || "Invalid email or password";
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
      
      toast.success("Google Login successful!");
      setTimeout(() => {
        navigate(role === 'Admin' ? "/ranger" : "/dashboard");
      }, 100);
    } catch (error: any) {
      console.error("Google Auth error:", error);
      toast.error("Google Login failed. Please try again.");
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
      
      toast.success(`Logged in as ${role}`);
      
      setTimeout(() => {
        navigate(role === 'Admin' ? "/ranger" : "/dashboard");
      }, 100);
    } catch (error: any) {
      console.error("Demo login error:", error);
      toast.error("Demo login failed. Make sure database is seeded.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between py-8 px-4 transition-colors duration-300"
      style={{
        background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)",
        fontFamily: "var(--font-family)",
      }}
    >
      {/* Header Back Button */}
      <div className="max-w-md w-full mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate dark:text-slate-400 dark:hover:text-cream-50 font-bold text-sm bg-transparent border-none cursor-pointer outline-none"
        >
          <ArrowLeft size={16} /> Back to Landing
        </button>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div
          className="rounded-3xl shadow-2xl overflow-hidden transition-all duration-300"
          style={{ background: "#ffffff", border: "2px solid rgba(0,0,0,0.06)" }}
        >
          {/* Tab Headers */}
          <div
            className="flex border-b"
            style={{
              borderColor: "rgba(0,0,0,0.06)",
              background: "#fafafa",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className="flex-1 py-4 text-sm font-bold tracking-wide transition-all border-none outline-none cursor-pointer"
              style={{
                background: activeTab === "login" ? "#ffffff" : "transparent",
                color: activeTab === "login" ? "var(--brand-dark)" : "#888",
                borderBottom: activeTab === "login" ? "3px solid var(--brand)" : "3px solid transparent",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className="flex-1 py-4 text-sm font-bold tracking-wide transition-all border-none outline-none cursor-pointer"
              style={{
                background: activeTab === "register" ? "#ffffff" : "transparent",
                color: activeTab === "register" ? "var(--brand-dark)" : "#888",
                borderBottom: activeTab === "register" ? "3px solid var(--brand)" : "3px solid transparent",
              }}
            >
              Create Account
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md mx-auto"
                style={{ background: "var(--brand)" }}
              >
                <span style={{ fontSize: 24 }}>🌿</span>
              </div>
              <h2
                className="text-2xl font-bold text-slate dark:text-cream-50"
                style={{ color: "#3c3c3c", fontWeight: 900 }}
              >
                Welcome to Lantech
              </h2>
              <p style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>
                {activeTab === "login"
                  ? "Sign in to pick up where you left off"
                  : "Begin your nature-paced learning path"}
              </p>
            </div>

            <div className="space-y-4 text-left">
              {activeTab === "register" && (
                <div className="space-y-1.5">
                  <label style={{ fontSize: 11.5, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Full Name
                  </label>
                  <div className="relative">
                    <UserPlus
                      size={18}
                      className="absolute left-4 top-3.5"
                      style={{ color: "#aaa" }}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 outline-none transition-all rounded-xl"
                      style={{
                        border: "2px solid rgba(0,0,0,0.06)",
                        background: "var(--input-background)",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#3c3c3c",
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label style={{ fontSize: 11.5, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-3.5"
                    style={{ color: "#aaa" }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 outline-none transition-all rounded-xl"
                    style={{
                      border: "2px solid rgba(0,0,0,0.06)",
                      background: "var(--input-background)",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#3c3c3c",
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label style={{ fontSize: 11.5, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Password
                </label>
                <div className="relative">
                  <KeyRound
                    size={18}
                    className="absolute left-4 top-3.5"
                    style={{ color: "#aaa" }}
                  />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 outline-none transition-all rounded-xl"
                    style={{
                      border: "2px solid rgba(0,0,0,0.06)",
                      background: "var(--input-background)",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#3c3c3c",
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl cursor-pointer transition-all border-none font-extrabold text-white text-base shadow-lg flex items-center justify-center gap-2"
              style={{
                background: "var(--brand)",
                boxShadow: "0 4px 0 var(--brand-dark)",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading && <Loader2 size={20} className="animate-spin" />}
              {activeTab === "login" ? "Sign In" : "Sign Up"}
            </button>

            {/* Google Login Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-slate-200" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
                <div className="h-[1px] flex-1 bg-slate-200" />
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={() => toast.error("Google Login Failed")}
                  useOneTap
                  theme="outline"
                  size="large"
                  shape="pill"
                  width="100%"
                />
              </div>
            </div>

            <div className="pt-2 text-center flex flex-col gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleDemoLogin('Student')}
                className="text-xs hover:underline font-bold bg-transparent border-none cursor-pointer"
                style={{ color: "var(--brand-dark)" }}
              >
                Demo Quick Student Login
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleDemoLogin('Admin')}
                className="text-xs hover:underline font-bold bg-transparent border-none cursor-pointer"
                style={{ color: "#ec4899" }}
              >
                Demo Quick Ranger (Admin) Login
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer copyright space */}
      <div style={{ fontSize: 12, color: "#888", textAlign: "center", fontWeight: 600 }}>
        © 2026 Lantech English. All rights reserved.
      </div>
    </div>
  );
}
