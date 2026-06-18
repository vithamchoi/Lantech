namespace SWD392.LantechEnglish.Application.DTOs.LearningPaths;

public class LearningPathDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string TargetLanguageCode { get; set; } = "en";
    public string SourceLanguageCode { get; set; } = null!;
    public string CefrLevel { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public List<string> RecommendedLessons { get; set; } = new();
    public List<string> WeakSkills { get; set; } = new();
    public string GeneratedFrom { get; set; } = null!;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
