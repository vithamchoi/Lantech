namespace SWD392.LantechEnglish.Domain.Entities;

public class Flashcard
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid VocabularyId { get; set; }
    public string SourceLanguageCode { get; set; } = string.Empty;
    public double EaseFactor { get; set; }
    public int Interval { get; set; }
    public int Repetition { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? LastReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}