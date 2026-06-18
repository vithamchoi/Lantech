using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.DTOs.Onboarding;
using SWD392.LantechEnglish.Application.Interfaces;
using System.Security.Claims;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class OnboardingController : ControllerBase
{
    private readonly IOnboardingService _onboardingService;

    public OnboardingController(IOnboardingService onboardingService)
    {
        _onboardingService = onboardingService;
    }

    private Guid UserId => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

    /// <summary>
    /// Retrieve available options for target language, native language, and CEFR standards during onboarding
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Metadata onboarding options Dto</returns>
    [HttpGet("options")]
    [ProducesResponseType(typeof(ApiResponse<OnboardingOptionsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOptions(CancellationToken cancellationToken)
    {
        var options = await _onboardingService.GetOnboardingOptionsAsync(cancellationToken);
        return Ok(ApiResponse<OnboardingOptionsDto>.SuccessResponse(options, "Onboarding options loaded successfully"));
    }

    /// <summary>
    /// Self-select target proficiency levels manually and choose native localization languages
    /// </summary>
    /// <param name="request">Selected preferences</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Onboarding questionnaire status and generated path ID</returns>
    [HttpPost("select-level")]
    [ProducesResponseType(typeof(ApiResponse<OnboardingResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SelfSelectLevel([FromBody] SelfSelectLevelRequest request, CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        try
        {
            var res = await _onboardingService.SelfSelectLevelAsync(id, request, cancellationToken);
            return Ok(ApiResponse<OnboardingResultDto>.SuccessResponse(res, "Onboarding profile initialized successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Retrieve the detailed current CEFR level skill profile of the authenticated user
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>CEFR levels per skill</returns>
    [HttpGet("profile")]
    [ProducesResponseType(typeof(ApiResponse<UserSkillProfileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMyLevelProfile(CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var profile = await _onboardingService.GetMyLevelProfileAsync(id, cancellationToken);
        if (profile == null) return NotFound(ApiResponse.ErrorResponse("No skill profile found. Please complete onboarding."));

        return Ok(ApiResponse<UserSkillProfileDto>.SuccessResponse(profile, "User skill profile fetched successfully"));
    }

    /// <summary>
    /// Force regeneration of the active learning path based on the current skill profile
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Regenerated roadmap outcome details</returns>
    [HttpPost("regenerate-path")]
    [ProducesResponseType(typeof(ApiResponse<OnboardingResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RegeneratePath(CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var res = await _onboardingService.RegenerateLearningPathAsync(id, cancellationToken);
        return Ok(ApiResponse<OnboardingResultDto>.SuccessResponse(res, "Learning path roadmap regenerated successfully"));
    }
}
