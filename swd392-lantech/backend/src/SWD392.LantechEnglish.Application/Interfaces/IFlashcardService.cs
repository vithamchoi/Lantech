using SWD392.LantechEnglish.Application.DTOs.Flashcards;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface IFlashcardService
{
    Task<IEnumerable<FlashcardDto>> GetFlashcardsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<FlashcardDto>> GetDueFlashcardsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<FlashcardDto?> GetFlashcardByIdAsync(Guid flashcardId, Guid userId, CancellationToken cancellationToken = default);
    Task<FlashcardDto> CreateFlashcardFromVocabularyAsync(Guid userId, Guid vocabularyId, CancellationToken cancellationToken = default);
    Task RemoveFlashcardAsync(Guid userId, Guid flashcardId, CancellationToken cancellationToken = default);
    Task<FlashcardReviewDto> ReviewFlashcardAsync(Guid flashcardId, Guid userId, ReviewFlashcardRequest request, CancellationToken cancellationToken = default);
}
