using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.DTOs.Dashboard;
using SWD392.LantechEnglish.Application.Interfaces;
using System.Security.Claims;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    private Guid UserId => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

    /// <summary>
    /// Fetch the main study dashboard data (statistics, weaknesses, recommendations, and reviews)
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Dashboard Dto</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<DashboardDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        try
        {
            var data = await _dashboardService.GetDashboardDataAsync(id, cancellationToken);
            return Ok(ApiResponse<DashboardDto>.SuccessResponse(data, "Dashboard loaded successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }


    /// <summary>Get dashboard progress</summary>
    [HttpGet("progress")]
    public IActionResult GetProgress() => Ok(new { Percent = 50 });

    /// <summary>Get dashboard weaknesses</summary>
    [HttpGet("weaknesses")]
    public IActionResult GetWeaknesses() => Ok(new string[] { "Listening", "Vocabulary" });

    /// <summary>Get next recommended lesson</summary>
    [HttpGet("next-lesson")]
    public IActionResult GetNextLesson() => Ok(new { Title = "Basic Grammar" });

    /// <summary>Get recent activity</summary>
    [HttpGet("recent-activity")]
    public IActionResult GetRecentActivity() => Ok(new object[] { });

}
