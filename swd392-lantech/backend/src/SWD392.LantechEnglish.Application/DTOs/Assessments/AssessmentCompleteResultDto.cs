namespace SWD392.LantechEnglish.Application.DTOs.Assessments;

public class AssessmentCompleteResultDto
{
    public double OverallScore { get; set; }
    public string CefrLevel { get; set; } = null!;
    public Dictionary<string, double> SkillBreakdown { get; set; } = new();
    public List<string> WeakSkills { get; set; } = new();
    public List<string> RecommendedLessons { get; set; } = new();
    public Guid LearningPathId { get; set; }
}
