using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.DTOs.Auth;
using SWD392.LantechEnglish.Application.DTOs.Users;
using SWD392.LantechEnglish.Application.Interfaces;
using System.Security.Claims;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IUserService _userService;

    public ProfileController(IUserService userService)
    {
        _userService = userService;
    }

    private Guid UserId => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

    /// <summary>
    /// Retrieve study statistical summaries, streak counts, flashcards reviews completed, and XP milestones
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Study stats summary</returns>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<StudySummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var summary = await _userService.GetStudySummaryAsync(id, cancellationToken);
        return Ok(ApiResponse<StudySummaryDto>.SuccessResponse(summary, "Profile statistical summary fetched"));
    }

    /// <summary>
    /// Update user profile details (fullname, avatar url)
    /// </summary>
    /// <param name="request">Update data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated profile details</returns>
    [HttpPut]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        try
        {
            var res = await _userService.UpdateProfileAsync(id, request, cancellationToken);
            return Ok(ApiResponse<UserDto>.SuccessResponse(res, "Profile updated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Update user source language for native translations
    /// </summary>
    /// <param name="sourceLanguageCode">Native language code (e.g. vi)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated profile details</returns>
    [HttpPut("source-language")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateSourceLanguage([FromQuery] string sourceLanguageCode, CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        try
        {
            var res = await _userService.UpdateSourceLanguageAsync(id, sourceLanguageCode, cancellationToken);
            return Ok(ApiResponse<UserDto>.SuccessResponse(res, "Source language updated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Update user CEFR target proficiency level manually
    /// </summary>
    /// <param name="level">CEFR Level A1, A2, B1, B2, C1</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated profile details</returns>
    [HttpPut("target-level")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateTargetLevel([FromQuery] string level, CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        try
        {
            var res = await _userService.UpdateTargetLevelAsync(id, level, cancellationToken);
            return Ok(ApiResponse<UserDto>.SuccessResponse(res, "Target level updated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Get streak calendar (last 30 days of study activities)
    /// </summary>
    /// <param name="offsetMinutes">Timezone offset in minutes (e.g., -420 for UTC+7)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Streak calendar list</returns>
    [HttpGet("streak-calendar")]
    [ProducesResponseType(typeof(ApiResponse<List<StreakCalendarDayDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetStreakCalendar([FromQuery] int offsetMinutes, CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var calendar = await _userService.GetStreakCalendarAsync(id, offsetMinutes, cancellationToken);
        return Ok(ApiResponse<List<StreakCalendarDayDto>>.SuccessResponse(calendar, "Streak calendar fetched"));
    }

    /// <summary>Get complete user profile</summary>
    [HttpGet("details")]
    public IActionResult GetProfileDetails() => Ok(new { Message = "Profile details" });

}
