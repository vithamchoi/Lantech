using System.ComponentModel.DataAnnotations;

namespace SWD392.LantechEnglish.Application.DTOs.Onboarding;

public class SelfSelectLevelRequest
{
    public string? OverallLevel { get; set; }
    
    public string? TargetLevel { get; set; }
    
    public string? NativeLanguageCode { get; set; }
    
    public string? ListeningLevel { get; set; }
    
    public string? SpeakingLevel { get; set; }
    
    public string? ReadingLevel { get; set; }
    
    public string? WritingLevel { get; set; }

    public string? LearningGoal { get; set; }
    public List<string>? PreferredTopics { get; set; }
}
