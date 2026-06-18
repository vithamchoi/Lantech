using SWD392.LantechEnglish.Application.DTOs.AI;
using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface IAIService
{
    Task<string> ExplainSentenceAsync(string sentence, string question, string sourceLanguageCode, CancellationToken cancellationToken = default);
    
    Task<string> GenerateExercisesAsync(string cefrLevel, string skill, string topic, int count, string sourceLanguageCode, CancellationToken cancellationToken = default);
    
    Task<string> ChatTutorAsync(string message, string sourceLanguageCode, List<ChatMessageDto>? history = null, CancellationToken cancellationToken = default);
    
    IAsyncEnumerable<string> ChatTutorStreamAsync(string message, string sourceLanguageCode, List<ChatMessageDto>? history = null, CancellationToken cancellationToken = default);
    
    Task<string> GenerateAssessmentQuestionsAsync(string skill, string cefrLevel, int count, string sourceLanguageCode, CancellationToken cancellationToken = default);
    
    Task<string> GenerateVocabularyExamplesAsync(string word, string cefrLevel, string sourceLanguageCode, CancellationToken cancellationToken = default);

    Task<string> AnalyzeWeaknessesAsync(string historySummaryJson, string sourceLanguageCode, CancellationToken cancellationToken = default);

    Task<string> GenerateLearningPathAsync(string cefrLevel, string sourceLanguageCode, List<string> weakSkills, CancellationToken cancellationToken = default);

    Task<string> GeneratePhoneticIpaAsync(string text, CancellationToken cancellationToken = default);
}
