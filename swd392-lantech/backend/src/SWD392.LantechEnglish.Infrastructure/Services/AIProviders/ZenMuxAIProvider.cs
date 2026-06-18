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

public class ZenMuxAIProvider : BaseAIProvider, ISpeechAssessmentProvider
{
    private readonly HttpClient _httpClient;
    private readonly AiOptions _options;
    private readonly ILogger<ZenMuxAIProvider> _logger;

    public ZenMuxAIProvider(
        IHttpClientFactory httpClientFactory, 
        IOptions<AiOptions> options, 
        ILogger<ZenMuxAIProvider> logger)
    {
        _httpClient = httpClientFactory.CreateClient("ZenMuxClient");
        _options = options.Value;
        _logger = logger;

        var baseUrl = string.IsNullOrEmpty(_options.ZenMuxBaseUrl) ? "https://zenmux.ai/api/v1" : _options.ZenMuxBaseUrl;
        _httpClient.BaseAddress = new Uri(baseUrl.EndsWith("/") ? baseUrl : baseUrl + "/");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _options.ZenMuxApiKey);
    }

    protected override async Task<string> CallChatCompletionsAsync(string systemPrompt, string userPrompt, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_options.ZenMuxApiKey))
        {
            throw new InvalidOperationException("ZenMux API key is not configured.");
        }

        var model = string.IsNullOrEmpty(_options.ZenMuxDefaultModel) ? "z-ai/glm-5.2-free" : _options.ZenMuxDefaultModel;
        
        _logger.LogInformation("Attempting ZenMux call using model: {Model}", model);

        var payload = new
        {
            model = model,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt }
            },
            temperature = 0.7
        };

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync("chat/completions", content, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errContent = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"ZenMux HTTP error {response.StatusCode}: {errContent}");
        }

        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
        var doc = JsonDocument.Parse(responseBody);
        var result = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? string.Empty;

        // Validate if it is valid JSON if the prompt expects JSON output
        if (systemPrompt.Contains("JSON") || userPrompt.Contains("JSON"))
        {
            var cleaned = CleanJson(result);
            using var tempDoc = JsonDocument.Parse(cleaned);
        }

        _logger.LogInformation("ZenMux call succeeded using model: {Model}", model);
        return result;
    }

    public override async IAsyncEnumerable<string> ChatTutorStreamAsync(string message, string sourceLanguageCode, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_options.ZenMuxApiKey))
        {
            throw new InvalidOperationException("ZenMux API key is not configured.");
        }

        var model = string.IsNullOrEmpty(_options.ZenMuxDefaultModel) ? "z-ai/glm-5.2-free" : _options.ZenMuxDefaultModel;
        var systemPrompt = GetChatTutorSystemPrompt(sourceLanguageCode);

        _logger.LogInformation("Attempting ZenMux stream call using model: {Model}", model);

        var payload = new
        {
            model = model,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = message }
            },
            temperature = 0.7,
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
            throw new HttpRequestException($"ZenMux Stream HTTP error {response.StatusCode}: {errContent}");
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

    public Task<PronunciationResult> AssessPronunciationAsync(string targetText, byte[] audioData, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("ZenMux does not support native speech assessment in this environment.");
    }
}
