using SWD392.LantechEnglish.Application.DTOs.Pronunciation;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface IPronunciationService
{
    Task<PronunciationAttemptDto> SubmitAttemptAsync(Guid userId, PronunciationAttemptRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<PronunciationAttemptDto>> GetAttemptsHistoryAsync(Guid userId, int limit, CancellationToken cancellationToken = default);
}
