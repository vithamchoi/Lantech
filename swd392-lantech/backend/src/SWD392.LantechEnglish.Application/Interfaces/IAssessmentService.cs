using SWD392.LantechEnglish.Application.DTOs.Assessments;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface IAssessmentService
{
    Task<AssessmentAvailableDto> GetAvailableAssessmentAsync(CancellationToken cancellationToken = default);
    Task<AssessmentDetailDto> StartAssessmentAsync(Guid userId, StartAssessmentRequest request, CancellationToken cancellationToken = default);
    Task<AssessmentDetailDto> GetAssessmentDetailAsync(Guid assessmentId, CancellationToken cancellationToken = default);
    Task<Dictionary<string, List<AssessmentQuestionDto>>> GetAssessmentQuestionsBySkillAsync(Guid assessmentId, CancellationToken cancellationToken = default);
    Task<SubmitResultDto> SubmitListeningAnswersAsync(Guid assessmentId, Guid userId, SubmitAnswersRequest request, CancellationToken cancellationToken = default);
    Task<SubmitResultDto> SubmitReadingAnswersAsync(Guid assessmentId, Guid userId, SubmitAnswersRequest request, CancellationToken cancellationToken = default);
    Task<SubmitResultDto> SubmitWritingAnswersAsync(Guid assessmentId, Guid userId, SubmitAnswersRequest request, CancellationToken cancellationToken = default);
    Task<SubmitResultDto> SubmitSpeakingAnswersAsync(Guid assessmentId, Guid userId, SubmitAnswersRequest request, CancellationToken cancellationToken = default);
    Task<AssessmentCompleteResultDto> CompleteAssessmentAsync(Guid assessmentId, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<AssessmentDetailDto>> GetAssessmentHistoryAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<AssessmentCompleteResultDto?> GetLatestAssessmentResultAsync(Guid userId, CancellationToken cancellationToken = default);
}
