using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.DTOs.Languages;
using SWD392.LantechEnglish.Application.Interfaces;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class LanguagesController : ControllerBase
{
    private readonly ILanguageService _languageService;

    public LanguagesController(ILanguageService languageService)
    {
        _languageService = languageService;
    }

    /// <summary>
    /// Retrieve list of all supported localization and instruction languages
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Supported languages list</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LanguageDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSupportedLanguages(CancellationToken cancellationToken)
    {
        var list = await _languageService.GetAllLanguagesAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<LanguageDto>>.SuccessResponse(list, "Supported languages fetched successfully"));
    }


    /// <summary>Get source languages</summary>
    [HttpGet("source")]
    public IActionResult GetSourceLanguages() => Ok(new string[] { "vi", "ja", "ko", "zh" });

    /// <summary>Get target languages</summary>
    [HttpGet("target")]
    public IActionResult GetTargetLanguages() => Ok(new string[] { "en" });

}
