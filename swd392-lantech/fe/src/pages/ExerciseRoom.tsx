import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { ChevronLeft, Check, X, Award, ChevronRight, Loader2 } from 'lucide-react';
import { exerciseService, ExerciseDto } from '../services/exerciseService';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from "motion/react";
import confetti from 'canvas-confetti';

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

  useEffect(() => {
    const fetchExercises = async () => {
      if (!id) return;
      try {
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

  const handleNext = () => {
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
      toast.success(t("exerciseCompleteToast"));
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-inter transition-colors duration-300 relative min-h-[50vh] w-full">
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

              {/* Options Grid */}
              <div className="space-y-3">
                {(exercises[currentIdx].options || []).map((option) => {
                  const isSelected = selectedOpt === option;
                  const isAnswerCorrect = option === exercises[currentIdx].correctAnswer;
                  
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
              </motion.div>
            </AnimatePresence>

            {/* Action Check Footer drawer */}
            <div className="bg-white dark:bg-[#1E2522] p-6 rounded-card border border-sage dark:border-[#2C3531] shadow-diffuse flex items-center justify-between transition-colors duration-300">
              <div>
                <AnimatePresence mode="wait">
                  {hasChecked && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-left"
                    >
                      <span className={`text-xs font-bold uppercase tracking-wider ${isCorrect ? 'text-meadow dark:text-meadow-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isCorrect ? t("correctAnswerBanner") : t("incorrectAnswerBanner")}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isCorrect ? t("xpAwardedLabel", { xp: String(exercises[currentIdx].xpReward) }) : feedback || t("correctAnswerWasMsg", { answer: exercises[currentIdx].correctAnswer || "" })}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                {!hasChecked ? (
                  <button
                    onClick={handleCheck}
                    disabled={!selectedOpt || isSubmitting}
                    className="px-8 py-3 text-white font-semibold rounded-control text-xs btn-3d shadow-diffuse flex items-center gap-2"
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
                    className="px-8 py-3 text-white font-semibold rounded-control text-xs btn-3d-secondary shadow-diffuse flex items-center gap-1"
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
