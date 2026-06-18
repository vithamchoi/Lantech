using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.DTOs.Exercises;
using SWD392.LantechEnglish.Application.Interfaces;
using System.Security.Claims;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class ExercisesController : ControllerBase
{
    private readonly IExerciseService _exerciseService;

    public ExercisesController(IExerciseService exerciseService)
    {
        _exerciseService = exerciseService;
    }

    private Guid UserId => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

    /// <summary>
    /// Retrieve all exercises belonging to a specific lesson
    /// </summary>
    /// <param name="lessonId">Lesson GUID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of exercises</returns>
    [HttpGet("lesson/{lessonId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ExerciseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetExercisesByLesson([FromRoute] Guid lessonId, CancellationToken cancellationToken)
    {
        var list = await _exerciseService.GetExercisesByLessonIdAsync(lessonId, cancellationToken);
        return Ok(ApiResponse<IEnumerable<ExerciseDto>>.SuccessResponse(list, "Exercises fetched successfully"));
    }

    /// <summary>
    /// Get details of a specific exercise
    /// </summary>
    /// <param name="id">Exercise GUID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Exercise details</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ExerciseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetExerciseById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var ex = await _exerciseService.GetExerciseByIdAsync(id, cancellationToken);
        if (ex == null) return NotFound(ApiResponse.ErrorResponse("Exercise not found"));

        return Ok(ApiResponse<ExerciseDto>.SuccessResponse(ex));
    }

    /// <summary>
    /// Submit user's answer for an exercise to check correctness, calculate scores, and award XP
    /// </summary>
    /// <param name="id">Exercise GUID</param>
    /// <param name="request">Answer text</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Grading score and feedback</returns>
    [HttpPost("{id:guid}/submit")]
    [ProducesResponseType(typeof(ApiResponse<ExerciseAttemptDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitExercise([FromRoute] Guid id, [FromBody] SubmitExerciseRequest request, CancellationToken cancellationToken)
    {
        var uid = UserId;
        if (uid == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        try
        {
            var result = await _exerciseService.SubmitExerciseAttemptAsync(id, uid, request, cancellationToken);
            return Ok(ApiResponse<ExerciseAttemptDto>.SuccessResponse(result, "Exercise attempt submitted"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }


    /// <summary>Get exercise history</summary>
    [HttpGet("history")]
    public IActionResult GetExerciseHistory() => Ok(new object[] { });

    /// <summary>Get specific exercise history</summary>
    [HttpGet("history/{id:guid}")]
    public IActionResult GetSpecificExerciseHistory(Guid id) => Ok(new { Message = "History details" });

}
