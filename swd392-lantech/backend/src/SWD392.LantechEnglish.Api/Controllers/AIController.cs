using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.Interfaces;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class AIController : ControllerBase
{
    private readonly IAIService _aiService;

    public AIController(IAIService aiService)
    {
        _aiService = aiService;
    }

    private Guid UserId => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

    public class ExplainSentenceRequest
    {
        [Required]
        public string Sentence { get; set; } = null!;
        public string? Question { get; set; }
        public string SourceLanguageCode { get; set; } = "vi";
    }

    /// <summary>
    /// Explain syntax grammar rules and key vocabulary definitions in a sentence
    /// </summary>
    /// <param name="request">Request parameters</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Rich text formatting string explanation</returns>
    [HttpPost("explain-sentence")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExplainSentence([FromBody] ExplainSentenceRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _aiService.ExplainSentenceAsync(request.Sentence, request.Question ?? "", request.SourceLanguageCode, cancellationToken);
            return Ok(ApiResponse<string>.SuccessResponse(result, "Explanation generated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    public class GenerateExercisesRequest
    {
        [Required]
        public string CefrLevel { get; set; } = "A2";
        [Required]
        public string Skill { get; set; } = "Reading";
        [Required]
        public string Topic { get; set; } = "Family";
        public int Count { get; set; } = 3;
        public string SourceLanguageCode { get; set; } = "vi";
    }

    /// <summary>
    /// Automatically generate interactive mock exercises for a skill
    /// </summary>
    /// <param name="request">Request parameters</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>JSON string containing lists of exercises</returns>
    [HttpPost("generate-exercises")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GenerateExercises([FromBody] GenerateExercisesRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _aiService.GenerateExercisesAsync(request.CefrLevel, request.Skill, request.Topic, request.Count, request.SourceLanguageCode, cancellationToken);
            return Ok(ApiResponse<string>.SuccessResponse(result, "Exercises generated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    public class ChatTutorRequest
    {
        [Required]
        public string Message { get; set; } = null!;
        public string SourceLanguageCode { get; set; } = "vi";
    }

    /// <summary>
    /// Chat with the customized AI Personal Tutor bot
    /// </summary>
    /// <param name="request">Message body</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Tutor text answer message</returns>
    [HttpPost("chat-tutor")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ChatTutor([FromBody] ChatTutorRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _aiService.ChatTutorAsync(request.Message, request.SourceLanguageCode, cancellationToken);
            return Ok(ApiResponse<string>.SuccessResponse(result, "Tutor response generated"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    public class VocabularyExamplesRequest
    {
        [Required]
        public string Word { get; set; } = null!;
        public string CefrLevel { get; set; } = "A2";
        public string SourceLanguageCode { get; set; } = "vi";
    }

    /// <summary>
    /// Generate illustrative example contextual sentences and translations for a word
    /// </summary>
    /// <param name="request">Request details</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>AI formatted vocabulary card details</returns>
    [HttpPost("vocabulary-examples")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetVocabularyExamples([FromBody] VocabularyExamplesRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _aiService.GenerateVocabularyExamplesAsync(request.Word, request.CefrLevel, request.SourceLanguageCode, cancellationToken);
            return Ok(ApiResponse<string>.SuccessResponse(result, "Vocabulary examples generated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }


    public class AnalyzeWeaknessRequest
    {
        [Required]
        public string HistorySummaryJson { get; set; } = null!;
        public string SourceLanguageCode { get; set; } = "vi";
    }

    /// <summary>
    /// Analyze student weaknesses from learning history summary
    /// </summary>
    [HttpPost("analyze-weakness")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> AnalyzeWeakness([FromBody] AnalyzeWeaknessRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _aiService.AnalyzeWeaknessesAsync(request.HistorySummaryJson, request.SourceLanguageCode, cancellationToken);
            return Ok(ApiResponse<string>.SuccessResponse(result, "Weaknesses analyzed successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    public class GenerateQuestionRequest
    {
        [Required]
        public string Skill { get; set; } = "Reading";
        [Required]
        public string CefrLevel { get; set; } = "A2";
        public int Count { get; set; } = 1;
        public string SourceLanguageCode { get; set; } = "vi";
    }

    /// <summary>
    /// Generate placement or curriculum practice questions using AI
    /// </summary>
    [HttpPost("generate-question")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GenerateQuestion([FromBody] GenerateQuestionRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _aiService.GenerateAssessmentQuestionsAsync(request.Skill, request.CefrLevel, request.Count, request.SourceLanguageCode, cancellationToken);
            return Ok(ApiResponse<string>.SuccessResponse(result, "Questions generated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    public class SuggestLessonRequest
    {
        [Required]
        public string CefrLevel { get; set; } = "A2";
        public List<string> WeakSkills { get; set; } = new();
        public string SourceLanguageCode { get; set; } = "vi";
    }

    /// <summary>
    /// Generate a personalized roadmap / suggest lessons based on level and weak skills
    /// </summary>
    [HttpPost("suggest-lesson")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SuggestLesson([FromBody] SuggestLessonRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _aiService.GenerateLearningPathAsync(request.CefrLevel, request.SourceLanguageCode, request.WeakSkills, cancellationToken);
            return Ok(ApiResponse<string>.SuccessResponse(result, "Learning path suggestions generated successfully"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

}
