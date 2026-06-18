using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.DTOs.Pronunciation;
using SWD392.LantechEnglish.Application.Interfaces;
using System.Security.Claims;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class PronunciationController : ControllerBase
{
    private readonly IPronunciationService _pronunciationService;

    public PronunciationController(IPronunciationService pronunciationService)
    {
        _pronunciationService = pronunciationService;
    }

    private Guid UserId => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

    /// <summary>
    /// Submit audio transcription to analyze pronunciation, accuracy, fluency, and completeness
    /// </summary>
    /// <param name="request">Attempt data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Analysis feedback and scores</returns>
    [HttpPost("submit")]
    [ProducesResponseType(typeof(ApiResponse<PronunciationAttemptDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SubmitPronunciation([FromBody] PronunciationAttemptRequest request, CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var result = await _pronunciationService.SubmitAttemptAsync(id, request, cancellationToken);
        return Ok(ApiResponse<PronunciationAttemptDto>.SuccessResponse(result, "Pronunciation assessed successfully"));
    }

    /// <summary>
    /// Retrieve past speech pronunciation practice attempts history
    /// </summary>
    /// <param name="limit">Max number of entries</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>History attempts list</returns>
    [HttpGet("history")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<PronunciationAttemptDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAttemptsHistory([FromQuery] int limit = 10, CancellationToken cancellationToken = default)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var list = await _pronunciationService.GetAttemptsHistoryAsync(id, limit, cancellationToken);
        return Ok(ApiResponse<IEnumerable<PronunciationAttemptDto>>.SuccessResponse(list, "Attempts history fetched"));
    }


    /// <summary>Get pronunciation statistics</summary>
    [HttpGet("stats")]
    public IActionResult GetPronunciationStats() => Ok(new { AverageScore = 85 });

    /// <summary>Get specific pronunciation record</summary>
    [HttpGet("{id:guid}")]
    public IActionResult GetPronunciationRecord(Guid id) => Ok(new { Message = "Record details" });

    /// <summary>
    /// Get all pronunciation practice phrases seeded in the database
    /// </summary>
    [HttpGet("phrases")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<PronunciationPhraseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPhrases(CancellationToken cancellationToken)
    {
        var result = await _pronunciationService.GetPhrasesAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<PronunciationPhraseDto>>.SuccessResponse(result, "Phrases fetched successfully"));
    }

    /// <summary>
    /// Create a new pronunciation practice phrase (Admin only)
    /// </summary>
    [HttpPost("phrases")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<PronunciationPhraseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreatePhrase([FromBody] PronunciationPhraseDto request, CancellationToken cancellationToken)
    {
        var result = await _pronunciationService.CreatePhraseAsync(request, cancellationToken);
        return Ok(ApiResponse<PronunciationPhraseDto>.SuccessResponse(result, "Phrase created successfully"));
    }

    /// <summary>
    /// Update an existing pronunciation practice phrase (Admin only)
    /// </summary>
    [HttpPut("phrases/{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<PronunciationPhraseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdatePhrase(Guid id, [FromBody] PronunciationPhraseDto request, CancellationToken cancellationToken)
    {
        var result = await _pronunciationService.UpdatePhraseAsync(id, request, cancellationToken);
        return Ok(ApiResponse<PronunciationPhraseDto>.SuccessResponse(result, "Phrase updated successfully"));
    }

    /// <summary>
    /// Delete a pronunciation practice phrase (Admin only)
    /// </summary>
    [HttpDelete("phrases/{id:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeletePhrase(Guid id, CancellationToken cancellationToken)
    {
        var result = await _pronunciationService.DeletePhraseAsync(id, cancellationToken);
        if (!result) return NotFound(ApiResponse.ErrorResponse("Phrase not found"));
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Phrase deleted successfully"));
    }
}
