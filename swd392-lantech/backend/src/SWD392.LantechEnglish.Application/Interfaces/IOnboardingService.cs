using SWD392.LantechEnglish.Application.DTOs.Onboarding;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface IOnboardingService
{
    Task<OnboardingOptionsDto> GetOnboardingOptionsAsync(CancellationToken cancellationToken = default);
    Task<OnboardingResultDto> SelfSelectLevelAsync(Guid userId, SelfSelectLevelRequest request, CancellationToken cancellationToken = default);
    Task<UserSkillProfileDto?> GetMyLevelProfileAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<OnboardingResultDto> RegenerateLearningPathAsync(Guid userId, CancellationToken cancellationToken = default);
}
