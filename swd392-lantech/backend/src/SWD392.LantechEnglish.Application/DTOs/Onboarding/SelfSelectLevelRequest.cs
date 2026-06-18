using System.ComponentModel.DataAnnotations;

namespace SWD392.LantechEnglish.Application.DTOs.Onboarding;

public class SelfSelectLevelRequest
{
    [Required]
    public string OverallLevel { get; set; } = null!;
    
    [Required]
    public string ListeningLevel { get; set; } = null!;
    
    [Required]
    public string SpeakingLevel { get; set; } = null!;
    
    [Required]
    public string ReadingLevel { get; set; } = null!;
    
    [Required]
    public string WritingLevel { get; set; } = null!;

    public string? LearningGoal { get; set; }
    public List<string>? PreferredTopics { get; set; }
}
