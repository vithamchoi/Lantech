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

public class OpenRouterAIProvider : BaseAIProvider, ISpeechAssessmentProvider
{
    private readonly HttpClient _httpClient;
    private readonly AiOptions _options;
    private readonly ILogger<OpenRouterAIProvider> _logger;

    public OpenRouterAIProvider(
        IHttpClientFactory httpClientFactory, 
        IOptions<AiOptions> options, 
        ILogger<OpenRouterAIProvider> logger)
    {
        _httpClient = httpClientFactory.CreateClient("OpenRouterClient");
        _options = options.Value;
        _logger = logger;

        var baseUrl = string.IsNullOrEmpty(_options.OpenRouterBaseUrl) ? "https://openrouter.ai/api/v1" : _options.OpenRouterBaseUrl;
        _httpClient.BaseAddress = new Uri(baseUrl.EndsWith("/") ? baseUrl : baseUrl + "/");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _options.OpenRouterApiKey);
        _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", "http://localhost:3000");
        _httpClient.DefaultRequestHeaders.Add("X-Title", "LantechEnglish");
    }

    protected override async Task<string> CallChatCompletionsAsync(string systemPrompt, string userPrompt, CancellationToken cancellationToken)
    {
        // 1. Gather all models to try in sequence: Default model -> Fallback models
        var modelsToTry = new List<string>();
        if (!string.IsNullOrEmpty(_options.OpenRouterDefaultModel))
        {
            modelsToTry.Add(_options.OpenRouterDefaultModel);
        }
        else
        {
            // Default model if none specified
            modelsToTry.Add("google/gemini-2.5-pro"); 
        }

        if (_options.OpenRouterFallbackModels != null)
        {
            foreach (var fallbackModel in _options.OpenRouterFallbackModels)
            {
                if (!string.IsNullOrEmpty(fallbackModel) && !modelsToTry.Contains(fallbackModel))
                {
                    modelsToTry.Add(fallbackModel);
                }
            }
        }

        // Add standard free model as a last-ditch fallback
        if (!modelsToTry.Contains("meta-llama/llama-3.1-70b-instruct:free"))
        {
            modelsToTry.Add("meta-llama/llama-3.1-70b-instruct:free");
        }

        List<Exception> errors = new();

        foreach (var model in modelsToTry)
        {
            try
            {
                _logger.LogInformation("Attempting OpenRouter call using model: {Model}", model);

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
                    throw new HttpRequestException($"OpenRouter HTTP error {response.StatusCode}: {errContent}");
                }

                var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
                var doc = JsonDocument.Parse(responseBody);
                var result = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? string.Empty;

                // Validate if it is valid JSON if the prompt expects JSON output
                if (systemPrompt.Contains("JSON") || userPrompt.Contains("JSON"))
                {
                    var cleaned = CleanJson(result);
                    // Just do a dry run parse
                    using var tempDoc = JsonDocument.Parse(cleaned);
                }

                _logger.LogInformation("OpenRouter call succeeded using model: {Model}", model);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "OpenRouter attempt failed with model: {Model}. Trying next fallback if available.", model);
                errors.Add(ex);
            }
        }

        throw new AggregateException("All configured OpenRouter models failed to return a valid response.", errors);
    }

    public override async IAsyncEnumerable<string> ChatTutorStreamAsync(string message, string sourceLanguageCode, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var modelsToTry = new List<string>();
        if (!string.IsNullOrEmpty(_options.OpenRouterDefaultModel))
        {
            modelsToTry.Add(_options.OpenRouterDefaultModel);
        }
        else
        {
            modelsToTry.Add("google/gemini-2.5-pro");
        }

        if (_options.OpenRouterFallbackModels != null)
        {
            foreach (var fallbackModel in _options.OpenRouterFallbackModels)
            {
                if (!string.IsNullOrEmpty(fallbackModel) && !modelsToTry.Contains(fallbackModel))
                {
                    modelsToTry.Add(fallbackModel);
                }
            }
        }

        if (!modelsToTry.Contains("meta-llama/llama-3.1-70b-instruct:free"))
        {
            modelsToTry.Add("meta-llama/llama-3.1-70b-instruct:free");
        }

        var languageName = (sourceLanguageCode?.ToLower() ?? "vi") switch
        {
            "vi" => "Vietnamese",
            "zh" => "Chinese",
            "ja" => "Japanese",
            "es" => "Spanish",
            "fr" => "French",
            _ => "Vietnamese"
        };
        
        var systemPrompt = $"You are an AI English Tutor. Converse with the user and guide them. You must explain concepts and chat with them in {languageName} to guide them, while helping them practice their English. Do not use any Chinese characters, particles, or punctuation (such as '呢', '吧', '吗', etc.) under any circumstances. Reply purely in {languageName} and English. Keep it concise, natural, and helpful.";

        List<Exception> errors = new();
        HttpResponseMessage? response = null;

        foreach (var model in modelsToTry)
        {
            try
            {
                _logger.LogInformation("Attempting OpenRouter stream call using model: {Model}", model);

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

                var res = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
                if (!res.IsSuccessStatusCode)
                {
                    var errContent = await res.Content.ReadAsStringAsync(cancellationToken);
                    throw new HttpRequestException($"OpenRouter Stream HTTP error {res.StatusCode}: {errContent}");
                }

                response = res;
                break;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "OpenRouter stream attempt failed with model: {Model}. Trying next fallback if available.", model);
                errors.Add(ex);
            }
        }

        if (response == null)
        {
            throw new AggregateException("All configured OpenRouter models failed to return a valid stream response.", errors);
        }

        using (response)
        {
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
    }

    public Task<PronunciationResult> AssessPronunciationAsync(string targetText, string transcriptText, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException("OpenRouter does not support native speech assessment in this environment.");
    }
}
