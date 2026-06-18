using SWD392.LantechEnglish.Application.Interfaces;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class MockSpeechAssessmentProvider : ISpeechAssessmentProvider
{
    public Task<PronunciationResult> AssessPronunciationAsync(string targetText, string transcriptText, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(targetText) || string.IsNullOrWhiteSpace(transcriptText))
        {
            return Task.FromResult(new PronunciationResult
            {
                Score = 0,
                Accuracy = 0,
                Fluency = 0,
                Completeness = 0,
                Feedback = "Please provide both target text and speech transcript.",
                WordLevelFeedbackJson = "[]"
            });
        }

        // Clean text helper (removes punctuation, converts to lower case)
        string Clean(string text) => Regex.Replace(text.ToLower(), @"[^\w\s]", "").Trim();

        var cleanTarget = Clean(targetText);
        var cleanTranscript = Clean(transcriptText);

        var targetWords = cleanTarget.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
        var transcriptWords = new HashSet<string>(cleanTranscript.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries));

        // 1. Calculate Levenshtein Distance for exact text similarity
        int distance = LevenshteinDistance(cleanTarget, cleanTranscript);
        int maxLength = Math.Max(cleanTarget.Length, cleanTranscript.Length);
        double accuracy = maxLength == 0 ? 100.0 : (1.0 - (double)distance / maxLength) * 100.0;
        accuracy = Math.Max(0.0, Math.Min(100.0, accuracy));

        // 2. Generate word-level feedback
        var wordFeedbacks = new List<object>();
        int correctCount = 0;
        foreach (var word in targetWords)
        {
            bool exists = transcriptWords.Contains(word);
            if (exists) correctCount++;
            wordFeedbacks.Add(new
            {
                word = word,
                accuracyScore = exists ? 100.0 : 0.0,
                errorType = exists ? "None" : "Omission"
            });
        }

        double completeness = targetWords.Length == 0 ? 100.0 : ((double)correctCount / targetWords.Length) * 100.0;
        double fluency = Math.Max(30.0, accuracy * 0.95); // Simulated fluency score
        double overallScore = (accuracy + completeness + fluency) / 3.0;

        var result = new PronunciationResult
        {
            Score = Math.Round(overallScore, 1),
            Accuracy = Math.Round(accuracy, 1),
            Fluency = Math.Round(fluency, 1),
            Completeness = Math.Round(completeness, 1),
            Feedback = overallScore >= 80 
                ? "Excellent pronunciation! Your pacing and accuracy are very natural." 
                : "Good attempt. Practice repeating the sentence slowly to improve accuracy.",
            WordLevelFeedbackJson = JsonSerializer.Serialize(wordFeedbacks)
        };

        return Task.FromResult(result);
    }

    private static int LevenshteinDistance(string s, string t)
    {
        if (string.IsNullOrEmpty(s)) return string.IsNullOrEmpty(t) ? 0 : t.Length;
        if (string.IsNullOrEmpty(t)) return s.Length;

        int n = s.Length;
        int m = t.Length;
        int[,] d = new int[n + 1, m + 1];

        for (int i = 0; i <= n; d[i, 0] = i++) ;
        for (int j = 0; j <= m; d[0, j] = j++) ;

        for (int i = 1; i <= n; i++)
        {
            for (int j = 1; j <= m; j++)
            {
                int cost = (t[j - 1] == s[i - 1]) ? 0 : 1;
                d[i, j] = Math.Min(
                    Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                    d[i - 1, j - 1] + cost);
            }
        }
        return d[n, m];
    }
}
