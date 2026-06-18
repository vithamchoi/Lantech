import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { onboardingService, OnboardingOptionsDto } from "../services/onboardingService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { user, login } = useAppStore();
  const [step, setStep] = useState(1);
  const [options, setOptions] = useState<OnboardingOptionsDto | null>(null);
  const [nativeLanguage, setNativeLanguage] = useState("vi");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await onboardingService.getOptions();
        setOptions(data);
      } catch (error) {
        toast.error("Failed to load onboarding options");
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  if (!user) return null;

  const languages = [
    { code: "vi", name: "Vietnamese" },
    { code: "en", name: "English" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
  ];

  const handleStep2 = () => {
    if (!nativeLanguage) return;
    setStep(2);
  };

  const handleSelfSelect = async () => {
    if (!selectedLevel) return;
    setGenerating(true);
    try {
      const result = await onboardingService.selfSelectLevel({
        nativeLanguageCode: nativeLanguage,
        targetLevel: selectedLevel
      });
      
      // Update local state if needed, but navigate to dashboard
      // The dashboard will fetch the new learning path
      toast.success("Learning trail planted!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to initialize your profile");
    } finally {
      setGenerating(false);
    }
  };

  const handlePlacementTest = () => {
    navigate("/assessment");
  };

  if (isLoadingOptions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} color="var(--brand)" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)", fontFamily: "var(--font-family)" }}
    >
      {generating ? (
        <div className="text-center">
          <div style={{ fontSize: 96, marginBottom: 24 }}>🐣</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#3c3c3c", marginBottom: 12 }}>
            Growing your learning orchard...
          </div>
          <div style={{ fontSize: 15, color: "#888", marginBottom: 32 }}>
            We're planting your personalized study trail!
          </div>
          <div className="flex gap-2 justify-center">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-3 h-3 rounded-full animate-bounce"
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
          className="w-full max-w-lg rounded-3xl p-10 shadow-2xl transition-all duration-300"
          style={{ background: "#ffffff", border: "2px solid rgba(0,0,0,0.06)" }}
        >
          {/* Progress dots */}
          <div className="flex gap-2 justify-center mb-8">
            {[1, 2].map(s => (
              <div
                key={s}
                className="rounded-full transition-all"
                style={{
                  width: step === s ? 32 : 10,
                  height: 10,
                  background: step >= s ? "var(--brand)" : "#e5e7eb",
                }}
              />
            ))}
          </div>

          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div style={{ fontSize: 56, marginBottom: 12 }}>👋</div>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: "#3c3c3c", marginBottom: 8 }}>
                  Welcome, {user.name.split(" ")[0]}!
                </h1>
                <p style={{ fontSize: 14.5, color: "#888", lineHeight: 1.7 }}>
                  Let's set up your personal English learning trail. First, what's your native language?
                </p>
              </div>

              <div className="mb-6 text-left">
                <label style={{ fontSize: 13, fontWeight: 700, color: "#3c3c3c", display: "block", marginBottom: 8 }}>
                  Your native language
                </label>
                <select
                  value={nativeLanguage}
                  onChange={e => setNativeLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none cursor-pointer"
                  style={{
                    border: "2px solid var(--brand-light)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#3c3c3c",
                    background: "#fafafa",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  {languages.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-8 text-left">
                <label style={{ fontSize: 13, fontWeight: 700, color: "#3c3c3c", display: "block", marginBottom: 4 }}>
                  Your English goal level
                </label>
                <p style={{ fontSize: 12.5, color: "#aaa", marginBottom: 12 }}>How fluent do you want to become?</p>
                <div className="flex gap-2 flex-wrap">
                  {options?.supportedLevels.slice(-3).map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      type="button"
                      className="px-4 py-2 rounded-full cursor-pointer transition-all border-none outline-none"
                      style={{
                        border: `2px solid ${selectedLevel === level ? "var(--brand)" : "#e5e7eb"}`,
                        background: selectedLevel === level ? "var(--brand)" : "#fff",
                        color: selectedLevel === level ? "#fff" : "#3c3c3c",
                        fontWeight: 700,
                        fontSize: 13.5,
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStep2}
                className="w-full py-4 rounded-2xl cursor-pointer transition-all border-none text-white font-extrabold text-base shadow-md"
                style={{
                  background: "var(--brand)",
                  boxShadow: "0 4px 0 var(--brand-dark)",
                }}
              >
                Continue →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <div style={{ fontSize: 56, marginBottom: 12 }}>🎯</div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: "#3c3c3c", marginBottom: 8 }}>
                  How do you know your level?
                </h1>
                <p style={{ fontSize: 14.5, color: "#888", lineHeight: 1.7 }}>
                  Self-select your current English level, or take a quick diagnostic test so we can build the perfect trail for you.
                </p>
              </div>

              <div className="flex flex-col gap-3 mb-6 text-left">
                {options?.supportedLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    type="button"
                    className="flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all text-left outline-none"
                    style={{
                      border: `2px solid ${selectedLevel === level ? "var(--brand)" : "#e5e7eb"}`,
                      background: selectedLevel === level ? "var(--brand-light)" : "#fff",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: selectedLevel === level ? "var(--brand)" : "#f3f4f6",
                        color: selectedLevel === level ? "#fff" : "#9ca3af",
                        fontWeight: 900,
                        fontSize: 16,
                      }}
                    >
                      {level}
                    </div>
                    <div className="flex-1">
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#3c3c3c" }}>
                        Level {level}
                      </div>
                      <div style={{ fontSize: 12.5, color: "#888", marginTop: 2 }}>
                        Standard CEFR {level} proficiency
                      </div>
                    </div>
                    {selectedLevel === level && (
                      <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-white">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                          <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSelfSelect}
                  disabled={!selectedLevel}
                  type="button"
                  className="flex-1 py-3.5 rounded-2xl cursor-pointer transition-all border-none font-bold text-sm"
                  style={{
                    background: selectedLevel ? "var(--brand)" : "#e5e7eb",
                    color: selectedLevel ? "#fff" : "#aaa",
                    boxShadow: selectedLevel ? "0 4px 0 var(--brand-dark)" : "none",
                    cursor: selectedLevel ? "pointer" : "not-allowed",
                  }}
                >
                  Plant My Trail ✓
                </button>
                <button
                  onClick={handlePlacementTest}
                  type="button"
                  className="flex-1 py-3.5 rounded-2xl cursor-pointer transition-all border-none font-bold text-sm text-white"
                  style={{
                    background: "#1CB0F6",
                    boxShadow: "0 4px 0 #0e7cb0",
                  }}
                >
                  Take Diagnostic Test
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
