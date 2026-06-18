namespace SWD392.LantechEnglish.Application.DTOs.Onboarding;

public class OnboardingOptionsDto
{
    public bool CanTakeAssessment { get; set; } = true;
    public bool CanSelfSelectLevel { get; set; } = true;
    public List<string> SupportedLevels { get; set; } = new();
    public List<string> SupportedSkills { get; set; } = new();
    public string Explanation { get; set; } = null!;
}
