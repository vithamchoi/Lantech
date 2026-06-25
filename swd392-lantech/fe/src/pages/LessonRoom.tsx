import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useTranslation } from "../hooks/useTranslation";
import { learningService, LessonDto } from "../services/learningService";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

const CHAPTER1_SLIDES = [
  {
    type: "rule" as const,
    title: "Daily Communications — Greetings",
    content: "When greeting people in English, we use formal or informal greetings depending on the relationship.",
    examples: [
      "Formal: **Hello**, **Good morning/afternoon/evening**.",
      "Informal: **Hi**, **Hey**, **What's up?**.",
    ],
    structure: "Greeting phrase + Name / Status",
    emoji: "👋",
  },
  {
    type: "rule" as const,
    title: "Introducing Yourself",
    content: "To introduce yourself, state your name, where you are from, and what you do.",
    examples: [
      "\"Hello, **my name is** Nguyen.\"",
      "\"I am **from** Vietnam.\"",
      "\"I **am studying** English to improve my career.\"",
    ],
    structure: "My name is... + I am from... + I am...",
    emoji: "💬",
  },
  {
    type: "exercise" as const,
    title: "Short Answer",
    question: "Complete the self-introduction: \"Hello! My _____ is Nguyen, and I am learning English.\"",
    answer: "name",
    emoji: "✏️",
  },
  {
    type: "matching" as const,
    title: "Match the Greetings",
    pairs: [
      { left: "Good morning", right: "Formal greeting" },
      { left: "What's up?", right: "Informal greeting" },
      { left: "Nice to meet you", right: "After introducing" },
    ],
    emoji: "🔗",
  },
];

const CHAPTER2_SLIDES = [
  {
    type: "rule" as const,
    title: "Hobbies and Leisure — Likes & Dislikes",
    content: "We use verbs like **like**, **enjoy**, **love**, and **prefer** followed by a gerund (verb + -ing) or an infinitive (to + verb) to talk about hobbies.",
    examples: [
      "I **enjoy reading** books on weekends.",
      "She **likes to play** soccer with her friends.",
      "We **prefer hiking** in the mountains.",
    ],
    structure: "Subject + enjoy/like/prefer + Verb-ing / to-Verb",
    emoji: "⚽",
  },
  {
    type: "rule" as const,
    title: "Vocabulary for Free Time Activities",
    content: "Common hobbies include outdoor and indoor activities.",
    examples: [
      "Outdoor: **hiking**, **cycling**, **playing sports**.",
      "Indoor: **reading**, **cooking**, **listening to music**.",
    ],
    structure: "Common activities: play / read / do / watch",
    emoji: "🎨",
  },
  {
    type: "exercise" as const,
    title: "Short Answer",
    question: "Complete the sentence: \"I prefer (do) _____ outdoor activities like hiking on weekends.\"",
    answer: "doing",
    emoji: "✏️",
  },
  {
    type: "matching" as const,
    title: "Match the Hobbies with Verbs",
    pairs: [
      { left: "_____ books", right: "read" },
      { left: "_____ soccer", right: "play" },
      { left: "_____ healthy meals", right: "cook" },
    ],
    emoji: "🔗",
  },
];

const CHAPTER3_SLIDES = [
  {
    type: "rule" as const,
    title: "Travel and Exploration — Asking for Directions",
    content: "When traveling, we often ask polite questions to find our way around.",
    examples: [
      "\"Could you please tell me how to get to the nearest train station?\"",
      "\"Excuse me, where is the main lobby?\"",
    ],
    structure: "Could you please tell me + how to get to + Location?",
    emoji: "✈️",
  },
  {
    type: "rule" as const,
    title: "Past Actions in Travel",
    content: "We use the **Past Simple** for completed actions in the past, and the **Past Perfect** for actions completed *before* another action in the past.",
    examples: [
      "\"Last year, when we **visited** London, we **decided** to stay in a hotel.\"",
      "\"We **had already booked** our tickets before leaving.\"",
    ],
    structure: "Past Simple (visited, decided) vs Past Perfect (had booked)",
    emoji: "🗺️",
  },
  {
    type: "exercise" as const,
    title: "Short Answer",
    question: "Complete the travel sentence: \"We (book) _____ already our tickets before we left.\"",
    answer: "had booked",
    emoji: "✏️",
  },
  {
    type: "matching" as const,
    title: "Match Verb Forms",
    pairs: [
      { left: "Last year, we (visit) London.", right: "visited" },
      { left: "We (already book) before leaving.", right: "had already booked" },
      { left: "We (decide) to stay in a hotel.", right: "decided" },
    ],
    emoji: "🔗",
  },
];

const DEFAULT_SLIDES = [
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
  const { id } = useParams();
  const { user, setUser, darkMode } = useAppStore();
  const { t } = useTranslation();
  const [slideIndex, setSlideIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [matchAnswers, setMatchAnswers] = useState<Record<number, string>>({});
  const [completed, setCompleted] = useState(false);
  const [lesson, setLesson] = useState<LessonDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!id) return;
      try {
        const data = await learningService.getLessonById(id);
        setLesson(data);
      } catch (error) {
        console.error("Failed to load lesson", error);
        toast.error("Không thể tải thông tin bài học.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  let activeSlides = DEFAULT_SLIDES;
  if (lesson) {
    if (lesson.title.toLowerCase().includes("chương 1")) {
      activeSlides = CHAPTER1_SLIDES;
    } else if (lesson.title.toLowerCase().includes("chương 2")) {
      activeSlides = CHAPTER2_SLIDES;
    } else if (lesson.title.toLowerCase().includes("chương 3")) {
      activeSlides = CHAPTER3_SLIDES;
    }
  }

  const slide = activeSlides[slideIndex];
  const progress = ((slideIndex + 1) / activeSlides.length) * 100;

  const handleSubmit = () => {
    if (slide.type === "exercise") {
      const correct = answer.trim().toLowerCase() === slide.answer.toLowerCase();
      setIsCorrect(correct);
      setSubmitted(true);
    }
  };

  const handleNext = () => {
    if (slideIndex < activeSlides.length - 1) {
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
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 }
      });
      setCompleted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-brand" size={48} />
      </div>
    );
  }

  if (completed) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center text-center px-4" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-center max-w-md"
        >
          <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
          <div
            className="inline-block px-6 py-2 rounded-full mb-4 shadow-sm"
            style={{ background: "var(--brand-gold-light)", color: "#92400e", fontWeight: 800, fontSize: 16 }}
          >
            {t("xpEarned", { xp: "80" })}
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "var(--foreground)", marginBottom: 10 }}>
            {t("lessonCompleteTitle")}
          </h2>
          <p style={{ fontSize: 15, color: "var(--muted-foreground)", lineHeight: 1.7, marginBottom: 32 }}>
            {t("lessonCompleteDesc")}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                if (id) {
                  navigate(`/exercise/${id}`);
                } else {
                  navigate("/dashboard");
                }
              }}
              type="button"
              className="px-8 py-3.5 rounded-2xl cursor-pointer border-none outline-none font-bold text-white btn-3d"
              style={{ background: "var(--brand)" }}
            >
              {id ? (t("startPractice") || "Bắt đầu luyện tập") : t("backToTrail")}
            </button>
            <button
              onClick={() => { setSlideIndex(0); setCompleted(false); setAnswer(""); setSubmitted(false); }}
              type="button"
              className="px-6 py-3.5 rounded-2xl cursor-pointer transition-all border btn-3d-secondary bg-white text-slate-800 font-bold"
            >
              {t("reviewAgain")}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-screen text-left" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          type="button"
          className="flex items-center gap-1 cursor-pointer border-none outline-none bg-transparent"
          style={{ color: "var(--muted-foreground)", fontWeight: 700, fontSize: 13.5 }}
        >
          <ChevronLeft size={16} /> {t("exitLesson")}
        </button>
        <div
          className="px-3 py-1.5 rounded-full"
          style={{ background: "var(--brand-light)", color: "var(--brand-dark)", fontWeight: 700, fontSize: 13 }}
        >
          {lesson ? lesson.title : "Daily Routines"}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600 }}>
          {slideIndex + 1} / {activeSlides.length}
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 6, background: "var(--muted)" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "var(--brand)", transition: "width 0.4s ease" }} />
      </div>

      {/* Slide content */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="w-full max-w-xl"
          >
            {/* Rule slides */}
            {slide.type === "rule" && (
              <div
                className="rounded-3xl p-8"
                style={{ background: "var(--card)", border: "2px solid var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
              >
                <div className="text-center mb-6">
                  <div style={{ fontSize: 52, marginBottom: 10 }}>{slide.emoji}</div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--foreground)" }}>{slide.title}</h2>
                </div>
                <p
                  className="rounded-2xl px-5 py-4 mb-6"
                  style={{ background: "var(--input-background)", fontSize: 15, color: "var(--foreground)", lineHeight: 1.8 }}
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
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{t("examplesLabel")}</div>
                  <div className="flex flex-col gap-2">
                    {slide.examples?.map((ex, i) => (
                      <div
                        key={i}
                        className="px-4 py-3 rounded-xl"
                        style={{ background: "var(--input-background)", fontSize: 14.5, color: "var(--foreground)", fontStyle: "italic", lineHeight: 1.6 }}
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
                style={{ background: "var(--card)", border: "2px solid var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
              >
                <div className="text-center mb-6">
                  <div style={{ fontSize: 52, marginBottom: 10 }}>{slide.emoji}</div>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--foreground)", marginBottom: 6 }}>{slide.title}</h2>
                  <p style={{ fontSize: 13.5, color: "var(--muted-foreground)" }}>{t("typeAnswerDesc")}</p>
                </div>
                <div
                  className="rounded-2xl px-5 py-4 mb-6"
                  style={{ background: darkMode ? "rgba(59,130,246,0.15)" : "#eff6ff", border: `2px solid ${darkMode ? "#2563eb" : "#bfdbfe"}` }}
                >
                  <p style={{ fontSize: 16, color: darkMode ? "#93c5fd" : "#1e40af", fontWeight: 600, lineHeight: 1.7 }}>{slide.question}</p>
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
                      : "2px solid var(--border)",
                    fontSize: 15,
                    fontFamily: "var(--font-family)",
                    background: submitted ? (isCorrect ? "var(--brand-light)" : "#fee2e2") : "var(--input-background)",
                    color: "var(--foreground)",
                  }}
                />

                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
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
                  </motion.div>
                )}

                {!submitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!answer.trim()}
                    type="button"
                    className="w-full py-3.5 rounded-2xl cursor-pointer border-none outline-none font-bold text-white transition-all btn-3d"
                    style={{
                      background: answer.trim() ? "var(--brand)" : "var(--switch-background)",
                      boxShadow: answer.trim() ? "0 4px 0 var(--brand-dark)" : "none",
                    }}
                  >
                    {t("checkAnswer")}
                  </button>
                ) : (
                  <button onClick={handleNext} type="button" className="w-full py-3.5 rounded-2xl cursor-pointer border-none outline-none text-white font-bold btn-3d" style={{ background: "var(--brand)" }}>
                    {t("continueLabel")}
                  </button>
                )}
              </div>
            )}

            {/* Matching slide */}
            {slide.type === "matching" && (
              <div
                className="rounded-3xl p-8"
                style={{ background: "var(--card)", border: "2px solid var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
              >
                <div className="text-center mb-6">
                  <div style={{ fontSize: 52, marginBottom: 10 }}>{slide.emoji}</div>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--foreground)" }}>{slide.title}</h2>
                </div>
                <div className="flex flex-col gap-3 mb-6">
                  {slide.pairs?.map((pair, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="flex-1 px-4 py-3 rounded-xl"
                        style={{ background: "var(--input-background)", fontSize: 14, color: "var(--foreground)", lineHeight: 1.6 }}
                      >
                        {pair.left}
                      </div>
                      <span style={{ color: "var(--muted-foreground)" }}>→</span>
                      <button
                        onClick={() => setMatchAnswers(prev => ({ ...prev, [i]: pair.right }))}
                        type="button"
                        className="px-4 py-3 rounded-xl cursor-pointer transition-all border-none outline-none btn-3d-sky font-bold"
                        style={{
                          background: matchAnswers[i] ? "var(--brand-light)" : "var(--input-background)",
                          color: matchAnswers[i] ? "var(--brand-dark)" : "var(--brand-sky)",
                        }}
                      >
                        {matchAnswers[i] || pair.right}
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={handleNext} type="button" className="w-full py-3.5 rounded-2xl cursor-pointer border-none outline-none text-white font-bold btn-3d" style={{ background: "var(--brand)" }}>
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
                  background: slideIndex === 0 ? "transparent" : "var(--muted)",
                  color: slideIndex === 0 ? "var(--muted-foreground)" : "var(--foreground)",
                  fontWeight: 600,
                  fontSize: 13,
                  opacity: slideIndex === 0 ? 0.3 : 1
                }}
              >
                <ChevronLeft size={15} /> {t("previousLabel")}
              </button>

              <div className="flex gap-1.5">
                {activeSlides.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all"
                    style={{
                      width: slideIndex === i ? 20 : 8,
                      height: 8,
                      background: i < slideIndex ? "var(--brand)" : slideIndex === i ? "var(--brand)" : "var(--switch-background)",
                    }}
                  />
                ))}
              </div>

              {slide.type === "rule" ? (
                <button
                  onClick={handleNext}
                  type="button"
                  className="flex items-center gap-1 px-4 py-2 rounded-xl cursor-pointer border-none outline-none text-white font-bold btn-3d"
                  style={{ background: "var(--brand)" }}
                >
                  {t("nextLabel")} <ChevronRight size={15} />
                </button>
              ) : (
                <div style={{ width: 90 }} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
