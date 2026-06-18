namespace SWD392.LantechEnglish.Application.DTOs.Flashcards;

public class FlashcardDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid VocabularyId { get; set; }
    public string SourceLanguageCode { get; set; } = null!;
    public double EaseFactor { get; set; }
    public int Interval { get; set; }
    public int Repetition { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? LastReviewedAt { get; set; }
    
    // Front side (English)
    public string Word { get; set; } = null!;
    public string? Ipa { get; set; }
    public string? PartOfSpeech { get; set; }
    public string? ExampleSentence { get; set; }

    // Back side (Native translation)
    public string Meaning { get; set; } = null!;
    public string? Explanation { get; set; }
    public string? ExampleTranslation { get; set; }
}
