import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ChevronRight, Mic, MicOff, Loader2 } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { assessmentService, AssessmentDetailDto, AssessmentQuestionDto, AssessmentAnswerItem } from "../services/assessmentService";
import { toast } from "sonner";
import { useTranslation } from "../hooks/useTranslation";

type Section = "listening" | "reading" | "writing" | "speaking";

const SECTIONS: { id: Section; labelKey: string; emoji: string; color: string }[] = [
  { id: "listening", labelKey: "listeningSection", emoji: "👂", color: "#1CB0F6" },
  { id: "reading", labelKey: "readingSection", emoji: "📖", color: "#8b5cf6" },
  { id: "writing", labelKey: "writingSection", emoji: "✍️", color: "#f97316" },
  { id: "speaking", labelKey: "speakingSection", emoji: "🎤", color: "var(--brand)" },
];

export default function AssessmentRoom() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { t } = useTranslation();
  
  const [assessment, setAssessment] = useState<AssessmentDetailDto | null>(null);
  const [started, setStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [currentSection, setCurrentSection] = useState<Section>("listening");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [essayText, setEssayText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  const [sectionDone, setSectionDone] = useState<Section[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleSubmitAll = async () => {
    if (!assessment) return;

    setIsSubmitting(true);
    try {
      const sectionsList: Section[] = ["listening", "reading", "writing", "speaking"];
      for (const sec of sectionsList) {
        const sectionQuestions = assessment.questions.filter(q => q.skill.toLowerCase() === sec.toLowerCase());
        const sectionAnswers = sectionQuestions.map(q => {
          if (sec === 'writing') {
            return { questionId: q.id, answerText: essayText };
          }
          if (sec === 'speaking') {
            return { questionId: q.id, transcriptText: "Mock transcript from FE", targetText: q.speakingPrompt };
          }
          return { questionId: q.id, answer: answers[q.id] || "" };
        });

        await assessmentService.submitSection(assessment.id, sec, sectionAnswers);
      }

      const finalResult = await assessmentService.completeAssessment(assessment.id);
      toast.success(t("submitAssessmentSuccess"));
      navigate("/assessment-results", { state: { result: finalResult } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("failedSubmitSection"));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [started]);

  useEffect(() => {
    if (started && timeLeft === 0 && !isSubmitting) {
      toast.info(t("timeOutAutoSubmit"));
      handleSubmitAll();
    }
  }, [timeLeft, started, isSubmitting]);

  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => setRecordingTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const data = await assessmentService.startAssessment(user?.nativeLang || 'vi');
      setAssessment(data);
      setStarted(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("failedStartAssessment"));
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

  const currentQuestions = assessment?.questions.filter(q => q.skill.toLowerCase() === currentSection.toLowerCase()) || [];

  if (!started) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center text-center p-4" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
        <div
          className="max-w-lg w-full rounded-3xl p-10 text-center shadow-2xl transition-all duration-300"
          style={{ background: "#fff", border: "2px solid rgba(0,0,0,0.06)" }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#3c3c3c", marginBottom: 8 }}>
            {t("assessmentIntroTitle")}
          </h1>
          <p style={{ fontSize: 14.5, color: "#888", lineHeight: 1.7, marginBottom: 28 }}>
            {t("assessmentIntroDesc")}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {SECTIONS.map(s => (
              <div
                key={s.id}
                className="rounded-2xl p-4 text-center"
                style={{ background: "#fafafa", border: "2px solid rgba(0,0,0,0.06)" }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#3c3c3c" }}>{t(s.labelKey)}</div>
                <div style={{ fontSize: 11.5, color: "#aaa" }}>~10 {t("minutes")}</div>
              </div>
            ))}
          </div>

          <div
            className="flex items-center gap-2 justify-center px-4 py-3 rounded-xl mb-6"
            style={{ background: "#fff7ed", border: "2px solid #fde68a" }}
          >
            <Clock size={14} style={{ color: "#f97316" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>{t("assessmentDuration")}</span>
          </div>

          <button
            onClick={handleStart}
            disabled={isLoading}
            type="button"
            className="w-full py-4 rounded-2xl cursor-pointer border-none outline-none font-bold text-white shadow-md transition-all flex items-center justify-center gap-2"
            style={{ background: "var(--brand)", boxShadow: "0 4px 0 var(--brand-dark)", opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading && <Loader2 className="animate-spin" size={20} />}
            {t("beginTest")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-screen flex flex-col text-left" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
      {/* Test header */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b flex-wrap gap-2"
        style={{ background: "#fff", borderColor: "rgba(0,0,0,0.08)" }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {SECTIONS.map(s => {
            const hasAnsweredAny = assessment?.questions
              .filter(q => q.skill.toLowerCase() === s.id)
              .some(q => {
                if (s.id === 'writing') return essayText.trim().length > 0;
                if (s.id === 'speaking') return recordingTime > 0;
                return !!answers[q.id];
              });
            return (
              <div
                key={s.id}
                onClick={() => setCurrentSection(s.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer hover:opacity-80 transition-all"
                style={{
                  background: currentSection === s.id ? s.color + "22" : "#f3f4f6",
                  borderColor: currentSection === s.id ? s.color : "#e5e7eb",
                }}
              >
                <span style={{ fontSize: 13 }}>{s.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: currentSection === s.id ? s.color : "#666" }}>
                  {t(s.labelKey)}
                </span>
                {hasAnsweredAny && <span style={{ color: "var(--brand)", fontSize: 12, marginLeft: 2 }}>●</span>}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full border"
            style={{
              background: timeLeft < 300 ? "#fee2e2" : "#fff7ed",
              borderColor: timeLeft < 300 ? "#fca5a5" : "#fed7aa",
            }}
          >
            <Clock size={14} style={{ color: timeLeft < 300 ? "#dc2626" : "#f97316" }} />
            <span style={{ fontWeight: 800, fontSize: 14, color: timeLeft < 300 ? "#dc2626" : "#92400e", fontVariantNumeric: "tabular-nums" }}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <button
            onClick={handleSubmitAll}
            disabled={isSubmitting}
            type="button"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-full transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
            {t("submitAssessment")}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "#e5e7eb" }}>
        <div
          style={{
            height: "100%",
            background: "var(--brand)",
            width: `${(sectionDone.length / 4) * 100}%`,
            transition: "width 0.5s ease",
          }}
        />
      </div>

      {/* Section content */}
      <div className="flex-1 overflow-y-auto">
        {currentSection === "listening" && (
          <div className="px-8 py-7 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span style={{ fontSize: 28 }}>👂</span>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#3c3c3c" }}>{t("listeningHeader")}</h2>
                <p style={{ fontSize: 13, color: "#888" }}>{t("listeningDesc")}</p>
              </div>
            </div>
            
            {currentQuestions.map((q, qi) => (
              <div key={q.id} className="mb-8">
                {q.audioUrl && qi === 0 && (
                  <div
                    className="rounded-2xl px-6 py-5 mb-6 flex flex-col gap-3 border shadow-sm"
                    style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}
                  >
                    <audio
                      ref={audioRef}
                      src={q.audioUrl}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                      onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                    />
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          if (audioRef.current) {
                            if (isPlaying) {
                              audioRef.current.pause();
                            } else {
                              audioRef.current.play();
                            }
                          }
                        }}
                        type="button"
                        className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shrink-0 border-none text-white font-bold transition-all shadow-md hover:scale-105"
                        style={{ background: "#1CB0F6" }}
                      >
                        {isPlaying ? (
                          <span style={{ fontSize: 14, fontWeight: 900 }}>||</span>
                        ) : (
                          <span style={{ fontSize: 20, marginLeft: 3 }}>▶</span>
                        )}
                      </button>
                      <div className="flex-1">
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#1d4ed8" }}>{t("listeningSection")}</div>
                        <div style={{ fontSize: 12, color: "#60a5fa" }}>Conversation 1-4</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>
                        {formatTime(currentTime)} / {formatTime(duration || 0)}
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      value={currentTime}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setCurrentTime(val);
                        if (audioRef.current) {
                          audioRef.current.currentTime = val;
                        }
                      }}
                      className="w-full h-1.5 rounded-lg bg-blue-200 appearance-none cursor-pointer accent-blue-600 outline-none"
                      style={{ margin: 0 }}
                    />
                  </div>
                )}
                
                <div style={{ fontSize: 14, fontWeight: 700, color: "#3c3c3c", marginBottom: 12, lineHeight: 1.6 }}>
                  {qi + 1}. {q.questionText}
                </div>
                
                <div className="flex flex-col gap-2">
                  {q.options?.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      type="button"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-left transition-all border outline-none"
                      style={{
                        background: answers[q.id] === opt ? "#eff6ff" : "#fafafa",
                        borderColor: answers[q.id] === opt ? "#1CB0F6" : "#e5e7eb",
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: answers[q.id] === opt ? "#1CB0F6" : "#e5e7eb",
                          color: answers[q.id] === opt ? "#fff" : "#888",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {String.fromCharCode(65 + oi)}
                      </div>
                      <span style={{ fontSize: 13.5, color: "#3c3c3c" }}>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => setCurrentSection("reading")}
              type="button"
              className="mt-4 px-8 py-3 rounded-2xl cursor-pointer border-none outline-none font-bold text-white flex items-center gap-2"
              style={{ background: "var(--brand)" }}
            >
              {t("goToReading")} <ChevronRight size={14} />
            </button>
          </div>
        )}

        {currentSection === "reading" && (
          <div className="flex h-full flex-col md:flex-row">
            <div
              className="flex-1 overflow-y-auto px-8 py-7 border-r"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-2 mb-5">
                <span style={{ fontSize: 24 }}>📖</span>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#3c3c3c" }}>{t("readingHeader")}</h2>
              </div>
              <div
                className="rounded-2xl p-6"
                style={{ background: "#fff", border: "2px solid rgba(0,0,0,0.06)", lineHeight: 2, fontSize: 14.5, color: "#3c3c3c" }}
              >
                <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16 }}>{t("readingSectionHeader")}</h3>
                <div style={{ whiteSpace: 'pre-wrap' }}>{currentQuestions[0]?.passageText || t("noPassageText")}</div>
              </div>
            </div>
            <div className="shrink-0 overflow-y-auto px-7 py-7" style={{ width: "100%", maxWidth: 380 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "#3c3c3c", marginBottom: 16 }}>{t("questionsHeader")}</h2>
              {currentQuestions.map((q, qi) => (
                <div key={q.id} className="mb-6">
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#3c3c3c", marginBottom: 10, lineHeight: 1.6 }}>
                    {qi + 1}. {q.questionText}
                  </div>
                  <div className="flex flex-col gap-2">
                    {q.options?.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        type="button"
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-left transition-all border outline-none"
                        style={{
                          background: answers[q.id] === opt ? "#f5f3ff" : "#fafafa",
                          borderColor: answers[q.id] === opt ? "#8b5cf6" : "#e5e7eb",
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: answers[q.id] === opt ? "#8b5cf6" : "#e5e7eb",
                            color: answers[q.id] === opt ? "#fff" : "#888",
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        >
                          {String.fromCharCode(65 + oi)}
                        </div>
                        <span style={{ fontSize: 13, color: "#3c3c3c" }}>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={() => setCurrentSection("writing")}
                type="button"
                className="w-full mt-4 px-8 py-3 rounded-2xl cursor-pointer border-none outline-none font-bold text-white flex items-center justify-center gap-2"
                style={{ background: "#8b5cf6" }}
              >
                {t("goToWriting")} <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {currentSection === "writing" && (
          <div className="px-8 py-7 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span style={{ fontSize: 28 }}>✍️</span>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#3c3c3c" }}>{t("writingHeader")}</h2>
                <p style={{ fontSize: 13, color: "#888" }}>{t("writingDesc")}</p>
              </div>
            </div>

            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: "#fff", border: "2px solid rgba(0,0,0,0.06)" }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#3c3c3c", marginBottom: 12 }}>{t("promptLabel")}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#3c3c3c" }}>
                {currentQuestions[0]?.writingPrompt || currentQuestions[0]?.questionText}
              </p>
            </div>

            <textarea
              value={essayText}
              onChange={(e) => {
                const text = e.target.value;
                const matches = [...text.matchAll(/\S+/g)];
                if (matches.length > 200) {
                  const lastMatch = matches[199];
                  const endPosition = lastMatch.index + lastMatch[0].length;
                  setEssayText(text.substring(0, endPosition));
                  return;
                }
                setEssayText(text);
              }}
              placeholder={t("writingPlaceholder")}
              className="w-full h-64 rounded-2xl p-6 border outline-none transition-all resize-none"
              style={{
                background: "#fafafa",
                borderColor: "rgba(0,0,0,0.06)",
                fontSize: 15,
                lineHeight: 1.7,
                color: "#3c3c3c",
              }}
            />

            <div className="flex items-center justify-between mt-4">
              <span style={{ fontSize: 12, fontWeight: 700, color: "#aaa" }}>
                {t("wordCountLabel", { count: String(essayText.trim() === "" ? 0 : essayText.trim().split(/\s+/).length) })}
              </span>
              <button
                onClick={() => setCurrentSection("speaking")}
                type="button"
                className="px-8 py-3 rounded-2xl cursor-pointer border-none outline-none font-bold text-white flex items-center gap-2"
                style={{
                  background: "#f97316",
                }}
              >
                {t("goToSpeaking")} <ChevronRight size={14} />
              </button>
            </div>
            {essayText.trim().length < 50 && !isSubmitting && (
              <p className="mt-2 text-xs text-orange-500 font-bold">{t("writingLimitWarning")}</p>
            )}
          </div>
        )}

        {currentSection === "speaking" && (
          <div className="px-8 py-7 max-w-2xl mx-auto text-center">
            <div className="flex flex-col items-center gap-4 mb-10">
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg"
                style={{ background: "var(--brand-light)" }}
              >
                <span style={{ fontSize: 32 }}>🎤</span>
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#3c3c3c" }}>{t("speakingHeader")}</h2>
                <p style={{ fontSize: 14, color: "#888" }}>{t("speakingDesc")}</p>
              </div>
            </div>

            <div
              className="rounded-3xl p-8 mb-10 shadow-sm"
              style={{ background: "#fff", border: "2px solid rgba(0,0,0,0.06)" }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#aaa", textTransform: "uppercase", marginBottom: 12 }}>{t("recordPromptLabel")}</h3>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#3c3c3c", lineHeight: 1.6 }}>
                "{currentQuestions[0]?.speakingPrompt || currentQuestions[0]?.questionText}"
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <button
                onClick={() => setIsRecording(!isRecording)}
                type="button"
                className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all border-none outline-none shadow-xl ${isRecording ? "animate-pulse" : ""}`}
                style={{
                  background: isRecording ? "#ef4444" : "var(--brand)",
                  boxShadow: isRecording ? "0 0 0 10px #fee2e2" : "0 0 0 10px var(--brand-light)",
                }}
              >
                {isRecording ? <MicOff size={36} color="#fff" /> : <Mic size={36} color="#fff" />}
              </button>

              <div className="flex flex-col items-center gap-1">
                <span style={{ fontSize: 24, fontWeight: 900, color: isRecording ? "#ef4444" : "#3c3c3c", fontVariantNumeric: "tabular-nums" }}>
                  {formatTime(recordingTime)}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#aaa" }}>
                  {isRecording ? t("recordingInProgress") : t("clickToRecord")}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmitAll}
              disabled={isSubmitting}
              type="button"
              className="mt-12 px-10 py-4 rounded-2xl cursor-pointer border-none outline-none font-bold text-white shadow-lg flex items-center justify-center gap-2 mx-auto"
              style={{ background: "var(--brand)", opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {t("submitAssessment")} <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
