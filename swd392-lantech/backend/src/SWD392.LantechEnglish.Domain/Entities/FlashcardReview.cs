namespace SWD392.LantechEnglish.Domain.Entities;

public class FlashcardReview
{
    public Guid Id { get; set; }
    public Guid FlashcardId { get; set; }
    public Guid UserId { get; set; }
    public int Quality { get; set; }
    public int OldInterval { get; set; }
    public int NewInterval { get; set; }
    public double OldEaseFactor { get; set; }
    public double NewEaseFactor { get; set; }
    public DateTime ReviewedAt { get; set; }
}