namespace SWD392.LantechEnglish.Application.DTOs.Flashcards;

public class FlashcardReviewDto
{
    public Guid Id { get; set; }
    public Guid FlashcardId { get; set; }
    public int Quality { get; set; }
    public int OldInterval { get; set; }
    public int NewInterval { get; set; }
    public double OldEaseFactor { get; set; }
    public double NewEaseFactor { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime ReviewedAt { get; set; }
}
