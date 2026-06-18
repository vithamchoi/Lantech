using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class AIService : IAIService
{
    private readonly IAIProvider _aiProvider;

    public AIService(IAIProvider aiProvider)
    {
        _aiProvider = aiProvider;
    }

    public async Task<string> ExplainSentenceAsync(string sentence, string question, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        return await _aiProvider.GenerateExplanationAsync(sentence, sourceLanguageCode, question, cancellationToken);
    }

    public async Task<string> GenerateExercisesAsync(string cefrLevel, string skill, string topic, int count, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<CefrLevel>(cefrLevel, true, out var level) ||
            !Enum.TryParse<SkillType>(skill, true, out var sk))
        {
            throw new InvalidOperationException("Invalid level or skill parameters.");
        }
        return await _aiProvider.GenerateExercisesAsync(level, sk, sourceLanguageCode, topic, count, cancellationToken);
    }

    public async Task<string> ChatTutorAsync(string message, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        return await _aiProvider.ChatTutorAsync(message, sourceLanguageCode, cancellationToken);
    }

    public async Task<string> GenerateAssessmentQuestionsAsync(string skill, string cefrLevel, int count, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<CefrLevel>(cefrLevel, true, out var level) ||
            !Enum.TryParse<SkillType>(skill, true, out var sk))
        {
            throw new InvalidOperationException("Invalid level or skill parameters.");
        }
        return await _aiProvider.GenerateAssessmentQuestionsAsync(sk, level, sourceLanguageCode, count, cancellationToken);
    }

    public async Task<string> GenerateVocabularyExamplesAsync(string word, string cefrLevel, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<CefrLevel>(cefrLevel, true, out var level))
        {
            throw new InvalidOperationException("Invalid level parameter.");
        }
        return await _aiProvider.GenerateVocabularyExamplesAsync(word, sourceLanguageCode, level, cancellationToken);
    }

    public async Task<string> AnalyzeWeaknessesAsync(string historySummaryJson, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        return await _aiProvider.AnalyzeWeaknessesAsync(historySummaryJson, sourceLanguageCode, cancellationToken);
    }

    public async Task<string> GenerateLearningPathAsync(string cefrLevel, string sourceLanguageCode, List<string> weakSkills, CancellationToken cancellationToken = default)
    {
        if (!Enum.TryParse<CefrLevel>(cefrLevel, true, out var level))
        {
            throw new InvalidOperationException("Invalid level parameter.");
        }
        return await _aiProvider.GenerateLearningPathAsync(level, sourceLanguageCode, weakSkills, cancellationToken);
    }
}
