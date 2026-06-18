using SWD392.LantechEnglish.Application.DTOs.LearningPaths;
using SWD392.LantechEnglish.Application.DTOs.Lessons;
using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface ILearningPathService
{
    Task<LearningPathDto?> GetActiveLearningPathAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<LearningPathDto> GenerateLearningPathAsync(Guid userId, CefrLevel level, LevelSource source, List<string> weakSkills, CancellationToken cancellationToken = default);
    Task<IEnumerable<LessonDto>> GetRecommendedLessonsAsync(Guid userId, CancellationToken cancellationToken = default);
}
