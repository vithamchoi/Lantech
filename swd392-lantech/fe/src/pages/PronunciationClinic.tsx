import React, { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, BarChart2, ArrowLeft, Loader2 } from "lucide-react";
import { pronunciationService, PronunciationAttemptDto } from "../services/pronunciationService";
import { toast } from "sonner";

interface Phrase {
  id: string;
  text: string;
  phonetic: string;
  category: string;
  difficulty: string;
}

const PHRASES: Phrase[] = [
  { id: "1", text: "The weather is beautiful today.", phonetic: "/ðə ˈwɛðər ɪz ˈbjuːtɪfəl təˈdeɪ/", category: "Weather", difficulty: "A2" },
  { id: "2", text: "She sells seashells by the seashore.", phonetic: "/ʃiː sɛlz ˈsiːʃɛlz baɪ ðə ˈsiːʃɔːr/", category: "Tongue Twister", difficulty: "B1" },
  { id: "3", text: "The thought was thoroughly thought through.", phonetic: "/ðə θɔːt wɒz ˈθɜːrəli θɔːt θruː/", category: "th-sounds", difficulty: "B2" },
  { id: "4", text: "I usually enjoy a cup of coffee in the morning.", phonetic: "/aɪ ˈjuːʒuəli ɪnˈdʒɔɪ ə kʌp əv ˈkɒfi ɪn ðə ˈmɔːnɪŋ/", category: "Daily Life", difficulty: "B1" },
  { id: "5", text: "Could you please explain that once more?", phonetic: "/kʊd juː pliːz ɪkˈspleɪn ðæt wʌns mɔːr/", category: "Polite Requests", difficulty: "A2" },
  { id: "6", text: "Entrepreneurship requires extraordinary determination.", phonetic: "/ˌɒntrəprəˈnɜːʃɪp rɪˈkwaɪərz ɪkˌstrɔːdɪˈnɛri dɪˌtɜːmɪˈneɪʃən/", category: "Business", difficulty: "C1" },
];

const GRADE_COLORS = {
  excellent: { bg: "#d1fae5", text: "var(--brand-dark)", border: "var(--brand)" },
  weak: { bg: "#fef9c3", text: "#854d0e", border: "#fbbf24" },
  incorrect: { bg: "#fee2e2", text: "#991b1b", border: "#f87171" },
  neutral: { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" },
};

const GRADE_LABELS = {
  excellent: "✓ Excellent",
  weak: "~ Weak",
  incorrect: "✗ Incorrect",
};

export default function PronunciationClinic() {
  const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDone, setRecordingDone] = useState(false);
  const [feedback, setFeedback] = useState<PronunciationAttemptDto | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [history, setHistory] = useState<PronunciationAttemptDto[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await pronunciationService.getHistory(5);
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history");
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const categories = ["All", ...Array.from(new Set(PHRASES.map(p => p.category)))];
  const filtered = activeCategory === "All" ? PHRASES : PHRASES.filter(p => p.category === activeCategory);

  const handleRecord = async () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingDone(false);
      setFeedback(null);
    } else {
      setIsRecording(false);
      setRecordingDone(true);
      
      if (!selectedPhrase) return;

      try {
        const result = await pronunciationService.submitAttempt({
          targetText: selectedPhrase.text,
          transcriptText: "Mock transcription from FE", // In real app, you'd use STT here
        });
        setFeedback(result);
        setHistory(prev => [result, ...prev.slice(0, 4)]);
      } catch (error: any) {
        toast.error("Failed to assess pronunciation");
      }
    }
  };

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const overallScore = feedback ? feedback.score : null;

  const getGrade = (score: number): "excellent" | "weak" | "incorrect" => {
    if (score >= 80) return "excellent";
    if (score >= 50) return "weak";
    return "incorrect";
  };

  return (
    <div className="flex h-full min-h-screen text-left" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
      {/* Phrase list */}
      <div
        className="shrink-0 border-r overflow-y-auto px-5 py-6 hidden md:block"
        style={{ width: 300, background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 style={{ fontSize: 17, fontWeight: 900, color: "var(--foreground)", marginBottom: 4 }}>Pronunciation Hub</h2>
        <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", marginBottom: 16 }}>Select a phrase and practice your accent</p>

        {/* Category filter */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              type="button"
              className="px-3 py-1 rounded-full cursor-pointer border-none outline-none"
              style={{
                background: activeCategory === cat ? "var(--brand)" : "var(--muted)",
                color: activeCategory === cat ? "#fff" : "var(--muted-foreground)",
                fontWeight: 700,
                fontSize: 11.5,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { label: "Sessions", value: 18, icon: "🎤" },
            { label: "Avg Score", value: "78%", icon: "📊" },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-3 py-3 text-center animate-fade-in" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 16 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "var(--foreground)" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          Practice Phrases
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map(phrase => (
            <button
              key={phrase.id}
              onClick={() => { setSelectedPhrase(phrase); setRecordingDone(false); setFeedback(null); }}
              type="button"
              className="text-left px-4 py-3 rounded-xl cursor-pointer transition-all w-full outline-none"
              style={{
                background: selectedPhrase?.id === phrase.id ? "var(--brand-light)" : "var(--card)",
                border: `2px solid ${selectedPhrase?.id === phrase.id ? "var(--brand)" : "var(--border)"}`,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{ background: "#e0f2fe", color: "#0369a1", fontSize: 10.5, fontWeight: 700 }}
                >
                  {phrase.difficulty}
                </span>
                <span style={{ fontSize: 10.5, color: "var(--muted-foreground)", fontWeight: 600 }}>{phrase.category}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.5 }}>{phrase.text}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main evaluator */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {!selectedPhrase ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div style={{ fontSize: 72, marginBottom: 16 }}>🎤</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--foreground)", marginBottom: 8 }}>Select a phrase to begin</h2>
            <p style={{ fontSize: 14, color: "#aaa" }}>
              Choose a phrase from the left panel, then record yourself speaking it out loud.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Back */}
            <button
              onClick={() => { setSelectedPhrase(null); setFeedback(null); }}
              type="button"
              className="flex items-center gap-1 mb-5 cursor-pointer border-none outline-none bg-transparent"
              style={{ color: "#888", fontWeight: 700, fontSize: 13 }}
            >
              <ArrowLeft size={14} /> Back to list
            </button>

            {/* Phrase card */}
            <div
              className="rounded-3xl p-7 mb-7"
              style={{ background: "var(--card)", border: "2px solid var(--border)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span
                    className="px-3 py-1 rounded-full"
                    style={{ background: "#e0f2fe", color: "#0369a1", fontSize: 12, fontWeight: 700 }}
                  >
                    {selectedPhrase.difficulty} · {selectedPhrase.category}
                  </span>
                </div>
                <button
                  onClick={() => handleSpeak(selectedPhrase.text)}
                  type="button"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full cursor-pointer border-none outline-none hover:bg-blue-100 transition-colors"
                  style={{ background: "#eff6ff", color: "#1d4ed8", fontWeight: 600, fontSize: 12 }}
                >
                  <Volume2 size={12} /> Listen
                </button>
              </div>

              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--foreground)", lineHeight: 1.6, marginBottom: 8 }}>
                "{selectedPhrase.text}"
              </div>
              <div style={{ fontSize: 14, color: "#1CB0F6", fontWeight: 600 }}>{selectedPhrase.phonetic}</div>
            </div>

            {/* Recording area */}
            <div className="flex flex-col items-center gap-5 mb-8">
              <button
                onClick={handleRecord}
                type="button"
                className="w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all border-none outline-none"
                style={{
                  background: isRecording ? "#FF4B4B" : "var(--brand)",
                  boxShadow: isRecording
                    ? "0 0 0 12px rgba(255,75,75,0.2), 0 0 0 24px rgba(255,75,75,0.08)"
                    : "0 8px 0 var(--brand-dark), 0 12px 32px rgba(88,204,2,0.25)",
                }}
              >
                {isRecording ? <MicOff size={32} color="#fff" /> : <Mic size={32} color="#fff" />}
              </button>

              {isRecording && (
                <div className="flex gap-1.5 items-end h-10">
                  {[2, 5, 3, 8, 4, 7, 3, 6, 5, 8, 3].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full animate-bounce"
                      style={{ height: h * 4, background: "#FF4B4B", animationDelay: `${i * 0.07}s`, animationDuration: "0.4s" }}
                    />
                  ))}
                </div>
              )}

              <div style={{ fontSize: 13.5, fontWeight: 600, color: isRecording ? "#dc2626" : "#888" }}>
                {isRecording ? "● Recording... Tap to stop" : recordingDone ? "Recording complete! See your results below." : "Tap the mic to start recording"}
              </div>
            </div>

            {/* AI feedback */}
            {feedback && (
              <div className="space-y-6">
                {/* Score */}
                <div
                  className="rounded-2xl px-6 py-5 flex items-center justify-between text-left"
                  style={{
                    background: overallScore! >= 80 ? "var(--brand-light)" : overallScore! >= 60 ? "#fef9c3" : "#fee2e2",
                    border: `2px solid ${overallScore! >= 80 ? "var(--brand)" : overallScore! >= 60 ? "#fbbf24" : "#f87171"}`,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Pronunciation Score</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: overallScore! >= 80 ? "var(--brand-dark)" : overallScore! >= 60 ? "#854d0e" : "#991b1b" }}>
                      {overallScore}%
                    </div>
                  </div>
                  <div style={{ fontSize: 48 }}>
                    {overallScore! >= 80 ? "🌟" : overallScore! >= 60 ? "😊" : "💪"}
                  </div>
                </div>

                {/* Color-coded phoneme breakdown */}
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "var(--card)", border: "2px solid var(--border)" }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
                    Word-by-word Analysis
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {(feedback.wordLevelFeedback || []).map((f, i) => {
                      const grade = getGrade(f.accuracyScore);
                      const colors = GRADE_COLORS[grade];
                      return (
                        <div
                          key={i}
                          className="px-3 py-1.5 rounded-xl border"
                          style={{ background: colors.bg, borderColor: colors.border, color: colors.text, fontWeight: 700, fontSize: 14 }}
                          title={`${f.accuracyScore}% — ${GRADE_LABELS[grade]}`}
                        >
                          {f.word}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex gap-4 flex-wrap">
                    {(["excellent", "weak", "incorrect"] as const).map(g => {
                      const colors = GRADE_COLORS[g];
                      const count = (feedback.wordLevelFeedback || []).filter(f => getGrade(f.accuracyScore) === g).length;
                      return (
                        <div key={g} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ background: colors.border }}
                          />
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>
                            {GRADE_LABELS[g].replace("✓ ", "").replace("~ ", "").replace("✗ ", "")} ({count})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tips */}
                <div
                  className="rounded-2xl px-5 py-4"
                  style={{ background: "#eff6ff", border: "2px solid #bfdbfe" }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8", marginBottom: 6 }}>💡 Improvement Tips</div>
                  <ul className="flex flex-col gap-1.5">
                    {(feedback.wordLevelFeedback || []).filter(f => getGrade(f.accuracyScore) !== "excellent").map((f, i) => (
                      <li key={i} style={{ fontSize: 13, color: "#1e40af" }}>
                        • Focus on pronouncing <strong>"{f.word}"</strong> — it scored {f.accuracyScore}%
                      </li>
                    ))}
                    {(feedback.wordLevelFeedback || []).every(f => getGrade(f.accuracyScore) === "excellent") && (
                      <li style={{ fontSize: 13, color: "var(--brand-dark)" }}>🎉 Excellent pronunciation! Keep it up!</li>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => { setFeedback(null); setRecordingDone(false); }}
                  type="button"
                  className="w-full py-3.5 rounded-2xl cursor-pointer border-none outline-none font-bold text-white text-base shadow-md transition-all"
                  style={{ background: "var(--brand)" }}
                >
                  <BarChart2 size={15} className="inline mr-2" />
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
