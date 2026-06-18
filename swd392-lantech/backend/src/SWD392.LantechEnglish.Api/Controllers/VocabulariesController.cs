using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.DTOs.Vocabulary;
using SWD392.LantechEnglish.Application.Interfaces;
using System.Security.Claims;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class VocabulariesController : ControllerBase
{
    private readonly IVocabularyService _vocabService;

    public VocabulariesController(IVocabularyService vocabService)
    {
        _vocabService = vocabService;
    }

    private Guid UserId => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

    /// <summary>
    /// Retrieve vocabulary terms matching a CEFR Level
    /// </summary>
    /// <param name="level">A1, A2, B1, B2, C1</param>
    /// <param name="search">Search query term</param>
    /// <param name="page">Page index (default 1)</param>
    /// <param name="pageSize">Page size (default 20)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paged list of vocabularies</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<VocabularyDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetVocabularies([FromQuery] string? level, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var list = await _vocabService.GetVocabularyListAsync(level, search, page, pageSize, cancellationToken);
        return Ok(ApiResponse<IEnumerable<VocabularyDto>>.SuccessResponse(list, "Vocabularies fetched successfully"));
    }

    /// <summary>
    /// Get details and native translations for a specific vocabulary word
    /// </summary>
    /// <param name="id">Vocabulary GUID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Vocabulary details</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<VocabularyDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVocabularyById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var uid = UserId;
        if (uid == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var vocab = await _vocabService.GetVocabularyByIdAsync(id, cancellationToken);
        if (vocab == null) return NotFound(ApiResponse.ErrorResponse("Vocabulary not found"));

        return Ok(ApiResponse<VocabularyDto>.SuccessResponse(vocab));
    }

    /// <summary>
    /// Get related vocabularies sharing the same tags
    /// </summary>
    [HttpGet("{id:guid}/related")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<VocabularyDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetRelatedVocabularies([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var uid = UserId;
        if (uid == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var list = await _vocabService.GetRelatedVocabulariesAsync(id, cancellationToken);
        return Ok(ApiResponse<IEnumerable<VocabularyDto>>.SuccessResponse(list, "Related vocabularies fetched successfully"));
    }


    /// <summary>Get vocabulary translations</summary>
    [HttpGet("{id:guid}/translations")]
    public IActionResult GetVocabularyTranslations(Guid id) => Ok(new object[] { });


    /// <summary>Get vocabularies by level</summary>
    [HttpGet("by-level/{level}")]
    public IActionResult GetVocabulariesByLevel(string level) => Ok(new object[] { });

    /// <summary>Search vocabularies</summary>
    [HttpGet("search")]
    public IActionResult SearchVocabularies([FromQuery] string q) => Ok(new object[] { });
}
