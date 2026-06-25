import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { ChevronLeft, Check, X, Award, ChevronRight, Loader2, Mic, MicOff, Volume2 } from 'lucide-react';
import { exerciseService, ExerciseDto } from '../services/exerciseService';
import { learningService } from '../services/learningService';
import { authService } from '../services/authService';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from "motion/react";
import confetti from 'canvas-confetti';

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

export default function ExerciseRoom() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, login } = useAppStore();
  const { t } = useTranslation();
  const [exercises, setExercises] = useState<ExerciseDto[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState('');
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Audio recording states & refs
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDone, setRecordingDone] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const leftchannelRef = useRef<Float32Array[]>([]);
  const recordingLengthRef = useRef(0);
  const isRecordingRef = useRef(false);

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      leftchannelRef.current = [];
      recordingLengthRef.current = 0;

      processor.onaudioprocess = (e) => {
        const left = e.inputBuffer.getChannelData(0);
        leftchannelRef.current.push(new Float32Array(left));
        recordingLengthRef.current += left.length;
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);
      isRecordingRef.current = true;
      setRecordingDone(false);
    } catch (err) {
      console.error(err);
      toast.error("Không thể truy cập microphone. Vui lòng cấp quyền.");
    }
  }

  async function stopRecording() {
    if (!isRecordingRef.current) return;

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
    isRecordingRef.current = false;
    setRecordingDone(true);

    const flattened = mergeBuffers(leftchannelRef.current, recordingLengthRef.current);
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const downsampled = downsampleBuffer(flattened, sampleRate, 16000);
    const wavBlob = encodeWAV(downsampled, 16000);

    const reader = new FileReader();
    reader.readAsDataURL(wavBlob);
    reader.onloadend = () => {
      const base64data = (reader.result as string).split(',')[1];
      setSelectedOpt(base64data);
      toast.success("Đã ghi âm thành công. Hãy nhấn nút kiểm tra kết quả!");
    };
  }

  const handleRecord = async () => {
    if (!isRecording) {
      await startRecording();
    } else {
      await stopRecording();
    }
  };

  let parsedSpeakingFeedback: any = null;
  let parsedWritingFeedback: any = null;
  if (hasChecked && feedback) {
    try {
      const parsed = JSON.parse(feedback);
      if (parsed && typeof parsed === 'object') {
        if ('accuracy' in parsed) {
          parsedSpeakingFeedback = parsed;
        } else if ('rawScore' in parsed) {
          parsedWritingFeedback = parsed;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    const fetchExercises = async () => {
      if (!id) return;
      try {
        try {
          await learningService.startLesson(id);
        } catch (startErr) {
          console.warn("Failed to register start lesson in backend", startErr);
        }
        const data = await exerciseService.getExercisesByLesson(id);
        setExercises(data);
      } catch (error: any) {
        toast.error(t("failedToLoadExercises"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchExercises();
  }, [id]);

  const handleCheck = async () => {
    if (!id || currentIdx >= exercises.length) return;
    
    setIsSubmitting(true);
    try {
      const currentEx = exercises[currentIdx];
      const result = await exerciseService.submitExercise(currentEx.id, selectedOpt);
      
      setIsCorrect(result.isCorrect);
      setFeedback(result.feedback || '');
      setHasChecked(true);

      // Nếu đúng, cập nhật XP cục bộ cho UI phản hồi nhanh
      if (result.isCorrect && user) {
        // Cập nhật lại user state từ backend sau khi xong session hoặc ở đây
      }
    } catch (error: any) {
      toast.error(t("failedToSubmitAnswer"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setSelectedOpt('');
    setHasChecked(false);
    setFeedback('');
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 }
      });
      if (id) {
        setIsLoading(true);
        try {
          await learningService.completeLesson(id);
          try {
            const updatedUser = await authService.getMe();
            const currentRole = useAppStore.getState().role;
            const accessToken = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            if (accessToken && refreshToken) {
              login(currentRole, updatedUser, accessToken, refreshToken);
            }
          } catch (err) {
            console.error("Failed to sync user profile after completing lesson", err);
          }
        } catch (err) {
          console.error("Failed to complete lesson in backend", err);
        } finally {
          setIsLoading(false);
        }
      }
      toast.success(t("exerciseCompleteToast"));
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-inter transition-colors duration-300 relative min-h-[50vh] w-full pb-24 pt-6">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center absolute inset-0 z-50 bg-background h-full w-full py-20"
          >
            <Loader2 className="animate-spin" size={48} color="var(--brand)" />
          </motion.div>
        ) : exercises.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center gap-4 py-20 w-full"
          >
            <p className="text-slate-500 font-bold">{t("noExercisesFound")}</p>
            <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-slate-800 text-white rounded-xl btn-3d-secondary">{t("goBackBtn")}</button>
          </motion.div>
        ) : (
          <motion.div
            key="exercise"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-8 w-full"
          >
            {/* Header bar */}
            <div className="bg-white dark:bg-[#1E2522] p-6 rounded-card border border-sage dark:border-[#2C3531] shadow-diffuse flex items-center justify-between transition-colors duration-300">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-control transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
              <div className="text-left">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                  {t("exerciseRoomUnit", { id: id?.substring(0, 8) || "" })}
                </span>
                <h1 className="text-xl font-bold text-slate-800 dark:text-neutral-100 font-outfit mt-0.5">
                  {t("practiceHeader", { type: exercises[currentIdx].type })}
                </h1>
              </div>
            </div>
            <span className="text-sm font-semibold text-meadow dark:text-meadow-400">
              {t("questionProgress", { current: String(currentIdx + 1), total: String(exercises.length) })}
            </span>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="bg-white dark:bg-[#1E2522] p-8 rounded-card border border-sage dark:border-[#2C3531] shadow-diffuse space-y-6 transition-colors duration-300 text-left"
            >
              <div className="space-y-2">
                 <p className="text-xs font-bold text-meadow uppercase tracking-widest">{exercises[currentIdx].instruction || t("selectCorrectOption")}</p>
                 <h3 className="text-lg font-bold text-slate-800 dark:text-neutral-100">{exercises[currentIdx].prompt}</h3>
              </div>

              {/* Conditional Input based on Exercise Type */}
              {exercises[currentIdx].type === 'MultipleChoice' && (
                <div className="space-y-3">
                  {(exercises[currentIdx].options || []).map((option) => {
                    const isSelected = selectedOpt === option;
                    const isAnswerCorrect = option.trim().toLowerCase() === exercises[currentIdx].correctAnswer?.trim().toLowerCase();
                    
                    let buttonClass = 'border-sage dark:border-[#2C3531] hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-neutral-200';
                    if (isSelected) {
                      buttonClass = 'border-sky-500 dark:border-sky-400 bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300';
                    }
                    if (hasChecked) {
                      if (isAnswerCorrect) {
                        buttonClass = 'border-meadow dark:border-meadow-500 bg-meadow-50 dark:bg-meadow-950/20 text-meadow dark:text-meadow-400';
                      } else if (isSelected) {
                        buttonClass = 'border-rose-600 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400';
                      } else {
                        buttonClass = 'border-sage/40 dark:border-[#2C3531]/40 text-slate-400/40 dark:text-neutral-600/40 cursor-not-allowed';
                      }
                    }

                    return (
                      <motion.button
                        key={option}
                        type="button"
                        disabled={hasChecked || isSubmitting}
                        onClick={() => setSelectedOpt(option)}
                        whileHover={!(hasChecked || isSubmitting) ? { scale: 1.01 } : {}}
                        whileTap={!(hasChecked || isSubmitting) ? { scale: 0.99 } : {}}
                        className={`w-full p-4 text-left rounded-control border text-sm font-semibold transition-all flex items-center justify-between outline-none ${buttonClass}`}
                      >
                        {option}
                        {hasChecked && isAnswerCorrect && <Check className="w-5 h-5 text-meadow dark:text-meadow-400" />}
                        {hasChecked && isSelected && !isAnswerCorrect && <X className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {exercises[currentIdx].type === 'FillBlank' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    disabled={hasChecked || isSubmitting}
                    value={selectedOpt}
                    onChange={(e) => setSelectedOpt(e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="w-full p-4 rounded-control border border-sage dark:border-[#2C3531] bg-white dark:bg-[#1E2522] text-slate-800 dark:text-neutral-200 outline-none focus:border-sky-500 text-sm font-semibold transition-all"
                  />
                  {hasChecked && (
                    <div className="p-4 bg-slate-50 dark:bg-neutral-800/40 rounded-xl border border-sage/60 dark:border-[#2C3531]/60 text-xs text-slate-500 dark:text-neutral-400 mt-2">
                      <span className="font-bold text-meadow mr-2">Đáp án đúng:</span>
                      {exercises[currentIdx].correctAnswer}
                    </div>
                  )}
                </div>
              )}

              {exercises[currentIdx].type === 'Writing' && (
                <div className="space-y-3">
                  <textarea
                    rows={8}
                    disabled={hasChecked || isSubmitting}
                    value={selectedOpt}
                    onChange={(e) => setSelectedOpt(e.target.value)}
                    placeholder="Viết bài luận của bạn tại đây (khoảng 200 từ)..."
                    className="w-full p-4 rounded-control border border-sage dark:border-[#2C3531] bg-white dark:bg-[#1E2522] text-slate-800 dark:text-neutral-200 outline-none focus:border-sky-500 text-sm transition-all"
                  />
                  <div className="text-right text-xs text-slate-400 dark:text-slate-500 font-semibold">
                    Số từ: {selectedOpt ? selectedOpt.trim().split(/\s+/).filter(Boolean).length : 0} từ
                  </div>
                  
                  {hasChecked && parsedWritingFeedback && (
                    <div className="mt-4 p-5 rounded-2xl border border-sage/80 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 space-y-3 text-left">
                      <div className="flex items-center justify-between border-b pb-2 border-sage/40 dark:border-neutral-700">
                        <span className="text-sm font-bold text-slate-700 dark:text-neutral-300">Điểm AI chấm (Thang điểm 10):</span>
                        <span className="text-xl font-black text-brand dark:text-meadow-400">{parsedWritingFeedback.score} / 10</span>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400">Nhận xét chi tiết & Lỗi sai:</span>
                        <p className="text-sm text-slate-600 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
                          {parsedWritingFeedback.feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {exercises[currentIdx].type === 'Speaking' && (
                <div className="space-y-4 text-center py-4">
                  <div className="p-5 rounded-2xl border border-dashed border-sage dark:border-[#2C3531] bg-slate-50/50 dark:bg-neutral-900/30 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 dark:text-neutral-300 italic">
                      "{exercises[currentIdx].targetText || exercises[currentIdx].correctAnswer}"
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSpeak(exercises[currentIdx].targetText || exercises[currentIdx].correctAnswer || '')}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all text-sky-500"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-3">
                    <motion.button
                      type="button"
                      disabled={hasChecked || isSubmitting}
                      onClick={handleRecord}
                      whileHover={!(hasChecked || isSubmitting) ? { scale: 1.05 } : {}}
                      whileTap={!(hasChecked || isSubmitting) ? { scale: 0.95 } : {}}
                      className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all border-none outline-none text-white disabled:opacity-50 ${isRecording ? 'animate-pulse' : ''}`}
                      style={{
                        background: isRecording ? '#f43f5e' : 'var(--brand)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    >
                      {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </motion.button>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {isRecording ? "Đang ghi âm (nhấn lại để hoàn thành)..." : "Nhấn để bắt đầu nói"}
                    </span>
                  </div>

                  {hasChecked && parsedSpeakingFeedback && (
                    <div className="mt-6 p-6 rounded-2xl border border-sage/80 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-left space-y-4">
                      <div className="flex items-center justify-between border-b pb-3 border-sage/40 dark:border-neutral-700">
                        <span className="text-sm font-bold text-slate-700 dark:text-neutral-300">Điểm Phát Âm:</span>
                        <span className="text-xl font-black text-meadow dark:text-meadow-400">{parsedSpeakingFeedback.score}%</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white dark:bg-neutral-800 p-2.5 rounded-xl border border-sage/50 dark:border-neutral-700">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Độ chính xác</div>
                          <div className="text-sm font-bold text-slate-700 dark:text-neutral-300">{parsedSpeakingFeedback.accuracy}%</div>
                        </div>
                        <div className="bg-white dark:bg-neutral-800 p-2.5 rounded-xl border border-sage/50 dark:border-neutral-700">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Độ trôi chảy</div>
                          <div className="text-sm font-bold text-slate-700 dark:text-neutral-300">{parsedSpeakingFeedback.fluency}%</div>
                        </div>
                        <div className="bg-white dark:bg-neutral-800 p-2.5 rounded-xl border border-sage/50 dark:border-neutral-700">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Độ hoàn thiện</div>
                          <div className="text-sm font-bold text-slate-700 dark:text-neutral-300">{parsedSpeakingFeedback.completeness}%</div>
                        </div>
                      </div>

                      {parsedSpeakingFeedback.wordLevelFeedback && parsedSpeakingFeedback.wordLevelFeedback.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs uppercase font-bold text-slate-400">Phân tích chi tiết từng từ:</div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {parsedSpeakingFeedback.wordLevelFeedback.map((w: any, idx: number) => {
                              const score = w.accuracyScore;
                              let colors = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30';
                              if (score < 50) {
                                colors = 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30';
                              } else if (score < 80) {
                                colors = 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30';
                              }
                              return (
                                <div key={idx} className={`px-2 py-1 text-xs font-bold rounded-lg border ${colors}`}>
                                  {w.word}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {parsedSpeakingFeedback.feedback && (
                        <div className="space-y-1">
                          <div className="text-xs uppercase font-bold text-slate-400">Nhận xét:</div>
                          <p className="text-sm text-slate-600 dark:text-neutral-300 italic">{parsedSpeakingFeedback.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Action Check Footer drawer */}
          <div className="bg-white dark:bg-[#1E2522] p-6 rounded-card border border-sage dark:border-[#2C3531] shadow-diffuse flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors duration-300">
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {hasChecked && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-left font-inter"
                  >
                    <span className={`text-xs font-bold uppercase tracking-wider ${isCorrect ? 'text-meadow dark:text-meadow-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isCorrect ? t("correctAnswerBanner") : t("incorrectAnswerBanner")}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words font-medium">
                      {parsedSpeakingFeedback || parsedWritingFeedback
                        ? "Bài tập đã được đánh giá thành công."
                        : isCorrect
                          ? t("xpAwardedLabel", { xp: String(exercises[currentIdx].xpReward) })
                          : feedback || t("correctAnswerWasMsg", { answer: exercises[currentIdx].correctAnswer || "" })}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="shrink-0 flex items-center justify-end">
              {!hasChecked ? (
                <button
                  onClick={handleCheck}
                  disabled={!selectedOpt || isSubmitting}
                  className="px-8 py-3 text-white font-semibold rounded-control text-xs btn-3d shadow-diffuse flex items-center gap-2 whitespace-nowrap"
                  style={{
                    background: selectedOpt ? "var(--brand)" : "var(--switch-background)",
                    boxShadow: selectedOpt ? "0 4px 0 var(--brand-dark)" : "none",
                    opacity: selectedOpt ? 1 : 0.5
                  }}
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  {t("checkAnswer")}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 text-white font-semibold rounded-control text-xs btn-3d-secondary shadow-diffuse flex items-center gap-1 whitespace-nowrap"
                  style={{
                    background: 'var(--brand)',
                    boxShadow: '0 4px 0 var(--brand-dark)'
                  }}
                >
                  {t("nextQuestion")} <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
}
