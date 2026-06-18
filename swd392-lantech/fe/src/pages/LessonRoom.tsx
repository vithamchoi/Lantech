import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useTranslation } from "../hooks/useTranslation";

const SLIDES = [
  {
    type: "rule" as const,
    title: "Daily Routines — Present Continuous",
    content: "We use the Present Continuous to talk about actions happening **right now** or around the current time period.",
    examples: [
      "She **is studying** English every morning.",
      "They **are working** on a new project this week.",
    ],
    structure: "Subject + am/is/are + Verb-ing",
    emoji: "⏰",
  },
  {
    type: "rule" as const,
    title: "Forming Present Continuous",
    content: "Add **-ing** to the base verb. Watch for spelling changes with some verbs!",
    examples: [
      "run → runn**ing**",
      "write → writ**ing** (drop the silent -e)",
      "swim → swimm**ing** (double the consonant)",
    ],
    structure: "Base verb + -ing",
    emoji: "📝",
  },
  {
    type: "exercise" as const,
    title: "Short Answer",
    question: "Complete the sentence: \"Right now, she _____ (read) her favorite book.\"",
    answer: "is reading",
    emoji: "✏️",
  },
  {
    type: "matching" as const,
    title: "Match the Sentences",
    pairs: [
      { left: "He _____ (cook) dinner right now.", right: "is cooking" },
      { left: "We _____ (learn) English.", right: "are learning" },
      { left: "I _____ (not watch) TV.", right: "am not watching" },
    ],
    emoji: "🔗",
  },
];

export default function LessonRoom() {
  const navigate = useNavigate();
  const { user, setUser } = useAppStore();
  const { t } = useTranslation();
  const [slideIndex, setSlideIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [matchAnswers, setMatchAnswers] = useState<Record<number, string>>({});
  const [completed, setCompleted] = useState(false);

  const slide = SLIDES[slideIndex];
  const progress = ((slideIndex + 1) / SLIDES.length) * 100;

  const handleSubmit = () => {
    if (slide.type === "exercise") {
      const correct = answer.trim().toLowerCase() === slide.answer.toLowerCase();
      setIsCorrect(correct);
      setSubmitted(true);
    }
  };

  const handleNext = () => {
    if (slideIndex < SLIDES.length - 1) {
      setSlideIndex(i => i + 1);
      setAnswer("");
      setSubmitted(false);
    } else {
      // Award XP to user in store
      if (user) {
        setUser({
          ...user,
          xp: user.xp + 80,
        });
      }
      setCompleted(true);
    }
  };

  if (completed) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center text-center" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
        <div className="text-center max-w-md">
          <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
          <div
            className="inline-block px-6 py-2 rounded-full mb-4"
            style={{ background: "var(--brand-gold-light)", color: "#92400e", fontWeight: 800, fontSize: 16 }}
          >
            {t("xpEarned", { xp: "80" })}
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#3c3c3c", marginBottom: 10 }}>
            {t("lessonCompleteTitle")}
          </h2>
          <p style={{ fontSize: 15, color: "#888", lineHeight: 1.7, marginBottom: 32 }}>
            {t("lessonCompleteDesc")}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              type="button"
              className="px-8 py-3.5 rounded-2xl cursor-pointer border-none outline-none font-bold text-white shadow-md transition-all"
              style={{ background: "var(--brand)", boxShadow: "0 4px 0 var(--brand-dark)" }}
            >
              {t("backToTrail")}
            </button>
            <button
              onClick={() => { setSlideIndex(0); setCompleted(false); setAnswer(""); setSubmitted(false); }}
              type="button"
              className="px-6 py-3.5 rounded-2xl cursor-pointer transition-all border"
              style={{ background: "#fff", borderColor: "rgba(0,0,0,0.1)", color: "#3c3c3c", fontWeight: 700 }}
            >
              {t("reviewAgain")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-screen text-left" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ background: "#fff", borderColor: "rgba(0,0,0,0.08)" }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          type="button"
          className="flex items-center gap-1 cursor-pointer border-none outline-none bg-transparent"
          style={{ color: "#888", fontWeight: 700, fontSize: 13.5 }}
        >
          <ChevronLeft size={16} /> {t("exitLesson")}
        </button>
        <div
          className="px-3 py-1.5 rounded-full"
          style={{ background: "var(--brand-light)", color: "var(--brand-dark)", fontWeight: 700, fontSize: 13 }}
        >
          ⏰ Daily Routines
        </div>
        <div style={{ fontSize: 13, color: "#aaa", fontWeight: 600 }}>
          {slideIndex + 1} / {SLIDES.length}
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 6, background: "#e5e7eb" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "var(--brand)", transition: "width 0.4s ease" }} />
      </div>

      {/* Slide content */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center px-6 py-8">
        <div className="w-full max-w-xl">
          {/* Rule slides */}
          {slide.type === "rule" && (
            <div
              className="rounded-3xl p-8"
              style={{ background: "#fff", border: "2px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
            >
              <div className="text-center mb-6">
                <div style={{ fontSize: 52, marginBottom: 10 }}>{slide.emoji}</div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#3c3c3c" }}>{slide.title}</h2>
              </div>
              <p
                className="rounded-2xl px-5 py-4 mb-6"
                style={{ background: "#f7f7f7", fontSize: 15, color: "#3c3c3c", lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{
                  __html: slide.content.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--brand)">$1</strong>'),
                }}
              />

              {slide.structure && (
                <div
                  className="rounded-2xl px-5 py-4 mb-6 text-center"
                  style={{ background: "var(--brand-light)", border: "2px solid var(--brand)" }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-dark)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                    {t("structureLabel")}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--brand-dark)" }}>{slide.structure}</div>
                </div>
              )}

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{t("examplesLabel")}</div>
                <div className="flex flex-col gap-2">
                  {slide.examples?.map((ex, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 rounded-xl"
                      style={{ background: "#f0fdf4", fontSize: 14.5, color: "#3c3c3c", fontStyle: "italic", lineHeight: 1.6 }}
                      dangerouslySetInnerHTML={{
                        __html: ex.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--brand)">$1</strong>'),
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Exercise slide */}
          {slide.type === "exercise" && (
            <div
              className="rounded-3xl p-8"
              style={{ background: "#fff", border: "2px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
            >
              <div className="text-center mb-6">
                <div style={{ fontSize: 52, marginBottom: 10 }}>{slide.emoji}</div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#3c3c3c", marginBottom: 6 }}>{slide.title}</h2>
                <p style={{ fontSize: 13.5, color: "#888" }}>{t("typeAnswerDesc")}</p>
              </div>
              <div
                className="rounded-2xl px-5 py-4 mb-6"
                style={{ background: "#eff6ff", border: "2px solid #bfdbfe" }}
              >
                <p style={{ fontSize: 16, color: "#1e40af", fontWeight: 600, lineHeight: 1.7 }}>{slide.question}</p>
              </div>

              <input
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                disabled={submitted}
                placeholder={t("typeAnswerPlaceholder")}
                className="w-full px-5 py-3.5 rounded-2xl outline-none mb-4"
                style={{
                  border: submitted
                    ? `2px solid ${isCorrect ? "var(--brand)" : "#FF4B4B"}`
                    : "2px solid #e5e7eb",
                  fontSize: 15,
                  fontFamily: "var(--font-family)",
                  background: submitted ? (isCorrect ? "var(--brand-light)" : "#fee2e2") : "#fafafa",
                }}
              />

              {submitted && (
                <div
                  className="rounded-2xl px-5 py-4 flex items-start gap-3 mb-4 text-left"
                  style={{
                    background: isCorrect ? "var(--brand-light)" : "#fee2e2",
                    border: `2px solid ${isCorrect ? "var(--brand)" : "#fca5a5"}`,
                  }}
                >
                  {isCorrect ? (
                    <CheckCircle size={20} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 2 }} />
                  ) : (
                    <XCircle size={20} style={{ color: "#dc2626", flexShrink: 0, marginTop: 2 }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: isCorrect ? "var(--brand-dark)" : "#dc2626" }}>
                      {isCorrect ? t("excellentLabel") : t("notQuiteLabel")}
                    </div>
                    {!isCorrect && (
                      <div style={{ fontSize: 13.5, color: "#991b1b", marginTop: 4 }}>
                        {t("correctAnswerWas")} <strong>{slide.answer}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim()}
                  type="button"
                  className="w-full py-3.5 rounded-2xl cursor-pointer border-none outline-none font-bold text-white transition-all"
                  style={{
                    background: answer.trim() ? "var(--brand)" : "#e5e7eb",
                  }}
                >
                  {t("checkAnswer")}
                </button>
              ) : (
                <button onClick={handleNext} type="button" className="w-full py-3.5 rounded-2xl cursor-pointer border-none outline-none text-white font-bold" style={{ background: "var(--brand)" }}>
                  {t("continueLabel")}
                </button>
              )}
            </div>
          )}

          {/* Matching slide */}
          {slide.type === "matching" && (
            <div
              className="rounded-3xl p-8"
              style={{ background: "#fff", border: "2px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
            >
              <div className="text-center mb-6">
                <div style={{ fontSize: 52, marginBottom: 10 }}>{slide.emoji}</div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#3c3c3c" }}>{slide.title}</h2>
              </div>
              <div className="flex flex-col gap-3 mb-6">
                {slide.pairs?.map((pair, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="flex-1 px-4 py-3 rounded-xl"
                      style={{ background: "#f7f7f7", fontSize: 14, color: "#3c3c3c", lineHeight: 1.6 }}
                    >
                      {pair.left}
                    </div>
                    <span style={{ color: "#aaa" }}>→</span>
                    <button
                      onClick={() => setMatchAnswers(prev => ({ ...prev, [i]: pair.right }))}
                      type="button"
                      className="px-4 py-3 rounded-xl cursor-pointer transition-all border-none outline-none"
                      style={{
                        background: matchAnswers[i] ? "var(--brand-light)" : "#eff6ff",
                        border: `2px solid ${matchAnswers[i] ? "var(--brand)" : "#bfdbfe"}`,
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: matchAnswers[i] ? "var(--brand-dark)" : "#1d4ed8",
                        minWidth: 140,
                      }}
                    >
                      {matchAnswers[i] || pair.right}
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={handleNext} type="button" className="w-full py-3.5 rounded-2xl cursor-pointer border-none outline-none text-white font-bold" style={{ background: "var(--brand)" }}>
                {t("continueLabel")}
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => { setSlideIndex(Math.max(0, slideIndex - 1)); setSubmitted(false); setAnswer(""); }}
              disabled={slideIndex === 0}
              type="button"
              className="flex items-center gap-1 px-4 py-2 rounded-xl cursor-pointer border-none outline-none"
              style={{
                background: slideIndex === 0 ? "transparent" : "#f3f4f6",
                color: slideIndex === 0 ? "#ccc" : "#888",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <ChevronLeft size={15} /> {t("previousLabel")}
            </button>

            <div className="flex gap-1.5">
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: slideIndex === i ? 20 : 8,
                    height: 8,
                    background: i < slideIndex ? "var(--brand)" : slideIndex === i ? "var(--brand)" : "#e5e7eb",
                  }}
                />
              ))}
            </div>

            {slide.type === "rule" ? (
              <button
                onClick={handleNext}
                type="button"
                className="flex items-center gap-1 px-4 py-2 rounded-xl cursor-pointer border-none outline-none text-white font-bold"
                style={{ background: "var(--brand)" }}
              >
                {t("nextLabel")} <ChevronRight size={15} />
              </button>
            ) : (
              <div style={{ width: 90 }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
