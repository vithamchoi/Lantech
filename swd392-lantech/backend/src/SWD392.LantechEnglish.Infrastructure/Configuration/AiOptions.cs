using System.Collections.Generic;

namespace SWD392.LantechEnglish.Infrastructure.Configuration;

public class AiOptions
{
    public const string SectionName = "AI";

    public string Provider { get; set; } = string.Empty;
    public string OpenRouterApiKey { get; set; } = string.Empty;
    public string OpenRouterBaseUrl { get; set; } = "https://openrouter.ai/api/v1";
    public string OpenRouterDefaultModel { get; set; } = "google/gemini-2.5-pro";
    public List<string> OpenRouterFallbackModels { get; set; } = new();
    public string GroqApiKey { get; set; } = string.Empty;
    public string GeminiApiKey { get; set; } = string.Empty;
    public string ClaudeApiKey { get; set; } = string.Empty;
    public string OpenAIApiKey { get; set; } = string.Empty;
}
