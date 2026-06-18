import React, { useState, useEffect } from "react";
import { RotateCcw, ChevronLeft, ChevronRight, Volume2, Loader2 } from "lucide-react";
import { flashcardService, FlashcardDto } from "../services/flashcardService";
import { toast } from "sonner";

const GRADE_OPTIONS = [
  { score: 0, label: "Forgot", color: "#FF4B4B", bg: "#fee2e2", emoji: "😭" },
  { score: 3, label: "Remembered", color: "#22c55e", bg: "#f0fdf4", emoji: "😊" },
];

export default function FlashcardDeck() {
  const [dueCards, setDueCards] = useState<FlashcardDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [gradedCards, setGradedCards] = useState<Record<string, number>>({});
  const [sessionDone, setSessionDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDueCards = async () => {
      try {
        // Change from getDueFlashcards to getFlashcards to show all cards in deck
        const data = await flashcardService.getFlashcards();
        setDueCards(data);
      } catch (error) {
        toast.error("Failed to load your cards for today");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDueCards();
  }, []);

  const handleGrade = async (score: number) => {
    if (!current) return;
    
    setIsSubmitting(true);
    try {
      await flashcardService.reviewFlashcard(current.id, score);
      setGradedCards(prev => ({ ...prev, [current.id]: score }));
      setIsFlipped(false);
      
      if (currentIndex < dueCards.length - 1) {
        setTimeout(() => setCurrentIndex(i => i + 1), 300);
      } else {
        setTimeout(() => setSessionDone(true), 300);
      }
    } catch (error) {
      toast.error("Failed to record your review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" size={48} color="var(--brand)" />
      </div>
    );
  }

  if (dueCards.length === 0 && !sessionDone) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center text-center p-4" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
        <div className="max-w-md">
          <div style={{ fontSize: 80, marginBottom: 16 }}>✨</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#3c3c3c", marginBottom: 8 }}>All Caught Up!</h2>
          <p style={{ fontSize: 15, color: "#888", marginBottom: 32 }}>
            You have no cards due for review today. Great job staying consistent!
          </p>
        </div>
      </div>
    );
  }

  const totalDue = dueCards.length;
  const graded = Object.keys(gradedCards).length;
  // Protect against out of bounds access when currentIndex changes
  const current = dueCards[currentIndex] || dueCards[0];

  if (sessionDone) {
    const totalCount = Object.keys(gradedCards).length;
    const rememberedCount = Object.values(gradedCards).filter(s => s === 3).length;
    const forgotCount = Object.values(gradedCards).filter(s => s === 0).length;
    const forgotCards = dueCards.filter(card => gradedCards[card.id] === 0);

    const handleReviewAgain = () => {
      if (forgotCards.length > 0) {
        setDueCards(forgotCards);
        setGradedCards({});
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionDone(false);
      } else {
        // If they remembered everything, just reset everything to initial state (though ideally we'd fetch new cards)
        setCurrentIndex(0); 
        setIsFlipped(false); 
        setGradedCards({}); 
        setSessionDone(false);
      }
    };

    return (
      <div className="h-full min-h-screen flex items-center justify-center" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
        <div className="text-center max-w-md w-full px-4">
          <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#3c3c3c", marginBottom: 8 }}>Session Complete!</h2>
          <p style={{ fontSize: 15, color: "#888", marginBottom: 32 }}>
            You reviewed {totalCount} cards today. Here's your insight:
          </p>
          
          <div className="flex gap-4 mb-8">
            <div className="flex-1 rounded-2xl p-4 text-center border-2 border-red-100 bg-red-50">
              <div style={{ fontWeight: 800, fontSize: 24, color: "#FF4B4B" }}>{forgotCount}</div>
              <div style={{ fontSize: 13, color: "#FF4B4B", fontWeight: 600, marginTop: 4 }}>Forgot</div>
            </div>
            <div className="flex-1 rounded-2xl p-4 text-center border-2 border-green-100 bg-green-50">
              <div style={{ fontWeight: 800, fontSize: 24, color: "#22c55e" }}>{rememberedCount}</div>
              <div style={{ fontSize: 13, color: "#22c55e", fontWeight: 600, marginTop: 4 }}>Remembered</div>
            </div>
          </div>

          <button
            onClick={handleReviewAgain}
            type="button"
            className="w-full py-4 rounded-2xl cursor-pointer border-none outline-none font-bold text-white shadow-md transition-all active:translate-y-1 active:shadow-none"
            style={{ 
              background: "var(--brand)", 
              boxShadow: "0 4px 0 var(--brand-dark)",
              fontSize: 16
            }}
          >
            <RotateCcw size={18} className="inline mr-2 -mt-1" />
            {forgotCards.length > 0 ? `Review ${forgotCards.length} Forgotten Cards` : "Start New Session"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-screen text-left" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ borderColor: "rgba(0,0,0,0.06)", background: "#fff" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#3c3c3c" }}>Flashcard Box</h1>
            <p style={{ fontSize: 13.5, color: "#888" }}>Spaced Repetition Review Session</p>
          </div>
          <div
            className="px-4 py-2 rounded-full font-bold text-xs"
            style={{ background: totalDue > 0 ? "#fff7ed" : "var(--brand-light)" }}
          >
            <span style={{ color: "#c2410c" }}>{graded}/{totalDue}</span>
            <span style={{ color: "#888", marginLeft: 4 }}>reviewed</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="rounded-full overflow-hidden" style={{ height: 8, background: "#e5e7eb" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(graded / totalDue) * 100}%`, background: "var(--brand)" }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span style={{ fontSize: 11.5, color: "#aaa" }}>{graded} graded</span>
          <span style={{ fontSize: 11.5, color: "#aaa" }}>{totalDue - graded} remaining</span>
        </div>
      </div>

      {/* Deck stats sidebar + card */}
      <div className="flex flex-1 min-h-0 overflow-hidden flex-col md:flex-row">
        {/* Card area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 py-6 overflow-y-auto">
          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsFlipped(false); }}
              disabled={currentIndex === 0}
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none outline-none"
              style={{ background: currentIndex === 0 ? "#f3f4f6" : "#fff", border: "2px solid #e5e7eb", color: "#888" }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#888" }}>
              {currentIndex + 1} / {totalDue}
            </span>
            <button
              onClick={() => { setCurrentIndex(Math.min(totalDue - 1, currentIndex + 1)); setIsFlipped(false); }}
              disabled={currentIndex === totalDue - 1}
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none outline-none"
              style={{ background: currentIndex === totalDue - 1 ? "#f3f4f6" : "#fff", border: "2px solid #e5e7eb", color: "#888" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* The flashcard */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer select-none"
            style={{
              width: "100%",
              maxWidth: 440,
              minHeight: 260,
              perspective: "1000px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                minHeight: 260,
                transition: "transform 0.5s",
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front */}
              <div
                className="rounded-3xl p-8 flex flex-col items-center justify-center text-center"
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  background: "linear-gradient(135deg, #fff 0%, #f0fdf4 100%)",
                  border: "3px solid var(--brand-light)",
                  boxShadow: "0 8px 32px rgba(88,204,2,0.15)",
                  minHeight: 260,
                }}
              >
                <div
                  className="px-3 py-1 rounded-full mb-4"
                  style={{ background: "#e0f2fe", color: "#0369a1", fontSize: 12, fontWeight: 700 }}
                >
                   {current.partOfSpeech || 'Word'}
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#3c3c3c", marginBottom: 8 }}>
                  {current.word}
                </div>
                <div style={{ fontSize: 14, color: "#1CB0F6", fontWeight: 600, marginBottom: 20 }}>
                  {current.ipa}
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer hover:bg-sky-100 transition-colors border-none outline-none"
                  style={{ background: "#e0f2fe", color: "#0369a1", fontWeight: 600, fontSize: 13 }}
                  onClick={e => handleSpeak(e, current.word)}
                >
                  <Volume2 size={14} />
                  Listen
                </button>
                <div style={{ fontSize: 12.5, color: "#aaa", marginTop: 24, fontWeight: 500 }}>
                  Tap to reveal ↓
                </div>
              </div>

              {/* Back */}
              <div
                className="rounded-3xl p-8 flex flex-col items-center justify-center text-center"
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: "linear-gradient(135deg, #fff 0%, #eff6ff 100%)",
                  border: "3px solid #bfdbfe",
                  boxShadow: "0 8px 32px rgba(59,130,246,0.15)",
                  minHeight: 260,
                }}
              >
                <div style={{ fontSize: 18, color: "#888", marginBottom: 8, fontStyle: "italic" }}>
                  {current.meaning}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#3c3c3c", marginBottom: 12, lineHeight: 1.6 }}>
                  {current.explanation}
                </div>
                {current.exampleSentence && (
                  <div
                    className="px-4 py-3 rounded-xl"
                    style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}
                  >
                    <p style={{ fontSize: 13.5, color: "#0c4a6e", fontStyle: "italic", lineHeight: 1.6 }}>
                      "{current.exampleSentence}"
                    </p>
                    {current.exampleTranslation && (
                       <p style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                         {current.exampleTranslation}
                       </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grade buttons (shown only when flipped) */}
          {isFlipped && (
            <div className="w-full max-w-[440px]">
              <p style={{ fontSize: 13, color: "#888", fontWeight: 600, textAlign: "center", marginBottom: 16 }}>
                How well did you remember this word?
              </p>
              <div className="flex gap-4 w-full">
                {GRADE_OPTIONS.map(g => (
                  <button
                    key={g.score}
                    disabled={isSubmitting}
                    onClick={() => handleGrade(g.score)}
                    className="flex-1 flex flex-col items-center justify-center py-4 rounded-2xl cursor-pointer transition-all border-none outline-none shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                    style={{
                      background: g.bg,
                      border: `2px solid ${g.color}40`,
                      boxShadow: `0 4px 0 ${g.color}30`,
                      opacity: isSubmitting ? 0.6 : 1
                    }}
                  >
                    {isSubmitting ? (
                      <Loader2 size={24} className="animate-spin mb-1" style={{ color: g.color }} />
                    ) : null}
                    <span style={{ fontWeight: 800, fontSize: 16, color: g.color, letterSpacing: "-0.01em" }}>
                      {g.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isFlipped && (
            <p style={{ fontSize: 13, color: "#aaa", fontWeight: 500, textAlign: "center" }}>
              Tap the card to see the answer
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
