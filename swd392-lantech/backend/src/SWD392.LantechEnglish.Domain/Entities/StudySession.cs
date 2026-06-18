namespace SWD392.LantechEnglish.Domain.Entities;

public class StudySession
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int DurationSeconds { get; set; }
    public int XpEarned { get; set; }
    public int LessonsCompleted { get; set; }
}