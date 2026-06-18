using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.DTOs.Assessments;
using SWD392.LantechEnglish.Application.Interfaces;
using System.Security.Claims;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class AssessmentsController : ControllerBase
{
    private readonly IAssessmentService _assessmentService;

    public AssessmentsController(IAssessmentService assessmentService)
    {
        _assessmentService = assessmentService;
    }

    private Guid UserId => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

    /// <summary>
    /// Check details about available diagnostic assessments (skills covered, estimated times)
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Assessment specification</returns>
    [HttpGet("info")]
    [ProducesResponseType(typeof(ApiResponse<AssessmentAvailableDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInfo(CancellationToken cancellationToken)
    {
        var info = await _assessmentService.GetAvailableAssessmentAsync(cancellationToken);
        return Ok(ApiResponse<AssessmentAvailableDto>.SuccessResponse(info));
    }

    /// <summary>
    /// Create a new diagnostic placement assessment or fetch an in-progress one
    /// </summary>
    /// <param name="request">Source language configurations</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Active assessment with questions list</returns>
    [HttpPost("start")]
    [ProducesResponseType(typeof(ApiResponse<AssessmentDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Start([FromBody] StartAssessmentRequest request, CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var detail = await _assessmentService.StartAssessmentAsync(id, request, cancellationToken);
        return Ok(ApiResponse<AssessmentDetailDto>.SuccessResponse(detail, "Assessment started successfully"));
    }

    /// <summary>
    /// Get full details, questions, and scores of an assessment
    /// </summary>
    /// <param name="id">Assessment GUID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Assessment detail Dto</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<AssessmentDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var detail = await _assessmentService.GetAssessmentDetailAsync(id, cancellationToken);
            return Ok(ApiResponse<AssessmentDetailDto>.SuccessResponse(detail));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Submit answers for the Listening section (graded objectively)
    /// </summary>
    /// <param name="id">Assessment GUID</param>
    /// <param name="request">List of question answers</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Section score result</returns>
    [HttpPost("{id:guid}/listening")]
    [ProducesResponseType(typeof(ApiResponse<SubmitResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitListening([FromRoute] Guid id, [FromBody] SubmitAnswersRequest request, CancellationToken cancellationToken)
    {
        var uid = UserId;
        try
        {
            var res = await _assessmentService.SubmitListeningAnswersAsync(id, uid, request, cancellationToken);
            return Ok(ApiResponse<SubmitResultDto>.SuccessResponse(res, "Listening section answers submitted"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Submit answers for the Reading section (graded objectively)
    /// </summary>
    /// <param name="id">Assessment GUID</param>
    /// <param name="request">List of question answers</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Section score result</returns>
    [HttpPost("{id:guid}/reading")]
    [ProducesResponseType(typeof(ApiResponse<SubmitResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitReading([FromRoute] Guid id, [FromBody] SubmitAnswersRequest request, CancellationToken cancellationToken)
    {
        var uid = UserId;
        try
        {
            var res = await _assessmentService.SubmitReadingAnswersAsync(id, uid, request, cancellationToken);
            return Ok(ApiResponse<SubmitResultDto>.SuccessResponse(res, "Reading section answers submitted"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Submit essay writing responses (graded dynamically using mock AI)
    /// </summary>
    /// <param name="id">Assessment GUID</param>
    /// <param name="request">Writing prompts and essays text</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Section score result</returns>
    [HttpPost("{id:guid}/writing")]
    [ProducesResponseType(typeof(ApiResponse<SubmitResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitWriting([FromRoute] Guid id, [FromBody] SubmitAnswersRequest request, CancellationToken cancellationToken)
    {
        var uid = UserId;
        try
        {
            var res = await _assessmentService.SubmitWritingAnswersAsync(id, uid, request, cancellationToken);
            return Ok(ApiResponse<SubmitResultDto>.SuccessResponse(res, "Writing section responses submitted"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Submit speaking recording transcripts (analyzed dynamically using mock Speech AI)
    /// </summary>
    /// <param name="id">Assessment GUID</param>
    /// <param name="request">Speaking prompts and transcription transcripts</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Section score result</returns>
    [HttpPost("{id:guid}/speaking")]
    [ProducesResponseType(typeof(ApiResponse<SubmitResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitSpeaking([FromRoute] Guid id, [FromBody] SubmitAnswersRequest request, CancellationToken cancellationToken)
    {
        var uid = UserId;
        try
        {
            var res = await _assessmentService.SubmitSpeakingAnswersAsync(id, uid, request, cancellationToken);
            return Ok(ApiResponse<SubmitResultDto>.SuccessResponse(res, "Speaking section recordings submitted"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Finalize placement test, calculate overall score, assign CEFR level, award XP, and generate study roadmap
    /// </summary>
    /// <param name="id">Assessment GUID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Test result report card</returns>
    [HttpPost("{id:guid}/complete")]
    [ProducesResponseType(typeof(ApiResponse<AssessmentCompleteResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Complete([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var uid = UserId;
        try
        {
            var res = await _assessmentService.CompleteAssessmentAsync(id, uid, cancellationToken);
            return Ok(ApiResponse<AssessmentCompleteResultDto>.SuccessResponse(res, "Assessment completed and graded. Study roadmap is active!"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Retrieve past placement test attempts history
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>History attempts list</returns>
    [HttpGet("history")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<AssessmentDetailDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetHistory(CancellationToken cancellationToken)
    {
        var uid = UserId;
        if (uid == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var list = await _assessmentService.GetAssessmentHistoryAsync(uid, cancellationToken);
        return Ok(ApiResponse<IEnumerable<AssessmentDetailDto>>.SuccessResponse(list, "Assessment history fetched"));
    }

    /// <summary>
    /// Retrieve the score details of the most recent completed assessment
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result details</returns>
    [HttpGet("latest-result")]
    [ProducesResponseType(typeof(ApiResponse<AssessmentCompleteResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLatestResult(CancellationToken cancellationToken)
    {
        var uid = UserId;
        if (uid == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var res = await _assessmentService.GetLatestAssessmentResultAsync(uid, cancellationToken);
        if (res == null) return NotFound(ApiResponse.ErrorResponse("No completed assessment found."));

        return Ok(ApiResponse<AssessmentCompleteResultDto>.SuccessResponse(res));
    }


    /// <summary>Get active assessment</summary>


    /// <summary>Get assessment report</summary>
    /// <summary>Get assessment questions</summary>
    [HttpGet("{id:guid}/questions")]
    public IActionResult GetAssessmentQuestions(Guid id) => Ok(new object[] { });

}
