using System.Text.Json;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Infrastructure.Services.AIProviders;

public abstract class BaseAIProvider : IAIProvider
{
    protected abstract Task<string> CallChatCompletionsAsync(string systemPrompt, string userPrompt, CancellationToken cancellationToken);

    public async Task<string> GenerateExplanationAsync(string targetText, string sourceLanguageCode, string question, CancellationToken cancellationToken = default)
    {
        var languageName = GetLanguageName(sourceLanguageCode);
        var sys = $"You are a helpful English tutor. Reply in {languageName}. Output only the explanation.";
        var usr = $"Explain this related to '{targetText}': {question}";
        return await CallChatCompletionsAsync(sys, usr, cancellationToken);
    }

    public async Task<string> GenerateExercisesAsync(CefrLevel cefrLevel, SkillType skill, string sourceLanguageCode, string topic, int count, CancellationToken cancellationToken = default)
    {
        var sys = "You are a teacher. Output ONLY a valid JSON array of objects with schema: [{prompt, instruction, options:[], correctAnswer, explanation, difficulty, xpReward}]";
        var usr = $"Create {count} multiple choice questions for level {cefrLevel} on topic {topic}";
        return CleanJson(await CallChatCompletionsAsync(sys, usr, cancellationToken));
    }

    public async Task<string> GenerateAssessmentQuestionsAsync(SkillType skill, CefrLevel cefrLevel, string sourceLanguageCode, int count, CancellationToken cancellationToken = default)
    {
        var sys = "You are a teacher. Output ONLY a valid JSON array of objects. No markdown.";
        var usr = $"Generate {count} {skill} questions for {cefrLevel}.";
        
        usr += skill switch
        {
            SkillType.Reading => " Schema: [{skill:'Reading', level, questionText, instruction, passageText, options:[], correctAnswer, explanation}]",
            SkillType.Listening => " Schema: [{skill:'Listening', level, questionText, instruction, audioTranscript, options:[], correctAnswer, explanation}]",
            SkillType.Writing => " Schema: [{skill:'Writing', level, questionText, instruction, writingPrompt, explanation}]",
            SkillType.Speaking => " Schema: [{skill:'Speaking', level, questionText, instruction, speakingPrompt, explanation}]",
            _ => ""
        };

        return CleanJson(await CallChatCompletionsAsync(sys, usr, cancellationToken));
    }

    public async Task<string> AnalyzeWeaknessesAsync(string historySummaryJson, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        var sys = "You are an AI analyzer. Output ONLY a JSON object: {weakSkills:[], commonMistakes:[], recommendedLessons:[], suggestedFlashcards:[]}";
        var usr = $"Analyze this performance history: {historySummaryJson}";
        return CleanJson(await CallChatCompletionsAsync(sys, usr, cancellationToken));
    }

    public async Task<string> ChatTutorAsync(string message, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        var languageName = GetLanguageName(sourceLanguageCode);
        var sys = $"You are an AI English Tutor. Converse with the user and guide them. You must explain concepts and chat with them in {languageName} to guide them, while helping them practice their English. Do not use any Chinese characters, particles, or punctuation (such as '呢', '吧', '吗', etc.) under any circumstances. Reply purely in {languageName} and English. Keep it concise, natural, and helpful.";
        return await CallChatCompletionsAsync(sys, message, cancellationToken);
    }

    public virtual IAsyncEnumerable<string> ChatTutorStreamAsync(string message, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Streaming is not supported by this provider.");
    }

    public async Task<string> GenerateLearningPathAsync(CefrLevel cefrLevel, string sourceLanguageCode, List<string> weakSkills, CancellationToken cancellationToken = default)
    {
        var languageName = GetLanguageName(sourceLanguageCode);
        var sys = "You are an AI curriculum designer. Output ONLY a JSON object: {title, description, recommendedLessons:[], weakSkillsJson:''}";
        var usr = $"Create a learning path for level {cefrLevel}. Weak skills: {string.Join(",", weakSkills)}. Language: {languageName}";
        return CleanJson(await CallChatCompletionsAsync(sys, usr, cancellationToken));
    }

    public async Task<string> GenerateVocabularyExamplesAsync(string word, string sourceLanguageCode, CefrLevel cefrLevel, CancellationToken cancellationToken = default)
    {
        var languageName = GetLanguageName(sourceLanguageCode);
        var sys = "You are an English teacher. Output ONLY a JSON object: {word, examples: [{english, translation}]}";
        var usr = $"Give 3 examples of the word '{word}' for {cefrLevel} level. Translate examples to {languageName}.";
        return CleanJson(await CallChatCompletionsAsync(sys, usr, cancellationToken));
    }

    public async Task<(double Score, string Feedback)> GradeWritingAsync(string prompt, string answerText, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        var languageName = GetLanguageName(sourceLanguageCode);
        var sys = "You are an examiner. Output ONLY a JSON object: {score: <0-100>, feedback: '<text>'}";
        var usr = $"Prompt: {prompt}\nAnswer: {answerText}\nProvide feedback in {languageName}.";
        
        var json = CleanJson(await CallChatCompletionsAsync(sys, usr, cancellationToken));
        try
        {
            var doc = JsonDocument.Parse(json);
            return (doc.RootElement.GetProperty("score").GetDouble(), doc.RootElement.GetProperty("feedback").GetString() ?? "");
        }
        catch { return (50, "Failed to parse AI grading."); }
    }

    public async Task<(double Score, string Feedback)> GradeSpeakingAsync(string prompt, string transcriptText, string targetText, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        var languageName = GetLanguageName(sourceLanguageCode);
        var sys = "You are a pronunciation examiner. Output ONLY a JSON object: {score: <0-100>, feedback: '<text>'}";
        var usr = $"Prompt: {prompt}\nExpected: {targetText}\nHeard: {transcriptText}\nProvide feedback in {languageName}.";
        
        var json = CleanJson(await CallChatCompletionsAsync(sys, usr, cancellationToken));
        try
        {
            var doc = JsonDocument.Parse(json);
            return (doc.RootElement.GetProperty("score").GetDouble(), doc.RootElement.GetProperty("feedback").GetString() ?? "");
        }
        catch { return (50, "Failed to parse AI grading."); }
    }

    public virtual Task<byte[]> GenerateAudioAsync(string text, string voice = "alloy", CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("Provider does not support TTS");
    }

    protected string CleanJson(string content)
    {
        if (content.StartsWith("```json")) content = content.Substring(7);
        if (content.StartsWith("```")) content = content.Substring(3);
        if (content.EndsWith("```")) content = content.Substring(0, content.Length - 3);
        return content.Trim();
    }

    private string GetLanguageName(string code)
    {
        return (code?.ToLower() ?? "vi") switch
        {
            "vi" => "Vietnamese",
            "zh" => "Chinese",
            "ja" => "Japanese",
            "es" => "Spanish",
            "fr" => "French",
            _ => "Vietnamese"
        };
    }
}
