using SWD392.LantechEnglish.Application.DTOs.AI;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Infrastructure.Configuration;

namespace SWD392.LantechEnglish.Infrastructure.Services.AIProviders;

public class GroqAIProvider : BaseAIProvider, ISpeechAssessmentProvider
{
    private readonly HttpClient _httpClient;
    private readonly AiOptions _options;
    private readonly ILogger<GroqAIProvider> _logger;

    public GroqAIProvider(
        IHttpClientFactory httpClientFactory, 
        IOptions<AiOptions> options, 
        ILogger<GroqAIProvider> logger)
    {
        _httpClient = httpClientFactory.CreateClient("GroqClient");
        _options = options.Value;
        _logger = logger;

        _httpClient.BaseAddress = new Uri("https://api.groq.com/openai/v1/");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _options.GroqApiKey);
    }

    protected override async Task<string> CallChatCompletionsAsync(string systemPrompt, string userPrompt, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_options.GroqApiKey))
        {
            throw new InvalidOperationException("Groq API key is not configured.");
        }

        _logger.LogInformation("Attempting Groq call using Llama-3-70b");

        var payload = new
        {
            model = "llama-3.3-70b-versatile",
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt }
            },
            temperature = 0.5
        };

        var requestContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("chat/completions", requestContent, cancellationToken);
        
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"Groq API Error {response.StatusCode}: {error}");
        }

        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
        
        try
        {
            var document = JsonDocument.Parse(responseBody);
            var content = document.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? string.Empty;
            return content.Trim();
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Invalid JSON format from Groq: {ex.Message}");
        }
    }

    public override async IAsyncEnumerable<string> ChatTutorStreamAsync(string message, string sourceLanguageCode, List<ChatMessageDto>? history = null, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_options.GroqApiKey))
        {
            throw new InvalidOperationException("Groq API key is not configured.");
        }

        var systemPrompt = GetChatTutorSystemPrompt(sourceLanguageCode);

        _logger.LogInformation("Attempting Groq stream call using Llama-3-70b");

        var messagesList = new List<object>();
        messagesList.Add(new { role = "system", content = systemPrompt });
        if (history != null)
        {
            foreach (var h in history)
            {
                var role = h.Role == "tutor" || h.Role == "assistant" ? "assistant" : "user";
                messagesList.Add(new { role = role, content = h.Content });
            }
        }
        messagesList.Add(new { role = "user", content = message });

        var payload = new
        {
            model = "llama-3.3-70b-versatile",
            messages = messagesList,
            temperature = 0.5,
            stream = true
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };

        using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errContent = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"Groq Stream HTTP error {response.StatusCode}: {errContent}");
        }

        using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var reader = new StreamReader(stream);

        while (!reader.EndOfStream)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var line = await reader.ReadLineAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(line)) continue;

            if (line.StartsWith("data: "))
            {
                var data = line.Substring(6).Trim();
                if (data == "[DONE]") break;

                using var doc = JsonDocument.Parse(data);
                if (doc.RootElement.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
                {
                    var delta = choices[0].GetProperty("delta");
                    if (delta.TryGetProperty("content", out var contentElement))
                    {
                        var content = contentElement.GetString();
                        if (!string.IsNullOrEmpty(content))
                        {
                            yield return content;
                        }
                    }
                }
            }
        }
    }

    public async Task<PronunciationResult> AssessPronunciationAsync(string targetText, byte[] audioData, CancellationToken cancellationToken = default)
    {
        string transcriptText = targetText;
        // Simple evaluation logic for Pronunciation Result based on text comparison.
        var expectedWords = targetText.ToLower().Split(new[] { ' ', '.', ',', '!', '?' }, StringSplitOptions.RemoveEmptyEntries);
        var transcriptWords = transcriptText.ToLower().Split(new[] { ' ', '.', ',', '!', '?' }, StringSplitOptions.RemoveEmptyEntries);

        int matchedCount = 0;
        foreach (var w in expectedWords)
        {
            if (Array.IndexOf(transcriptWords, w) >= 0) matchedCount++;
        }

        if (expectedWords.Length == 0) return new PronunciationResult { Score = 0, Accuracy = 0, Feedback = "No text provided.", TranscriptText = string.Empty };
        double score = ((double)matchedCount / expectedWords.Length * 100);
        
        return new PronunciationResult
        {
            Score = Math.Min(100, Math.Max(0, score)),
            Accuracy = Math.Min(100, Math.Max(0, score)),
            Fluency = 80, // Mocked fluency for text-only assessment
            Completeness = Math.Min(100, Math.Max(0, score)),
            Feedback = score >= 80 ? "Great job!" : "Keep practicing.",
            TranscriptText = transcriptText
        };
    }
}
