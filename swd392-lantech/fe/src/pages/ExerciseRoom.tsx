import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { ChevronLeft, Check, X, Award, ChevronRight, Loader2 } from 'lucide-react';
import { exerciseService, ExerciseDto } from '../services/exerciseService';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';

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
      toast.success(t("exerciseCompleteToast"));
      navigate('/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" size={48} color="var(--brand)" />
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-slate-500 font-bold">{t("noExercisesFound")}</p>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-slate-800 text-white rounded-xl">{t("goBackBtn")}</button>
      </div>
    );
  }

  const currentQuestion = exercises[currentIdx];

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-inter transition-colors duration-300">
      {/* Header bar */}
      <div className="bg-white dark:bg-[#1E2522] p-6 rounded-card border border-sage dark:border-[#2C3531] shadow-diffuse flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-cream-200 dark:hover:bg-slate-900/60 rounded-control transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
          <div className="text-left">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
              {t("exerciseRoomUnit", { id: id?.substring(0, 8) || "" })}
            </span>
            <h1 className="text-xl font-bold text-slate dark:text-cream-50 font-outfit mt-0.5">
              {t("practiceHeader", { type: currentQuestion.type })}
            </h1>
          </div>
        </div>
        <span className="text-sm font-semibold text-meadow dark:text-meadow-400">
          {t("questionProgress", { current: String(currentIdx + 1), total: String(exercises.length) })}
        </span>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-[#1E2522] p-8 rounded-card border border-sage dark:border-[#2C3531] shadow-diffuse space-y-6 transition-colors duration-300">
        <div className="text-left space-y-2">
           <p className="text-xs font-bold text-meadow uppercase tracking-widest">{currentQuestion.instruction || t("selectCorrectOption")}</p>
           <h3 className="text-lg font-bold text-slate dark:text-cream-50">{currentQuestion.prompt}</h3>
        </div>

        {/* Options Grid */}
        <div className="space-y-3">
          {(currentQuestion.options || []).map((option) => {
            const isSelected = selectedOpt === option;
            const isAnswerCorrect = option === currentQuestion.correctAnswer;
            
            let buttonClass = 'border-sage dark:border-[#2C3531] hover:bg-cream-200 dark:hover:bg-slate-900/60 text-slate dark:text-cream-100';
            if (isSelected) {
              buttonClass = 'border-slate dark:border-cream-300 bg-cream-200 dark:bg-slate-800 text-slate dark:text-cream-50';
            }
            if (hasChecked) {
              if (isAnswerCorrect) {
                buttonClass = 'border-meadow dark:border-meadow-500 bg-meadow-50 dark:bg-meadow-950/20 text-meadow dark:text-meadow-400';
              } else if (isSelected) {
                buttonClass = 'border-rose-600 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400';
              } else {
                buttonClass = 'border-sage/40 dark:border-[#2C3531]/40 text-slate/40 dark:text-cream-300/20 cursor-not-allowed';
              }
            }

            return (
              <button
                key={option}
                type="button"
                disabled={hasChecked || isSubmitting}
                onClick={() => setSelectedOpt(option)}
                className={`w-full p-4 text-left rounded-control border text-sm font-semibold transition-all flex items-center justify-between ${buttonClass}`}
              >
                {option}
                {hasChecked && isAnswerCorrect && <Check className="w-5 h-5 text-meadow dark:text-meadow-400" />}
                {hasChecked && isSelected && !isAnswerCorrect && <X className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Check Footer drawer */}
      <div className="bg-white dark:bg-[#1E2522] p-6 rounded-card border border-sage dark:border-[#2C3531] shadow-diffuse flex items-center justify-between transition-colors duration-300">
        <div>
          {hasChecked && (
            <div className="text-left">
              <span className={`text-xs font-bold uppercase tracking-wider ${isCorrect ? 'text-meadow dark:text-meadow-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isCorrect ? t("correctAnswerBanner") : t("incorrectAnswerBanner")}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isCorrect ? t("xpAwardedLabel", { xp: String(currentQuestion.xpReward) }) : feedback || t("correctAnswerWasMsg", { answer: currentQuestion.correctAnswer || "" })}
              </p>
            </div>
          )}
        </div>

        <div>
          {!hasChecked ? (
            <button
              onClick={handleCheck}
              disabled={!selectedOpt || isSubmitting}
              className="px-8 py-3 bg-meadow disabled:opacity-50 hover:bg-meadow-600 text-white font-semibold rounded-control text-xs shadow-diffuse transition-all flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {t("checkAnswer")}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-slate dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700 text-white font-semibold rounded-control text-xs shadow-diffuse transition-all flex items-center gap-1"
            >
              {t("nextQuestion")} <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
