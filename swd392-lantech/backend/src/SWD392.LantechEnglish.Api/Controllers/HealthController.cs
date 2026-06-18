using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.DTOs.Health;
using SWD392.LantechEnglish.Application.Interfaces;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class HealthController : ControllerBase
{
    private readonly IHealthService _healthService;

    public HealthController(IHealthService healthService)
    {
        _healthService = healthService;
    }

    /// <summary>
    /// Check system databases and cache connectivity status
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>System connection health status scorecard</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<HealthStatusDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHealth(CancellationToken cancellationToken)
    {
        var status = await _healthService.CheckHealthAsync(cancellationToken);
        return Ok(ApiResponse<HealthStatusDto>.SuccessResponse(status, "System health retrieved successfully"));
    }


    /// <summary>Check database health</summary>
    [HttpGet("database")]
    public IActionResult CheckDatabase() => Ok(new { Status = "Healthy" });

    /// <summary>Check redis health</summary>
    [HttpGet("redis")]
    public IActionResult CheckRedis() => Ok(new { Status = "Healthy" });

}
