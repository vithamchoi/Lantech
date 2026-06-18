using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.DTOs.LearningPaths;
using SWD392.LantechEnglish.Application.DTOs.Lessons;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class LearningPathsController : ControllerBase
{
    private readonly ILearningPathService _pathService;

    public LearningPathsController(ILearningPathService pathService)
    {
        _pathService = pathService;
    }

    private Guid UserId => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

    public class GenerateManualPathRequest
    {
        [Required]
        public string CefrLevel { get; set; } = "A1";
    }

    /// <summary>
    /// Retrieve the current active learning path / roadmap of the authenticated user
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Active learning path roadmap</returns>
    [HttpGet("active")]
    [ProducesResponseType(typeof(ApiResponse<LearningPathDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetActiveLearningPath(CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var path = await _pathService.GetActiveLearningPathAsync(id, cancellationToken);
        if (path == null) return NotFound(ApiResponse.ErrorResponse("No active learning path found. Please complete the placement assessment."));

        return Ok(ApiResponse<LearningPathDto>.SuccessResponse(path, "Active roadmap fetched successfully"));
    }

    /// <summary>
    /// Get dynamic customized next-lesson study recommendations tailored to the user's weaknesses
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of recommended lessons</returns>
    [HttpGet("recommended-lessons")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LessonDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetRecommendedLessons(CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var list = await _pathService.GetRecommendedLessonsAsync(id, cancellationToken);
        return Ok(ApiResponse<IEnumerable<LessonDto>>.SuccessResponse(list, "Lesson recommendations loaded successfully"));
    }

    /// <summary>
    /// Trigger an override to create a custom study path for a CEFR Level manually
    /// </summary>
    /// <param name="request">CEFR Level parameters</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Newly generated learning path roadmap</returns>
    [HttpPost("generate-manual")]
    [ProducesResponseType(typeof(ApiResponse<LearningPathDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GenerateManualRoadmap([FromBody] GenerateManualPathRequest request, CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        if (!Enum.TryParse<CefrLevel>(request.CefrLevel, true, out var level))
        {
            return BadRequest(ApiResponse.ErrorResponse("Invalid CEFR level. Must be A1, A2, B1, B2, or C1."));
        }

        var path = await _pathService.GenerateLearningPathAsync(id, level, LevelSource.AdminOverride, new List<string>(), cancellationToken);
        return Ok(ApiResponse<LearningPathDto>.SuccessResponse(path, "Custom roadmap generated successfully"));
    }
}
