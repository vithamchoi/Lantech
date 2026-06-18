using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.DTOs.Leaderboard;
using SWD392.LantechEnglish.Application.Interfaces;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class LeaderboardsController : ControllerBase
{
    private readonly ILeaderboardService _leaderboardService;

    public LeaderboardsController(ILeaderboardService leaderboardService)
    {
        _leaderboardService = leaderboardService;
    }

    /// <summary>
    /// Retrieve current leaderboards based on period (weekly, monthly, alltime)
    /// </summary>
    /// <param name="period">weekly, monthly, or alltime</param>
    /// <param name="top">Number of top entries (default 10)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Leaderboard results</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<LeaderboardDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetLeaderboard([FromQuery] string period = "weekly", [FromQuery] int top = 10, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(period))
        {
            return BadRequest(ApiResponse.ErrorResponse("Period parameter is required."));
        }

        var res = await _leaderboardService.GetLeaderboardAsync(period, top, cancellationToken);
        return Ok(ApiResponse<LeaderboardDto>.SuccessResponse(res, $"Leaderboard ({period}) loaded successfully"));
    }


    /// <summary>Get monthly leaderboard</summary>
    [HttpGet("monthly")]
    public IActionResult GetMonthlyLeaderboard() => Ok(new { Entries = new object[] {} });

    /// <summary>Get all-time leaderboard</summary>
    [HttpGet("all-time")]
    public IActionResult GetAllTimeLeaderboard() => Ok(new { Entries = new object[] {} });

}
