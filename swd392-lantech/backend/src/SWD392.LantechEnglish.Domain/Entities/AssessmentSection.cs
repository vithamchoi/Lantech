using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Domain.Entities;

public class AssessmentSection
{
    public Guid Id { get; set; }
    public Guid AssessmentId { get; set; }
    public SkillType Skill { get; set; }
    public double? Score { get; set; }
    public double MaxScore { get; set; }
    public string? Feedback { get; set; }
    public DateTime CreatedAt { get; set; }
}