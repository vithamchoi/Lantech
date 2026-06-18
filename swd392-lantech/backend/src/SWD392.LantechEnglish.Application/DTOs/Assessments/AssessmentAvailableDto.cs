namespace SWD392.LantechEnglish.Application.DTOs.Assessments;

public class AssessmentAvailableDto
{
    public List<string> SupportedSkills { get; set; } = new();
    public int EstimatedTimeMinutes { get; set; }
    public int QuestionsPerSkill { get; set; }
    public string ScoringMethod { get; set; } = null!;
    public bool CanUseAiGeneratedQuestions { get; set; }
    public bool CanUseSeededQuestionBank { get; set; }
}
