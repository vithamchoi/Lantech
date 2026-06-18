using SWD392.LantechEnglish.Application.DTOs.Exercises;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface IExerciseService
{
    Task<ExerciseDto?> GetExerciseByIdAsync(Guid exerciseId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ExerciseDto>> GetExercisesByLessonIdAsync(Guid lessonId, CancellationToken cancellationToken = default);
    Task<ExerciseAttemptDto> SubmitExerciseAttemptAsync(Guid exerciseId, Guid userId, SubmitExerciseRequest request, CancellationToken cancellationToken = default);
}
