using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Infrastructure.Services.AIProviders;

public class FallbackAIProvider : IAIProvider, ISpeechAssessmentProvider
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<FallbackAIProvider> _logger;

    public FallbackAIProvider(IServiceProvider serviceProvider, ILogger<FallbackAIProvider> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    private async Task<T> ExecuteWithFallbackAsync<T>(Func<IAIProvider, Task<T>> action, string methodName)
    {
        // 1. Try OpenRouter
        try
        {
            var openRouter = _serviceProvider.GetRequiredKeyedService<IAIProvider>("OpenRouter");
            _logger.LogInformation("Using OpenRouter for {MethodName}", methodName);
            return await action(openRouter);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "OpenRouter failed for {MethodName}. Falling back to Groq.", methodName);
        }

        // 2. Try Groq
        try
        {
            var groq = _serviceProvider.GetRequiredKeyedService<IAIProvider>("Groq");
            _logger.LogInformation("Using Groq for {MethodName}", methodName);
            return await action(groq);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Groq failed for {MethodName}. Falling back to Mock.", methodName);
        }

        // 3. Try Mock
        var mock = _serviceProvider.GetRequiredKeyedService<IAIProvider>("Mock");
        _logger.LogInformation("Using Mock for {MethodName}", methodName);
        return await action(mock);
    }

    public Task<PronunciationResult> AssessPronunciationAsync(string targetText, string transcriptText, CancellationToken cancellationToken = default)
    {
        return ExecuteSpeechFallbackAsync(provider => provider.AssessPronunciationAsync(targetText, transcriptText, cancellationToken), "AssessPronunciationAsync");
    }

    private async Task<PronunciationResult> ExecuteSpeechFallbackAsync(Func<ISpeechAssessmentProvider, Task<PronunciationResult>> action, string methodName)
    {
        try
        {
            var groq = _serviceProvider.GetRequiredKeyedService<ISpeechAssessmentProvider>("Groq");
            _logger.LogInformation("Using Groq for {MethodName}", methodName);
            return await action(groq);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Groq failed for {MethodName}. Falling back to Mock.", methodName);
        }

        var mock = _serviceProvider.GetRequiredKeyedService<ISpeechAssessmentProvider>("Mock");
        _logger.LogInformation("Using Mock for {MethodName}", methodName);
        return await action(mock);
    }

    public Task<string> GenerateExplanationAsync(string targetText, string sourceLanguageCode, string question, CancellationToken cancellationToken = default)
        => ExecuteWithFallbackAsync(p => p.GenerateExplanationAsync(targetText, sourceLanguageCode, question, cancellationToken), nameof(GenerateExplanationAsync));

    public Task<string> GenerateExercisesAsync(CefrLevel cefrLevel, SkillType skill, string sourceLanguageCode, string topic, int count, CancellationToken cancellationToken = default)
        => ExecuteWithFallbackAsync(p => p.GenerateExercisesAsync(cefrLevel, skill, sourceLanguageCode, topic, count, cancellationToken), nameof(GenerateExercisesAsync));

    public Task<string> GenerateAssessmentQuestionsAsync(SkillType skill, CefrLevel cefrLevel, string sourceLanguageCode, int count, CancellationToken cancellationToken = default)
        => ExecuteWithFallbackAsync(p => p.GenerateAssessmentQuestionsAsync(skill, cefrLevel, sourceLanguageCode, count, cancellationToken), nameof(GenerateAssessmentQuestionsAsync));

    public Task<string> AnalyzeWeaknessesAsync(string historySummaryJson, string sourceLanguageCode, CancellationToken cancellationToken = default)
        => ExecuteWithFallbackAsync(p => p.AnalyzeWeaknessesAsync(historySummaryJson, sourceLanguageCode, cancellationToken), nameof(AnalyzeWeaknessesAsync));

    public Task<string> ChatTutorAsync(string message, string sourceLanguageCode, CancellationToken cancellationToken = default)
        => ExecuteWithFallbackAsync(p => p.ChatTutorAsync(message, sourceLanguageCode, cancellationToken), nameof(ChatTutorAsync));

    public Task<string> GenerateLearningPathAsync(CefrLevel cefrLevel, string sourceLanguageCode, List<string> weakSkills, CancellationToken cancellationToken = default)
        => ExecuteWithFallbackAsync(p => p.GenerateLearningPathAsync(cefrLevel, sourceLanguageCode, weakSkills, cancellationToken), nameof(GenerateLearningPathAsync));

    public Task<string> GenerateVocabularyExamplesAsync(string word, string sourceLanguageCode, CefrLevel cefrLevel, CancellationToken cancellationToken = default)
        => ExecuteWithFallbackAsync(p => p.GenerateVocabularyExamplesAsync(word, sourceLanguageCode, cefrLevel, cancellationToken), nameof(GenerateVocabularyExamplesAsync));

    public Task<(double Score, string Feedback)> GradeWritingAsync(string prompt, string answerText, string sourceLanguageCode, CancellationToken cancellationToken = default)
        => ExecuteWithFallbackAsync(p => p.GradeWritingAsync(prompt, answerText, sourceLanguageCode, cancellationToken), nameof(GradeWritingAsync));

    public Task<(double Score, string Feedback)> GradeSpeakingAsync(string prompt, string transcriptText, string targetText, string sourceLanguageCode, CancellationToken cancellationToken = default)
        => ExecuteWithFallbackAsync(p => p.GradeSpeakingAsync(prompt, transcriptText, targetText, sourceLanguageCode, cancellationToken), nameof(GradeSpeakingAsync));

    public async Task<byte[]> GenerateAudioAsync(string text, string voice = "alloy", CancellationToken cancellationToken = default)
    {
        var mock = _serviceProvider.GetRequiredKeyedService<IAIProvider>("Mock");
        _logger.LogInformation("Using Mock (Google TTS) for GenerateAudioAsync");
        return await mock.GenerateAudioAsync(text, voice, cancellationToken);
    }
}
