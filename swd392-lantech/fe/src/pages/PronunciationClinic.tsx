import React, { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, BarChart2, ArrowLeft, Loader2 } from "lucide-react";
import { pronunciationService, PronunciationAttemptDto } from "../services/pronunciationService";
import { useAppStore } from "../store/appStore";
import { toast } from "sonner";
import { useTranslation } from "../hooks/useTranslation";
import { motion, AnimatePresence } from "motion/react";

interface Phrase {
  id: string;
  text: string;
  phonetic: string;
  category: string;
  tags: string[];
}

const GRADE_COLORS = {
  excellent: { bg: "#d1fae5", text: "var(--brand-dark)", border: "var(--brand)" },
  weak: { bg: "#fef9c3", text: "#854d0e", border: "#fbbf24" },
  incorrect: { bg: "#fee2e2", text: "#991b1b", border: "#f87171" },
  neutral: { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" },
};

function mergeBuffers(channelBuffer: Float32Array[], recordingLength: number): Float32Array {
  const result = new Float32Array(recordingLength);
  let offset = 0;
  for (let i = 0; i < channelBuffer.length; i++) {
    const buffer = channelBuffer[i];
    result.set(buffer, offset);
    offset += buffer.length;
  }
  return result;
}

function downsampleBuffer(buffer: Float32Array, inputSampleRate: number, outputSampleRate: number): Float32Array {
  if (inputSampleRate === outputSampleRate) {
    return buffer;
  }
  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0, count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const floatTo16BitPCM = (view: DataView, offset: number, input: Float32Array) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return new Blob([view], { type: 'audio/wav' });
}

export default function PronunciationClinic() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [isLoadingPhrases, setIsLoadingPhrases] = useState(true);
  const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDone, setRecordingDone] = useState(false);
  const [feedback, setFeedback] = useState<PronunciationAttemptDto | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [tagPage, setTagPage] = useState(0);
  const [history, setHistory] = useState<PronunciationAttemptDto[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null);
  const { darkMode, user } = useAppStore(state => ({
    darkMode: state.darkMode,
    user: state.user
  }));
  const { t } = useTranslation();

  const GRADE_LABELS = {
    excellent: `✓ ${t("gradeExcellent")}`,
    weak: `~ ${t("gradeWeak")}`,
    incorrect: `✗ ${t("gradeIncorrect")}`,
  };

  // Audio recording refs
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const processorRef = React.useRef<ScriptProcessorNode | null>(null);
  const sourceRef = React.useRef<MediaStreamAudioSourceNode | null>(null);
  const leftchannelRef = React.useRef<Float32Array[]>([]);
  const recordingLengthRef = React.useRef<number>(0);

  const isRecordingRef = React.useRef(false);
  const selectedPhraseRef = React.useRef<Phrase | null>(null);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    selectedPhraseRef.current = selectedPhrase;
  }, [selectedPhrase]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingPhrases(true);
        const data = await pronunciationService.getPhrases();
        setPhrases(data);
        setSelectedPhrase(null);
      } catch (error) {
        console.error("Failed to fetch phrases", error);
        toast.error(t("failedToAssess"));
      } finally {
        setIsLoadingPhrases(false);
      }

      try {
        setIsLoadingHistory(true);
        const data = await pronunciationService.getHistory(100);
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadData();

    return () => {
      // Cleanup recording resources if currently recording on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const categories = ["All", ...Array.from(new Set(phrases.map(p => p.category)))];
  const allTags = ["All", ...Array.from(new Set(phrases.flatMap(p => p.tags || [])))];
  const tagsPerPage = 12;
  const totalTagPages = Math.ceil(allTags.length / tagsPerPage);
  const visibleTags = allTags.slice(tagPage * tagsPerPage, (tagPage + 1) * tagsPerPage);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, selectedTag]);

  const filtered = phrases.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchTag = selectedTag === "All" || (p.tags && p.tags.includes(selectedTag));
    return matchCat && matchTag;
  });

  const phraseScores = new Map<string, number>();
  history.forEach(attempt => {
    const existing = phraseScores.get(attempt.targetText) || 0;
    if (attempt.score > existing) {
      phraseScores.set(attempt.targetText, attempt.score);
    }
  });

  async function stopRecording(isAutoStop = false) {
    if (!isRecordingRef.current) return;

    // Disconnect nodes
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsRecording(false);
    setRecordingDone(true);

    const phrase = selectedPhraseRef.current;
    if (!phrase) return;

    // Flatten buffers
    const flattened = mergeBuffers(leftchannelRef.current, recordingLengthRef.current);
    // Downsample to 16000 Hz
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const downsampled = downsampleBuffer(flattened, sampleRate, 16000);
    // Encode to WAV Blob
    const wavBlob = encodeWAV(downsampled, 16000);

    // Convert WAV Blob to Base64
    const reader = new FileReader();
    reader.readAsDataURL(wavBlob);
    reader.onloadend = async () => {
      const base64data = (reader.result as string).split(',')[1];

      try {
        if (isAutoStop) {
          toast.info(t("stoppedAutoSilence"));
        } else {
          toast.info(t("analyzingPronunciation"));
        }
        const result = await pronunciationService.submitAttempt({
          targetText: phrase.text,
          audioBase64: base64data
        });
        setFeedback(result);
        setHistory(prev => [result, ...prev.slice(0, 4)]);
        toast.success(t("analysisComplete"));
      } catch (error: any) {
        toast.error(t("failedToAssess"));
      }
    };
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create a ScriptProcessorNode (bufferSize = 2048, 1 input channel, 1 output channel)
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      leftchannelRef.current = [];
      recordingLengthRef.current = 0;

      let hasSpoken = false;
      let consecutiveSilenceCount = 0;

      processor.onaudioprocess = (e) => {
        const left = e.inputBuffer.getChannelData(0);
        leftchannelRef.current.push(new Float32Array(left));
        recordingLengthRef.current += left.length;

        // Calculate RMS volume
        let sum = 0;
        for (let i = 0; i < left.length; i++) {
          sum += left[i] * left[i];
        }
        const rms = Math.sqrt(sum / left.length);

        // Define silence threshold (adjust based on noise level, 0.008 is standard for standard speech)
        const SILENCE_THRESHOLD = 0.008; 
        const sampleRate = e.inputBuffer.sampleRate;
        const bufferDuration = left.length / sampleRate; // ~0.046s for 2048 samples at 44100Hz
        const silenceLimitSeconds = 1.5; // Auto-stop after 1.5s of silence
        const limitBuffers = silenceLimitSeconds / bufferDuration;

        if (rms > SILENCE_THRESHOLD) {
          hasSpoken = true;
          consecutiveSilenceCount = 0;
        } else if (hasSpoken) {
          consecutiveSilenceCount++;
          if (consecutiveSilenceCount >= limitBuffers) {
            // Stop recording automatically (silence detected)
            stopRecording(true);
          }
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);
      setRecordingDone(false);
      setFeedback(null);
    } catch (err) {
      console.error(err);
      toast.error(t("failedToAccessMic"));
    }
  }

  const handleRecord = async () => {
    if (!isRecording) {
      await startRecording();
    } else {
      await stopRecording();
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
    <div className="flex h-full overflow-hidden text-left" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
      {/* Phrase list */}
      <div
        className="shrink-0 border-r overflow-y-auto px-5 py-6 hidden md:block"
        style={{ width: 300, background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h2 style={{ fontSize: 17, fontWeight: 900, color: "var(--foreground)", marginBottom: 4 }}>{t("pronunciationHubTitle")}</h2>
        <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", marginBottom: 16 }}>{t("selectPhraseSub")}</p>

        {/* Category filter */}
        <div className="flex gap-1.5 flex-wrap mb-4 relative">
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setActiveCategory(cat); setSelectedTag("All"); setTagPage(0); }}
                type="button"
                className={`px-3 py-1 rounded-full cursor-pointer border-none outline-none relative z-0 text-[11.5px] font-bold transition-all duration-200 ${
                  isActive ? "text-white" : "bg-neutral-100 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-700/60"
                }`}
                style={{
                  background: "transparent",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeClinicCategory"
                    className="absolute inset-0 rounded-full -z-10"
                    style={{ background: "var(--brand)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat === "All" ? t("all") : cat}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Tag filter */}
        {allTags.length > 1 && (
          <div className="mb-4 pb-3 border-b text-left" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-1.5 w-full">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("filterByTag")}</span>
              {totalTagPages > 1 && (
                <div className="flex gap-1.5 items-center">
                  <button
                    onClick={() => setTagPage(prev => Math.max(0, prev - 1))}
                    disabled={tagPage === 0}
                    className="w-5 h-5 rounded hover:bg-neutral-800 disabled:opacity-30 cursor-pointer border-none outline-none flex items-center justify-center font-bold"
                    style={{ background: "transparent", color: "var(--muted-foreground)", fontSize: 11 }}
                    type="button"
                  >
                    ←
                  </button>
                  <span className="text-[9px] font-bold text-muted-foreground self-center">
                    {tagPage + 1}/{totalTagPages}
                  </span>
                  <button
                    onClick={() => setTagPage(prev => Math.min(totalTagPages - 1, prev + 1))}
                    disabled={tagPage === totalTagPages - 1}
                    className="w-5 h-5 rounded hover:bg-neutral-800 disabled:opacity-30 cursor-pointer border-none outline-none flex items-center justify-center font-bold"
                    style={{ background: "transparent", color: "var(--muted-foreground)", fontSize: 11 }}
                    type="button"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-1 flex-wrap min-h-[44px]">
              {visibleTags.map(tag => {
                const isActive = selectedTag === tag;
                return (
                  <motion.button
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTag(tag)}
                    type="button"
                    className={`px-2 py-0.5 rounded cursor-pointer border-none outline-none relative z-0 text-[10.5px] font-bold transition-all duration-200 ${
                      isActive ? "text-white" : "bg-neutral-100 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-700/60"
                    }`}
                    style={{
                      background: "transparent",
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeClinicTag"
                        className="absolute inset-0 rounded -z-10"
                        style={{ background: "var(--brand)" }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tag === "All" ? t("all") : `#${tag}`}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { label: t("sessions"), value: history.length, icon: "🎤" },
            { label: t("avgScore"), value: history.length > 0 ? `${Math.round(history.reduce((acc, h) => acc + h.score, 0) / history.length)}%` : "0%", icon: "📊" },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-3 py-3 text-center animate-fade-in" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 16 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "var(--foreground)" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Phrases list has been moved to main content area */}
      </div>

      {/* Main evaluator */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {!selectedPhrase ? (
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--foreground)" }}>{t("selectPracticePhrase")}</h1>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
                    {t("showing")} {filtered.length} {t("phrasesForCategory")} <span style={{ color: "var(--brand)", fontWeight: 700 }}>{activeCategory === "All" ? t("all") : activeCategory}</span>
                    {selectedTag !== "All" && <> {t("andTag")} <span className="text-blue-400 font-bold">#{selectedTag}</span></>}
                  </p>
                </div>
              </div>

              {isLoadingPhrases ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-muted-foreground" size={36} />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--foreground)" }}>{t("noPhrasesFound")}</h3>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)", maxWidth: 300, marginTop: 4 }}>
                    {t("trySelectDifferentCategory")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                  {filtered.slice((currentPage - 1) * 6, currentPage * 6).map(phrase => {
                    const highestScore = phraseScores.get(phrase.text);
                    const isCompleted = highestScore !== undefined;
                    const grade = isCompleted ? getGrade(highestScore!) : null;
                    const colors = grade ? GRADE_COLORS[grade] : null;

                    return (
                      <motion.button
                        key={phrase.id}
                        onClick={() => { setSelectedPhrase(phrase); setRecordingDone(false); setFeedback(null); }}
                        type="button"
                        whileHover={{ y: -3, scale: 1.02, borderColor: "var(--brand)", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        className="text-left p-5 rounded-2xl cursor-pointer w-full outline-none flex flex-col justify-between h-[170px] transition-colors duration-200"
                        style={{
                          background: "var(--card)",
                          border: "2px solid var(--border)",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span style={{ fontSize: 10.5, color: "var(--muted-foreground)", fontWeight: 700, textTransform: "uppercase" }}>
                              {phrase.category}
                            </span>
                            {isCompleted ? (
                              <span 
                                className="px-2 py-0.5 rounded-full text-[10px] font-extrabold border"
                                style={{ background: colors?.bg, color: colors?.text, borderColor: colors?.border }}
                              >
                                ★ {highestScore}%
                              </span>
                            ) : (
                              <span 
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                                style={{ background: "var(--muted)", color: "var(--muted-foreground)", borderColor: "var(--border)" }}
                              >
                                {t("newBadge")}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            "{phrase.text}"
                          </div>
                        </div>

                        {phrase.tags && phrase.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-2">
                            {phrase.tags.slice(0, 2).map(t => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded text-[9.5px] font-bold"
                                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                              >
                                #{t}
                              </span>
                            ))}
                            {phrase.tags.length > 2 && (
                              <span
                                className="px-1 py-0.5 rounded text-[9.5px] font-bold"
                                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                              >
                                +{phrase.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination controls */}
            {Math.ceil(filtered.length / 6) > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl cursor-pointer hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed border-none outline-none font-bold text-sm transition-all"
                  style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                >
                  {t("previous")}
                </motion.button>
                <span className="text-sm font-bold text-muted-foreground">
                  {t("page")} {currentPage} {t("of")} {Math.ceil(filtered.length / 6)}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filtered.length / 6), prev + 1))}
                  disabled={currentPage === Math.ceil(filtered.length / 6)}
                  className="px-4 py-2 rounded-xl cursor-pointer hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed border-none outline-none font-bold text-sm transition-all"
                  style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                >
                  {t("next")}
                </motion.button>
              </div>
            )}
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
              <ArrowLeft size={14} /> {t("backToList")}
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
                    {selectedPhrase.category}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSpeak(selectedPhrase.text)}
                  type="button"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full cursor-pointer border-none outline-none hover:bg-blue-200 transition-colors"
                  style={{ background: "#eff6ff", color: "#1d4ed8", fontWeight: 600, fontSize: 12 }}
                >
                  <Volume2 size={12} /> {t("listen")}
                </motion.button>
              </div>

              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--foreground)", lineHeight: 1.6, marginBottom: 8 }}>
                "{selectedPhrase.text}"
              </div>
              <div style={{ fontSize: 14, color: "#1CB0F6", fontWeight: 600 }}>{selectedPhrase.phonetic}</div>
              
              {selectedPhrase.tags && selectedPhrase.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t animate-fade-in" style={{ borderColor: "var(--border)" }}>
                  {selectedPhrase.tags.map(t => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Recording area */}
            <div className="flex flex-col items-center gap-5 mb-8">
              <motion.button
                onClick={handleRecord}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all border-none outline-none select-none relative"
                style={{
                  background: isRecording ? "#FF4B4B" : "var(--brand)",
                  boxShadow: isRecording
                    ? "0 0 0 12px rgba(255,75,75,0.25), 0 0 0 24px rgba(255,75,75,0.12)"
                    : "0 8px 0 var(--brand-dark), 0 12px 32px rgba(88,204,2,0.25)",
                }}
              >
                {isRecording ? (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    <MicOff size={32} color="#fff" />
                  </motion.div>
                ) : (
                  <Mic size={32} color="#fff" />
                )}
              </motion.button>

              {isRecording && (
                <div className="flex gap-1 items-end h-10 px-4 py-1 bg-rose-50/50 dark:bg-rose-950/10 rounded-full">
                  {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.5, 0.7, 0.4, 0.9, 0.6, 0.8, 0.5, 0.7, 0.4].map((duration, i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full bg-[#FF4B4B]"
                      initial={{ height: 4 }}
                      animate={{ height: [4, 28, 4] }}
                      transition={{
                        repeat: Infinity,
                        duration: duration,
                        delay: i * 0.04,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
              )}

              <div style={{ fontSize: 13.5, fontWeight: 600, color: isRecording ? "#dc2626" : "#888" }}>
                {isRecording ? `● ${t("recordingProgress")}` : recordingDone ? t("recordingComplete") : t("tapMicToStart")}
              </div>
            </div>

            {/* AI feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="space-y-6"
                >
                  {/* Score */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl px-6 py-5 flex items-center justify-between text-left shadow-diffuse"
                    style={{
                      background: overallScore! >= 80 
                        ? (darkMode ? "rgba(88,204,2,0.15)" : "var(--brand-light)") 
                        : overallScore! >= 60 
                          ? (darkMode ? "rgba(251,191,36,0.15)" : "#fef9c3") 
                          : (darkMode ? "rgba(248,113,113,0.15)" : "#fee2e2"),
                      border: `2px solid ${overallScore! >= 80 ? "var(--brand)" : overallScore! >= 60 ? "#fbbf24" : "#f87171"}`,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>{t("pronunciationScore")}</div>
                      <div style={{ 
                        fontSize: 36, 
                        fontWeight: 900, 
                        color: overallScore! >= 80 
                          ? (darkMode ? "var(--brand)" : "var(--brand-dark)") 
                          : overallScore! >= 60 
                            ? (darkMode ? "#fbbf24" : "#854d0e") 
                            : (darkMode ? "#f87171" : "#991b1b") 
                      }}>
                        {overallScore}%
                      </div>
                    </div>
                    <motion.div 
                      initial={{ rotate: -15, scale: 0.5 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      style={{ fontSize: 48 }}
                    >
                      {overallScore! >= 80 ? "🌟" : overallScore! >= 60 ? "😊" : "💪"}
                    </motion.div>
                  </motion.div>

                  {/* Color-coded phoneme breakdown */}
                  <div
                    className="rounded-2xl p-6 shadow-diffuse"
                    style={{ background: "var(--card)", border: "2px solid var(--border)" }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
                      {t("wordByWordAnalysis")}
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-3 mb-5">
                      {(feedback.wordLevelFeedback || []).map((f, i) => {
                        const grade = getGrade(f.accuracyScore);
                        const colors = GRADE_COLORS[grade];
                        const isWordHovered = hoveredWordIndex === i;
                        return (
                          <div
                            key={i}
                            className="relative"
                            onMouseEnter={() => setHoveredWordIndex(i)}
                            onMouseLeave={() => setHoveredWordIndex(null)}
                          >
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.15 + i * 0.04 }}
                              className="px-3 py-1.5 rounded-xl border select-none cursor-help transition-all duration-200"
                              style={{
                                background: colors.bg,
                                borderColor: colors.border,
                                color: colors.text,
                                fontWeight: 700,
                                fontSize: 14,
                                transform: isWordHovered ? "translateY(-2px)" : "none",
                                boxShadow: isWordHovered ? "0 4px 12px rgba(0,0,0,0.08)" : "none"
                              }}
                            >
                              {f.word}
                            </motion.div>
                            
                            <AnimatePresence>
                              {isWordHovered && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                  transition={{ duration: 0.12, ease: "easeOut" }}
                                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg shadow-xl text-[11px] font-bold z-50 pointer-events-none border border-solid text-center whitespace-nowrap"
                                  style={{
                                    background: "var(--foreground)",
                                    color: "var(--background)",
                                    borderColor: "var(--border)",
                                  }}
                                >
                                  <div style={{ fontSize: 11.5, fontWeight: 900 }}>{f.accuracyScore}%</div>
                                  <div style={{ fontSize: 9.5, opacity: 0.8, marginTop: 1 }}>{GRADE_LABELS[grade]}</div>
                                </motion.div>
                              )}
                            </AnimatePresence>
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
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-2xl px-5 py-4 shadow-diffuse text-left"
                    style={{ 
                      background: darkMode ? "rgba(59,130,246,0.15)" : "#eff6ff", 
                      border: `2px solid ${darkMode ? "rgba(59,130,246,0.3)" : "#bfdbfe"}` 
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: darkMode ? "#60a5fa" : "#1d4ed8", marginBottom: 6 }}>{t("improvementTips")}</div>
                    <ul className="flex flex-col gap-1.5 list-none p-0 m-0 text-left">
                      {feedback.suggestions && feedback.suggestions.length > 0 ? (
                        feedback.suggestions.map((tip, i) => (
                          <li key={i} style={{ fontSize: 13, color: darkMode ? "#93c5fd" : "#1e40af" }}>
                            • {tip}
                          </li>
                        ))
                      ) : (
                        <li style={{ fontSize: 13, color: darkMode ? "var(--brand)" : "var(--brand-dark)" }}>{t("excellentPronunciation")}</li>
                      )}
                    </ul>
                  </motion.div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setFeedback(null); setRecordingDone(false); }}
                      type="button"
                      className="flex-1 py-3.5 rounded-2xl cursor-pointer border font-bold text-base transition-all btn-3d-secondary bg-transparent"
                    >
                      <BarChart2 size={15} className="inline mr-2" />
                      {t("tryAgain")}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedPhrase(null); setFeedback(null); setRecordingDone(false); }}
                      type="button"
                      className="flex-1 py-3.5 rounded-2xl cursor-pointer font-bold text-white text-base btn-3d"
                      style={{ background: "var(--brand)" }}
                    >
                      {t("practiceAnother")}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
