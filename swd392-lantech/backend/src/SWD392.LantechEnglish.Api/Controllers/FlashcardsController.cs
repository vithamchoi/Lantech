using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.DTOs.Flashcards;
using SWD392.LantechEnglish.Application.Interfaces;
using System.Security.Claims;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class FlashcardsController : ControllerBase
{
    private readonly IFlashcardService _flashcardService;

    public FlashcardsController(IFlashcardService flashcardService)
    {
        _flashcardService = flashcardService;
    }

    private Guid UserId => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

    /// <summary>
    /// Retrieve all flashcards in current user's deck
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Deck of flashcards</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<FlashcardDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetFlashcards(CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var cards = await _flashcardService.GetFlashcardsAsync(id, cancellationToken);
        return Ok(ApiResponse<IEnumerable<FlashcardDto>>.SuccessResponse(cards, "Flashcards loaded successfully"));
    }

    /// <summary>
    /// Retrieve due flashcards that need to be reviewed today based on SM-2 scheduling
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Due cards list</returns>
    [HttpGet("due")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<FlashcardDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetDueFlashcards(CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var cards = await _flashcardService.GetDueFlashcardsAsync(id, cancellationToken);
        return Ok(ApiResponse<IEnumerable<FlashcardDto>>.SuccessResponse(cards, "Due flashcards loaded successfully"));
    }

    /// <summary>
    /// Add a vocabulary word to user's personalized flashcard deck
    /// </summary>
    /// <param name="vocabularyId">Vocabulary GUID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created flashcard details</returns>
    [HttpPost("add/{vocabularyId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<FlashcardDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddFlashcard([FromRoute] Guid vocabularyId, CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        try
        {
            var card = await _flashcardService.CreateFlashcardFromVocabularyAsync(id, vocabularyId, cancellationToken);
            return Ok(ApiResponse<FlashcardDto>.SuccessResponse(card, "Flashcard added successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Submit SM-2 quality review score (0-5) for a flashcard and reschedule its interval
    /// </summary>
    /// <param name="flashcardId">Flashcard GUID</param>
    /// <param name="request">SM-2 Quality score</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Review summary and next due date</returns>
    [HttpPost("review/{flashcardId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<FlashcardReviewDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReviewFlashcard([FromRoute] Guid flashcardId, [FromBody] ReviewFlashcardRequest request, CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        try
        {
            var res = await _flashcardService.ReviewFlashcardAsync(flashcardId, id, request, cancellationToken);
            return Ok(ApiResponse<FlashcardReviewDto>.SuccessResponse(res, "Flashcard review recorded"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }


    /// <summary>
    /// Remove a flashcard from user's deck
    /// </summary>
    /// <param name="flashcardId">Flashcard GUID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success status</returns>
    [HttpDelete("{flashcardId:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveFlashcard([FromRoute] Guid flashcardId, CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        try
        {
            await _flashcardService.RemoveFlashcardAsync(id, flashcardId, cancellationToken);
            return Ok(ApiResponse.SuccessResponse("Flashcard removed successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>Get flashcards history</summary>
    [HttpGet("history")]
    public IActionResult GetFlashcardsHistory() => Ok(new object[] { });

    /// <summary>Get flashcards statistics</summary>
    [HttpGet("stats")]
    public IActionResult GetFlashcardsStats() => Ok(new { Total = 100, Mastered = 20 });

}
