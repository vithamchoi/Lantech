import React, { useState, useEffect } from "react";
import { Search, Plus, Volume2, X, Loader2 } from "lucide-react";
import { vocabularyService, VocabularyDto } from "../services/vocabularyService";
import { flashcardService, FlashcardDto } from "../services/flashcardService";
import { toast } from "sonner";
import { useTranslation } from "../hooks/useTranslation";
import { motion, AnimatePresence } from "motion/react";

export default function VocabularyList() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [vocabularies, setVocabularies] = useState<VocabularyDto[]>([]);
  const [selectedWord, setSelectedWord] = useState<VocabularyDto | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [relatedWords, setRelatedWords] = useState<VocabularyDto[]>([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingDeck, setIsTogglingDeck] = useState<Record<string, boolean>>({});
  const [userFlashcards, setUserFlashcards] = useState<FlashcardDto[]>([]);

  const flashcardVocabIds = new Set(userFlashcards.map(fc => fc.vocabularyId));
  const isWordInDeck = (wordId: string) => flashcardVocabIds.has(wordId);

  useEffect(() => {
    const fetchVocabsAndFlashcards = async () => {
      setIsLoading(true);
      try {
        const [vocabData, flashcardsData] = await Promise.all([
          vocabularyService.getVocabularies(undefined, query),
          flashcardService.getFlashcards()
        ]);
        
        setUserFlashcards(flashcardsData);
        
        // Map isInDeck status by checking if the vocabularyId exists in user's flashcards
        const flashcardVocabIds = new Set(flashcardsData.map(fc => fc.vocabularyId));
        const mappedVocabs = vocabData.map(v => ({
          ...v,
          isInDeck: flashcardVocabIds.has(v.id)
        }));
        
        setVocabularies(mappedVocabs);
      } catch (error) {
        toast.error(t("failedToLoadVocabToast"));
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchVocabsAndFlashcards, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [query]);

  // Dynamically extract unique tags from loaded vocabularies
  const tagsTabs = React.useMemo(() => {
    const tagsSet = new Set<string>();
    vocabularies.forEach(v => {
      v.tags?.forEach(t => tagsSet.add(t));
    });
    return ["All", ...Array.from(tagsSet)];
  }, [vocabularies]);

  useEffect(() => {
    if (activeTab !== "All" && !tagsTabs.includes(activeTab)) {
      setActiveTab("All");
    }
  }, [tagsTabs, activeTab]);

  const toggleDeck = async (id: string) => {
    if (isTogglingDeck[id]) return;

    setIsTogglingDeck(prev => ({ ...prev, [id]: true }));
    try {
      const inDeck = isWordInDeck(id);
      if (inDeck) {
        await flashcardService.removeFlashcard(id);
        setUserFlashcards(prev => prev.filter(fc => fc.vocabularyId !== id));
        setVocabularies(prev => prev.map(v => v.id === id ? { ...v, isInDeck: false } : v));
        if (selectedWord?.id === id) setSelectedWord(prev => prev ? { ...prev, isInDeck: false } : null);
        toast.success(t("removedFromDeckToast"));
      } else {
        const newCard = await flashcardService.addFlashcard(id);
        setUserFlashcards(prev => [...prev, newCard]);
        setVocabularies(prev => prev.map(v => v.id === id ? { ...v, isInDeck: true } : v));
        if (selectedWord?.id === id) setSelectedWord(prev => prev ? { ...prev, isInDeck: true } : null);
        toast.success(t("addedToDeckToast"));
      }
    } catch (error) {
      toast.error(t("failedToUpdateDeckToast"));
    } finally {
      setIsTogglingDeck(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleSpeak = (wordText: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(wordText);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!selectedWord) {
      setRelatedWords([]);
      return;
    }
    const fetchRelated = async () => {
      setIsRelatedLoading(true);
      try {
        const data = await vocabularyService.getRelatedVocabularies(selectedWord.id);
        setRelatedWords(data);
      } catch (error) {
        console.error("Failed to load related words:", error);
      } finally {
        setIsRelatedLoading(false);
      }
    };
    fetchRelated();
  }, [selectedWord?.id]);

  const handleSelectWord = (word: VocabularyDto) => {
    setSelectedWord(word);
    setIsPanelOpen(true);
  };

  const handleSelectRelatedWord = (word: VocabularyDto) => {
    setSelectedWord(word);
  };

  const filtered = activeTab === "All"
    ? vocabularies
    : vocabularies.filter(v => v.tags?.includes(activeTab));

  return (
    <div className="flex h-full min-h-screen text-left" style={{ fontFamily: "var(--font-family)", background: "var(--background)", overflowX: "hidden" }}>
      {/* Main list */}
      <div className="flex-1 overflow-y-auto px-8 py-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--foreground)", marginBottom: 4 }}>{t("vocabTitle")}</h1>
            <p style={{ fontSize: 13.5, color: "var(--muted-foreground)" }}>{t("vocabSubtitle")}</p>
          </div>
          <div
            className="px-4 py-2 rounded-full"
            style={{ background: "var(--brand-light)", color: "var(--brand-dark)", fontWeight: 700, fontSize: 13 }}
          >
            {t("inYourDeck", { count: userFlashcards.length.toString() })}
          </div>
        </div>

        {/* Search bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-5"
          style={{ background: "var(--card)", border: "2px solid var(--border)" }}
        >
          <Search size={16} style={{ color: "var(--muted-foreground)", opacity: 0.7, flexShrink: 0 }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t("searchVocab")}
            className="flex-1 outline-none border-none bg-transparent"
            style={{ fontSize: 14, color: "var(--foreground)", fontFamily: "var(--font-family)" }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="cursor-pointer border-none bg-transparent" style={{ color: "var(--muted-foreground)" }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* CEFR tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto relative">
          {tagsTabs.map(tab => {
            const isActive = activeTab === tab;
            return (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab)}
                type="button"
                className={`px-4 py-1.5 rounded-full cursor-pointer shrink-0 relative z-0 outline-none border text-xs font-bold transition-all duration-200 ${
                  isActive ? "text-white border-transparent" : "bg-neutral-100 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-700/60 border-solid text-slate-700 dark:text-neutral-300"
                }`}
                style={{
                  background: "transparent",
                  borderColor: isActive ? "transparent" : "var(--border)",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeVocabularyTabIndicator"
                    className="absolute inset-0 rounded-full -z-10"
                    style={{ background: "var(--brand)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab === "All" ? t("all") : tab}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Word cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {isLoading ? (
            <div className="col-span-2 flex justify-center py-20">
              <Loader2 className="animate-spin" size={40} color="var(--brand)" />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.map((word, i) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28, delay: Math.min(i * 0.03, 0.25) }}
                  whileHover={{ scale: 1.01, y: -1 }}
                  className="rounded-2xl p-5 cursor-pointer transition-all border border-sage dark:border-[#2C3531]"
                  style={{
                    background: "var(--card)",
                    borderWidth: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  }}
                  onClick={() => handleSelectWord(word)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-extrabold text-[17px] text-slate-800 dark:text-neutral-100">{word.word}</div>
                      <div style={{ fontSize: 12, color: "#1CB0F6", fontWeight: 600, marginTop: 2 }}>{word.ipa}</div>
                    </div>
                  </div>
                  <p className="text-[12.5px] text-slate-600 dark:text-neutral-300 leading-relaxed mb-3">{word.definition}</p>
                  <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1.5 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10.5px] font-bold text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-950/40"
                      >
                        {word.cefrLevel}
                      </span>
                      {word.tags?.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-[10.5px] font-bold text-slate-500 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleDeck(word.id)}
                      type="button"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full cursor-pointer transition-all border-none outline-none"
                      style={{
                        background: word.isInDeck ? "var(--brand-light)" : "var(--muted)",
                        color: word.isInDeck ? "var(--brand-dark)" : "var(--muted-foreground)",
                        fontWeight: 700,
                        fontSize: 11.5,
                      }}
                    >
                      {isTogglingDeck[word.id] ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : word.isInDeck ? (
                        <><span>✓</span> {t("inDeck")}</>
                      ) : (
                        <><Plus size={11} /> {t("addToDeck")}</>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="col-span-2 text-center py-16">
              <div style={{ fontSize: 56, marginBottom: 12 }}>😴</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--muted-foreground)" }}>{t("noWordsFound")}</div>
              <div style={{ fontSize: 13, color: "var(--muted-foreground)", opacity: 0.7, marginTop: 4 }}>{t("noWordsFoundSubtitle")}</div>
            </div>
          )}
        </div>
      </div>

      {/* Word detail pane */}
      <AnimatePresence>
        {isPanelOpen && selectedWord && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
              style={{ cursor: "pointer" }}
            />

            {/* Right Slide-out Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed top-0 right-0 h-full bg-white dark:bg-[#1E2522] shadow-2xl z-50 flex flex-col border-l border-sage dark:border-[#2C3531]"
              style={{
                width: 380,
                fontFamily: "var(--font-family)",
              }}
            >
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-extrabold text-2xl text-slate-800 dark:text-neutral-100">{selectedWord.word}</div>
                    <div style={{ fontSize: 13, color: "#1CB0F6", fontWeight: 600, marginTop: 2 }}>{selectedWord.ipa}</div>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="cursor-pointer border-none bg-transparent outline-none p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                    style={{ color: "#aaa" }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Tags Badges */}
                {selectedWord.tags && selectedWord.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedWord.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: "#e0f2fe", color: "#0369a1" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer border-none hover:bg-sky-100 dark:hover:bg-sky-950/20 transition-colors"
                  style={{ background: "#e0f2fe", width: "fit-content" }}
                  onClick={() => handleSpeak(selectedWord.word)}
                >
                  <Volume2 size={14} style={{ color: "#0369a1" }} />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0369a1" }}>{t("listenBtnLabel")}</span>
                </motion.button>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t("definitionLabel")}</div>
                  <p className="text-slate-700 dark:text-neutral-200 text-sm leading-relaxed">{selectedWord.definition}</p>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t("exampleLabelDetail")}</div>
                  <p
                    className="px-4 py-3 rounded-xl border border-sage/40 dark:border-[#2C3531]/40 text-slate-800 dark:text-neutral-200 italic"
                    style={{ fontSize: 13.5, lineHeight: 1.7, background: "var(--background)" }}
                  >
                    "{selectedWord.exampleSentence}"
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t("translationLabelDetail")}</div>
                  <p className="text-slate-600 dark:text-neutral-300 text-sm">{selectedWord.meaning}</p>
                </div>

                <div
                  className="px-3 py-1.5 rounded-full"
                  style={{ background: "#e0f2fe", color: "#0369a1", fontWeight: 700, fontSize: 12, width: "fit-content" }}
                >
                  {t("levelLabelDetail", { level: selectedWord.cefrLevel })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleDeck(selectedWord.id)}
                  type="button"
                  className={`w-full py-3 rounded-xl cursor-pointer border-none outline-none font-bold text-sm text-white transition-all shadow-md ${
                    isWordInDeck(selectedWord.id) ? "btn-3d-secondary" : "btn-3d"
                  }`}
                  style={{
                    background: isWordInDeck(selectedWord.id) ? "#fee2e2" : "var(--brand)",
                    color: isWordInDeck(selectedWord.id) ? "#dc2626" : "#fff",
                  }}
                >
                  {isWordInDeck(selectedWord.id) ? t("removeFromDeck") : t("addToFlashcardDeck")}
                </motion.button>

                {/* Related Words section */}
                <div className="border-t pt-5 mt-2 dark:border-[#2C3531]">
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>{t("relatedWordsTitle")}</div>
                  {isRelatedLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="animate-spin text-slate-400" size={20} />
                    </div>
                  ) : relatedWords.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {relatedWords.map(rw => (
                        <div
                          key={rw.id}
                          onClick={() => handleSelectRelatedWord(rw)}
                          className="p-3 rounded-xl cursor-pointer transition-colors border-2 hover:bg-slate-50 dark:hover:bg-slate-900/40 flex flex-col gap-1 border-sage/40 dark:border-[#2C3531]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-800 dark:text-neutral-100">{rw.word}</span>
                            <span style={{ fontSize: 10.5, color: "#aaa" }}>{rw.ipa}</span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-neutral-400 truncate">{rw.meaning}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">{t("noRelatedWords")}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
