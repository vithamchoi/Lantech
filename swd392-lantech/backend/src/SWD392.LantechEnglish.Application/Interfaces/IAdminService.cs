using SWD392.LantechEnglish.Application.DTOs.Admin;
using SWD392.LantechEnglish.Application.DTOs.Exercises;
using SWD392.LantechEnglish.Application.DTOs.Lessons;
using SWD392.LantechEnglish.Application.DTOs.Vocabulary;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface IAdminService
{
    Task<AdminStatsDto> GetOverviewStatsAsync(CancellationToken cancellationToken = default);

    // Users
    Task<IEnumerable<AdminUserDto>> GetUsersAsync(CancellationToken cancellationToken = default);
    Task<bool> UpdateUserRoleAsync(Guid id, string role, CancellationToken cancellationToken = default);
    Task<bool> UpdateUserStatusAsync(Guid id, string status, CancellationToken cancellationToken = default);

    // Lessons
    Task<IEnumerable<AdminLessonDto>> GetLessonsAsync(CancellationToken cancellationToken = default);
    Task<LessonDto> CreateLessonAsync(CreateLessonRequest request, CancellationToken cancellationToken = default);
    Task<LessonDto> UpdateLessonAsync(Guid id, CreateLessonRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteLessonAsync(Guid id, CancellationToken cancellationToken = default);

    // Exercises
    Task<IEnumerable<AdminQuestionDto>> GetQuestionsAsync(CancellationToken cancellationToken = default);
    Task<ExerciseDto> CreateExerciseAsync(CreateExerciseRequest request, CancellationToken cancellationToken = default);
    Task<ExerciseDto> UpdateExerciseAsync(Guid id, CreateExerciseRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteExerciseAsync(Guid id, CancellationToken cancellationToken = default);

    // Vocabulary
    Task<IEnumerable<AdminVocabularyDto>> GetVocabulariesAsync(CancellationToken cancellationToken = default);
    Task<VocabularyDto> CreateVocabularyAsync(CreateVocabularyRequest request, CancellationToken cancellationToken = default);
    Task<VocabularyDto> UpdateVocabularyAsync(Guid id, CreateVocabularyRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteVocabularyAsync(Guid id, CancellationToken cancellationToken = default);
    
    // Badges
    Task<IEnumerable<AdminBadgeDto>> GetBadgesAsync(CancellationToken cancellationToken = default);
}
