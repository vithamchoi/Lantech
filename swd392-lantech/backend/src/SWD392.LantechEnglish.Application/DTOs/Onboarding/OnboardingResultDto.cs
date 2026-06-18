using SWD392.LantechEnglish.Application.DTOs.LearningPaths;

namespace SWD392.LantechEnglish.Application.DTOs.Onboarding;

public class OnboardingResultDto
{
    public UserSkillProfileDto Profile { get; set; } = null!;
    public LearningPathDto LearningPath { get; set; } = null!;
}
