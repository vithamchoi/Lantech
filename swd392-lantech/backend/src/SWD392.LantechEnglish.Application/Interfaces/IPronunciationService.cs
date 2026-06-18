using SWD392.LantechEnglish.Application.DTOs.Pronunciation;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface IPronunciationService
{
    Task<PronunciationAttemptDto> SubmitAttemptAsync(Guid userId, PronunciationAttemptRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<PronunciationAttemptDto>> GetAttemptsHistoryAsync(Guid userId, int limit, CancellationToken cancellationToken = default);
    Task<IEnumerable<PronunciationPhraseDto>> GetPhrasesAsync(CancellationToken cancellationToken = default);
    Task<PronunciationPhraseDto> CreatePhraseAsync(PronunciationPhraseDto dto, CancellationToken cancellationToken = default);
    Task<PronunciationPhraseDto> UpdatePhraseAsync(Guid id, PronunciationPhraseDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeletePhraseAsync(Guid id, CancellationToken cancellationToken = default);
}
