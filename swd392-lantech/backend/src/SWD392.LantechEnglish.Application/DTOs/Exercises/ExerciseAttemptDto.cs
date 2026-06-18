namespace SWD392.LantechEnglish.Application.DTOs.Exercises;

public class ExerciseAttemptDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ExerciseId { get; set; }
    public string Answer { get; set; } = null!;
    public bool IsCorrect { get; set; }
    public double Score { get; set; }
    public string? Feedback { get; set; }
    public DateTime CreatedAt { get; set; }
}
