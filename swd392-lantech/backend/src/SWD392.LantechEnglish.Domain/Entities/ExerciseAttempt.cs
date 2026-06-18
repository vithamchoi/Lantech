namespace SWD392.LantechEnglish.Domain.Entities;

public class ExerciseAttempt
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ExerciseId { get; set; }
    public string? AnswerJson { get; set; }
    public bool IsCorrect { get; set; }
    public double Score { get; set; }
    public string? Feedback { get; set; }
    public DateTime CreatedAt { get; set; }
}