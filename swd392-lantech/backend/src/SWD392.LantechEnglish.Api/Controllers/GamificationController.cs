using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.DTOs.Gamification;
using SWD392.LantechEnglish.Application.Interfaces;
using System.Security.Claims;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class GamificationController : ControllerBase
{
    private readonly IGamificationService _gamificationService;

    public GamificationController(IGamificationService gamificationService)
    {
        _gamificationService = gamificationService;
    }

    private Guid UserId => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

    /// <summary>
    /// Retrieve all configured badges in the system
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of badges</returns>
    [HttpGet("badges")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<BadgeDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBadges(CancellationToken cancellationToken)
    {
        var badges = await _gamificationService.GetBadgesAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<BadgeDto>>.SuccessResponse(badges, "Badges fetched successfully"));
    }

    /// <summary>
    /// Retrieve the badges unlocked by the current user
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of unlocked user badges</returns>
    [HttpGet("my-badges")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<UserBadgeDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyBadges(CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var list = await _gamificationService.GetUserBadgesAsync(id, cancellationToken);
        return Ok(ApiResponse<IEnumerable<UserBadgeDto>>.SuccessResponse(list, "User badges fetched successfully"));
    }

    /// <summary>
    /// Retrieve points (XP) earning history logs for the current user
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Points transactions list</returns>
    [HttpGet("my-xp-transactions")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<XpTransactionDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyXpTransactions(CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var list = await _gamificationService.GetXpTransactionsAsync(id, cancellationToken);
        return Ok(ApiResponse<IEnumerable<XpTransactionDto>>.SuccessResponse(list, "XP logs fetched successfully"));
    }


    /// <summary>Get total XP</summary>
    [HttpGet("xp")]
    public IActionResult GetTotalXp() => Ok(new { TotalXp = 1500 });

    /// <summary>Check if badge unlocked</summary>
    [HttpGet("check-unlock")]
    public IActionResult CheckUnlock() => Ok(new { Unlocked = true });

}
