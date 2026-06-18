import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { AssessmentDetailDto } from "../services/assessmentService";

export default function AssessmentResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAppStore();
  
  const result = location.state?.result as AssessmentDetailDto;

  if (!result) {
    navigate("/dashboard");
    return null;
  }

  const SKILL_SCORES = [
    { skill: "Listening", score: Math.round(result.listeningScore || 0), level: result.resultLevel || "A1", color: "#1CB0F6" },
    { skill: "Reading", score: Math.round(result.readingScore || 0), level: result.resultLevel || "A1", color: "#8b5cf6" },
    { skill: "Writing", score: Math.round(result.writingScore || 0), level: result.resultLevel || "A1", color: "#f97316" },
    { skill: "Speaking", score: Math.round(result.speakingScore || 0), level: result.resultLevel || "A1", color: "var(--brand)" },
  ];

  const RECOMMENDED_LEVEL = result.resultLevel || "A1";

  const handlePlantTrail = () => {
    if (user) {
      setUser({
        ...user,
        cefr: RECOMMENDED_LEVEL,
      });
    }
    navigate("/dashboard");
  };

  const getLevelDescription = (level: string) => {
    switch (level) {
      case 'A1': return "Beginner — You're just starting your English journey!";
      case 'A2': return "Elementary — You can understand simple phrases and expressions.";
      case 'B1': return "Intermediate — You can handle everyday conversations and familiar topics.";
      case 'B2': return "Upper Intermediate — You can interact with a degree of fluency and spontaneity.";
      case 'C1': return "Advanced — You can express yourself fluently and spontaneously.";
      default: return "Diagnostic Level";
    }
  };

  return (
    <div className="overflow-y-auto h-full px-8 py-7 text-left" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div style={{ fontSize: 64, marginBottom: 12 }}>📊</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#3c3c3c", marginBottom: 8 }}>
            Your Diagnostic Results
          </h1>
          <p style={{ fontSize: 14.5, color: "#888", lineHeight: 1.7 }}>
            Based on your performance across all 4 sections, here's your English language profile.
          </p>
        </div>

        {/* CEFR recommendation banner */}
        <div
          className="rounded-3xl px-8 py-7 mb-8 text-center"
          style={{
            background: "linear-gradient(135deg, var(--brand-light) 0%, #d1fae5 100%)",
            border: "3px solid var(--brand-light)",
            boxShadow: "0 8px 32px rgba(88,204,2,0.15)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-dark)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
            Recommended Level
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: "var(--brand)", lineHeight: 1 }}>
            {RECOMMENDED_LEVEL}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--brand-dark)", marginTop: 8 }}>
            {getLevelDescription(RECOMMENDED_LEVEL)}
          </div>
          <p style={{ fontSize: 13.5, color: "#3c3c3c", marginTop: 8, lineHeight: 1.7 }}>
            Your overall score: {Math.round(result.overallScore || 0)}%
          </p>
        </div>

        {/* Skill breakdown */}
        <div className="rounded-3xl p-7 mb-6" style={{ background: "#fff", border: "2px solid rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 17, fontWeight: 900, color: "#3c3c3c", marginBottom: 20 }}>
            Skill Breakdown
          </h2>
          <div className="flex flex-col gap-5">
            {SKILL_SCORES.map(s => (
              <div key={s.skill}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#3c3c3c" }}>{s.skill}</span>
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{ background: s.color + "22", color: s.color, fontSize: 11, fontWeight: 700 }}
                    >
                      {s.level}
                    </span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.score}%</span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: 12, background: "#f3f4f6" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s.score}%`, background: `linear-gradient(90deg, ${s.color}88, ${s.color})`, transition: "width 1s ease" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handlePlantTrail}
          className="w-full py-5 rounded-2xl cursor-pointer border-none outline-none font-black text-white text-lg shadow-xl transition-all"
          style={{ background: "var(--brand)", boxShadow: "0 6px 0 var(--brand-dark)" }}
        >
          Generate My Learning Trail →
        </button>
      </div>
    </div>
  );
}
