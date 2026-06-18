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
        var usr = string.IsNullOrEmpty(question)
            ? $"Analyze this English sentence: '{targetText}'. Check if there are any grammatical, spelling, or structural errors. If yes, point out the errors, explain why they are wrong in {languageName}, provide the corrected sentence, and explain the key grammar structures or vocabulary. If the sentence is correct, explain its grammar and usage."
            : $"Explain this related to '{targetText}': {question}";
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

    protected string GetChatTutorSystemPrompt(string sourceLanguageCode)
    {
        var languageName = GetLanguageName(sourceLanguageCode);
        var prompt = $"You are an AI English Tutor. You converse with the user to help them learn English. You must strictly adhere to the following rules:\n" +
                     $"1. LANGUAGE RULE: The user's native language is {languageName}. You MUST communicate, explain concepts, and chat with the user in {languageName}. You are FORBIDDEN from generating explanations or responses in English or any other language except for English practice sentences, exercises, or vocabulary examples. All conversational text, feedback, and tutor instructions must be strictly in {languageName}.\n" +
                     $"2. TOPIC RESTRICTION: You are only allowed to discuss topics related to learning English (such as grammar, vocabulary, pronunciation, reading, writing, speaking, or English practice). If the user asks about ANY unrelated topic (including but not limited to coding, software development, math, history, general advice, politics, or general chit-chat that does not serve English language acquisition), you must ABSOLUTELY REFUSE to answer the query. Politely state in {languageName} that you can only discuss English learning, and steer the user back to the learning topic. Under no circumstances should you answer unrelated questions.\n" +
                     $"3. Keep your replies concise, natural, encouraging, and extremely helpful.";

        if (languageName != "Chinese")
        {
            prompt += $" Do not use any Chinese characters, particles, or punctuation (such as '呢', '吧', '吗', etc.) under any circumstances. Reply ONLY in {languageName}.";
        }

        return prompt;
    }

    public async Task<string> ChatTutorAsync(string message, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        var sys = GetChatTutorSystemPrompt(sourceLanguageCode);
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
