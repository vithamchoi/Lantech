import React, { useState, useEffect } from "react";
import { Search, Plus, Volume2, X, Loader2 } from "lucide-react";
import { vocabularyService, VocabularyDto } from "../services/vocabularyService";
import { flashcardService, FlashcardDto } from "../services/flashcardService";
import { toast } from "sonner";

const CEFR_TABS = ["All", "A1", "A2", "B1", "B2", "C1", "C2"] as const;
type CefrTab = typeof CEFR_TABS[number];

export default function VocabularyList() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<CefrTab>("All");
  const [vocabularies, setVocabularies] = useState<VocabularyDto[]>([]);
  const [selectedWord, setSelectedWord] = useState<VocabularyDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingDeck, setIsTogglingDeck] = useState<Record<string, boolean>>({});
  const [userFlashcards, setUserFlashcards] = useState<FlashcardDto[]>([]);

  useEffect(() => {
    const fetchVocabsAndFlashcards = async () => {
      setIsLoading(true);
      try {
        const [vocabData, flashcardsData] = await Promise.all([
          vocabularyService.getVocabularies(activeTab, query),
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
        toast.error("Failed to load vocabulary list");
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchVocabsAndFlashcards, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [activeTab, query]);

  const toggleDeck = async (id: string) => {
    const word = vocabularies.find(v => v.id === id);
    if (!word || isTogglingDeck[id]) return;

    setIsTogglingDeck(prev => ({ ...prev, [id]: true }));
    try {
      if (word.isInDeck) {
        await flashcardService.removeFlashcard(id);
        setVocabularies(prev => prev.map(v => v.id === id ? { ...v, isInDeck: false } : v));
        if (selectedWord?.id === id) setSelectedWord(prev => prev ? { ...prev, isInDeck: false } : null);
        toast.success("Removed from your flashcard deck!");
      } else {
        await flashcardService.addFlashcard(id);
        setVocabularies(prev => prev.map(v => v.id === id ? { ...v, isInDeck: true } : v));
        if (selectedWord?.id === id) setSelectedWord(prev => prev ? { ...prev, isInDeck: true } : null);
        toast.success("Added to your flashcard deck!");
      }
    } catch (error) {
      toast.error("Failed to update deck");
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

  const filtered = vocabularies;
  const deckState = Object.fromEntries(vocabularies.map(v => [v.id, v.isInDeck]));

  return (
    <div className="flex h-full min-h-screen text-left" style={{ fontFamily: "var(--font-family)", background: "var(--background)" }}>
      {/* Main list */}
      <div className="flex-1 overflow-y-auto px-8 py-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--foreground)", marginBottom: 4 }}>Vocabulary Desk</h1>
            <p style={{ fontSize: 13.5, color: "var(--muted-foreground)" }}>Browse, search, and add words to your flashcard deck</p>
          </div>
          <div
            className="px-4 py-2 rounded-full"
            style={{ background: "var(--brand-light)", color: "var(--brand-dark)", fontWeight: 700, fontSize: 13 }}
          >
            {Object.values(deckState).filter(Boolean).length} in your deck
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
            placeholder="Search vocabulary..."
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
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {CEFR_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
              className="px-4 py-1.5 rounded-full cursor-pointer shrink-0 transition-all outline-none border-none"
              style={{
                background: activeTab === tab ? "var(--brand)" : "var(--card)",
                color: activeTab === tab ? "#fff" : "var(--muted-foreground)",
                fontWeight: 700,
                fontSize: 13,
                border: activeTab === tab ? "2px solid var(--brand)" : "2px solid var(--border)",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Word cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {isLoading ? (
            <div className="col-span-2 flex justify-center py-20">
              <Loader2 className="animate-spin" size={40} color="var(--brand)" />
            </div>
          ) : filtered.map(word => (
            <div
              key={word.id}
              className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01]"
              style={{
                background: "var(--card)",
                border: "2px solid var(--border)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
              onClick={() => setSelectedWord(word)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "var(--foreground)" }}>{word.word}</div>
                  <div style={{ fontSize: 12, color: "#1CB0F6", fontWeight: 600, marginTop: 2 }}>{word.ipa}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full"
                    style={{ background: "#e0f2fe", color: "#0369a1", fontSize: 11, fontWeight: 700 }}
                  >
                    {word.cefrLevel}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", lineHeight: 1.6, marginBottom: 12 }}>{word.definition}</p>
              <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
                <div className="flex gap-1.5">
                  {word.tags?.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full"
                      style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontSize: 10.5, fontWeight: 600 }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
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
                    <><span>✓</span> In Deck</>
                  ) : (
                    <><Plus size={11} /> Add to Deck</>
                  )}
                </button>
              </div>
            </div>
          ))}

          {!isLoading && filtered.length === 0 && (
            <div className="col-span-2 text-center py-16">
              <div style={{ fontSize: 56, marginBottom: 12 }}>😴</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--muted-foreground)" }}>No words found</div>
              <div style={{ fontSize: 13, color: "var(--muted-foreground)", opacity: 0.7, marginTop: 4 }}>Try a different search or level filter</div>
            </div>
          )}
        </div>
      </div>

      {/* Word detail pane */}
      {selectedWord && (
        <div
          className="shrink-0 border-l overflow-y-auto p-6 flex flex-col gap-5 transition-all duration-300"
          style={{ width: 300, background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div style={{ fontWeight: 900, fontSize: 24, color: "var(--foreground)" }}>{selectedWord.word}</div>
              <div style={{ fontSize: 13, color: "#1CB0F6", fontWeight: 600, marginTop: 2 }}>{selectedWord.ipa}</div>
            </div>
            <button onClick={() => setSelectedWord(null)} className="cursor-pointer border-none bg-transparent outline-none" style={{ color: "var(--muted-foreground)" }}>
              <X size={18} />
            </button>
          </div>

          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer hover:bg-sky-100 transition-colors"
            style={{ background: "#e0f2fe", width: "fit-content" }}
            onClick={() => handleSpeak(selectedWord.word)}
          >
            <Volume2 size={14} style={{ color: "#0369a1" }} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0369a1" }}>Listen</span>
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted-foreground)", opacity: 0.7, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Definition</div>
            <p style={{ fontSize: 14, color: "var(--foreground)", lineHeight: 1.7 }}>{selectedWord.definition}</p>
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted-foreground)", opacity: 0.7, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Example</div>
            <p
              className="px-4 py-3 rounded-xl"
              style={{ fontSize: 13.5, color: "var(--foreground)", lineHeight: 1.7, background: "var(--muted)", fontStyle: "italic" }}
            >
              "{selectedWord.exampleSentence}"
            </p>
          </div>

          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted-foreground)", opacity: 0.7, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Vietnamese</div>
            <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>{selectedWord.meaning}</p>
          </div>

          <div
            className="px-3 py-1.5 rounded-full"
            style={{ background: "#e0f2fe", color: "#0369a1", fontWeight: 700, fontSize: 12, width: "fit-content" }}
          >
            {selectedWord.cefrLevel} Level
          </div>

          <button
            onClick={() => toggleDeck(selectedWord.id)}
            type="button"
            className="w-full py-3 rounded-xl cursor-pointer border-none outline-none font-bold text-sm text-white transition-all shadow-md"
            style={{
              background: deckState[selectedWord.id] ? "#fee2e2" : "var(--brand)",
              color: deckState[selectedWord.id] ? "#dc2626" : "#fff",
            }}
          >
            {deckState[selectedWord.id] ? "Remove from Deck" : "Add to Flashcard Deck"}
          </button>
        </div>
      )}
    </div>
  );
}
