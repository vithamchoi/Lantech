using SWD392.LantechEnglish.Application.DTOs.Vocabulary;
using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface IVocabularyService
{
    Task<IEnumerable<VocabularyDto>> GetVocabularyListAsync(string? level, string? search, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<VocabularyDto?> GetVocabularyByIdAsync(Guid vocabularyId, CancellationToken cancellationToken = default);
    Task<IEnumerable<VocabularyTranslationDto>> GetTranslationsAsync(Guid vocabularyId, CancellationToken cancellationToken = default);
    Task<IEnumerable<VocabularyDto>> SearchVocabularyAsync(string query, CancellationToken cancellationToken = default);
    Task<IEnumerable<VocabularyDto>> GetVocabularyByLevelAsync(CefrLevel level, CancellationToken cancellationToken = default);
    Task<IEnumerable<VocabularyDto>> GetRelatedVocabulariesAsync(Guid vocabularyId, CancellationToken cancellationToken = default);
}
