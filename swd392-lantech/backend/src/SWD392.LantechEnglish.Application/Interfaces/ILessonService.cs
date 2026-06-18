using SWD392.LantechEnglish.Application.DTOs.Lessons;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface ILessonService
{
    Task<IEnumerable<LessonDto>> GetLessonsAsync(string? level, string? skill, int page, int pageSize, Guid userId, CancellationToken cancellationToken = default);
    Task<LessonDto?> GetLessonByIdAsync(Guid lessonId, Guid userId, CancellationToken cancellationToken = default);
    Task<LessonDto> StartLessonAsync(Guid lessonId, Guid userId, CancellationToken cancellationToken = default);
    Task<LessonDto> CompleteLessonAsync(Guid lessonId, Guid userId, CancellationToken cancellationToken = default);
}
