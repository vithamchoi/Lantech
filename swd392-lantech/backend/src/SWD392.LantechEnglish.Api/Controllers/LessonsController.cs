using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.DTOs.Lessons;
using SWD392.LantechEnglish.Application.Interfaces;
using System.Security.Claims;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class LessonsController : ControllerBase
{
    private readonly ILessonService _lessonService;

    public LessonsController(ILessonService lessonService)
    {
        _lessonService = lessonService;
    }

    private Guid UserId => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

    /// <summary>
    /// Retrieve list of lessons matching a specific CEFR Level and Skill
    /// </summary>
    /// <param name="level">A1, A2, B1, B2, C1</param>
    /// <param name="skill">Listening, Speaking, Reading, Writing</param>
    /// <param name="page">Page number (default 1)</param>
    /// <param name="pageSize">Page size (default 10)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paged list of lessons</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LessonDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetLessons([FromQuery] string? level, [FromQuery] string? skill, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var list = await _lessonService.GetLessonsAsync(level, skill, page, pageSize, id, cancellationToken);
        return Ok(ApiResponse<IEnumerable<LessonDto>>.SuccessResponse(list, "Lessons loaded successfully"));
    }

    /// <summary>
    /// Fetch details of a specific lesson, including the user's progress
    /// </summary>
    /// <param name="id">Lesson GUID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Lesson details</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<LessonDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLessonById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var uid = UserId;
        if (uid == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var lesson = await _lessonService.GetLessonByIdAsync(id, uid, cancellationToken);
        if (lesson == null) return NotFound(ApiResponse.ErrorResponse("Lesson not found"));

        return Ok(ApiResponse<LessonDto>.SuccessResponse(lesson));
    }

    /// <summary>
    /// Set a lesson's status to InProgress
    /// </summary>
    /// <param name="id">Lesson GUID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated lesson details</returns>
    [HttpPost("{id:guid}/start")]
    [ProducesResponseType(typeof(ApiResponse<LessonDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> StartLesson([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var uid = UserId;
        if (uid == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        try
        {
            var res = await _lessonService.StartLessonAsync(id, uid, cancellationToken);
            return Ok(ApiResponse<LessonDto>.SuccessResponse(res, "Lesson status set to InProgress"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Complete a lesson, update user streak, award XP and unlocked badges
    /// </summary>
    /// <param name="id">Lesson GUID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completed lesson details</returns>
    [HttpPost("{id:guid}/complete")]
    [ProducesResponseType(typeof(ApiResponse<LessonDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CompleteLesson([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var uid = UserId;
        if (uid == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        try
        {
            var res = await _lessonService.CompleteLessonAsync(id, uid, cancellationToken);
            return Ok(ApiResponse<LessonDto>.SuccessResponse(res, "Lesson completed successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }


    /// <summary>Get lesson progress</summary>
    [HttpGet("{id:guid}/progress")]
    public IActionResult GetLessonProgress(Guid id) => Ok(new { Status = "InProgress" });

    /// <summary>Get recommended lessons</summary>
    [HttpGet("recommended")]
    public IActionResult GetRecommendedLessons() => Ok(new object[] { });

}
