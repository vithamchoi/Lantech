using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Infrastructure.Configuration;
using SWD392.LantechEnglish.Infrastructure.Services;
using SWD392.LantechEnglish.Infrastructure.Services.AIProviders;
using System;

namespace SWD392.LantechEnglish.Infrastructure.Extensions;

public static class AiServiceRegistration
{
    public static IServiceCollection AddAiServices(this IServiceCollection services, IConfiguration configuration)
    {
        var aiSection = configuration.GetSection(AiOptions.SectionName);
        services.Configure<AiOptions>(aiSection);
        var aiOptions = aiSection.Get<AiOptions>() ?? new AiOptions();

        // 1. Register HttpClient using IHttpClientFactory
        services.AddHttpClient("OpenRouterClient", client =>
        {
            var url = string.IsNullOrEmpty(aiOptions.OpenRouterBaseUrl) ? "https://openrouter.ai/api/v1" : aiOptions.OpenRouterBaseUrl;
            client.BaseAddress = new Uri(url.EndsWith("/") ? url : url + "/");
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        services.AddHttpClient("GroqClient", client =>
        {
            client.BaseAddress = new Uri("https://api.groq.com/openai/v1/");
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        services.AddHttpClient("ZenMuxClient", client =>
        {
            var url = string.IsNullOrEmpty(aiOptions.ZenMuxBaseUrl) ? "https://zenmux.ai/api/v1" : aiOptions.ZenMuxBaseUrl;
            client.BaseAddress = new Uri(url.EndsWith("/") ? url : url + "/");
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        // 2. Keyed scoped mappings for fallback sequence
        services.AddKeyedScoped<IAIProvider, ZenMuxAIProvider>("ZenMux");
        services.AddKeyedScoped<ISpeechAssessmentProvider, ZenMuxAIProvider>("ZenMux");

        services.AddKeyedScoped<IAIProvider, OpenRouterAIProvider>("OpenRouter");
        services.AddKeyedScoped<ISpeechAssessmentProvider, OpenRouterAIProvider>("OpenRouter");

        services.AddKeyedScoped<IAIProvider, GroqAIProvider>("Groq");
        services.AddKeyedScoped<ISpeechAssessmentProvider, GroqAIProvider>("Groq");

        services.AddKeyedScoped<IAIProvider, MockAIProvider>("Mock");
        services.AddKeyedScoped<ISpeechAssessmentProvider, MockSpeechAssessmentProvider>("Mock");
        services.AddKeyedScoped<ISpeechAssessmentProvider, AzureSpeechAssessmentProvider>("AzureSpeech");

        // 3. Fallback AI Provider handles the orchestrating logic
        services.AddScoped<IAIProvider, FallbackAIProvider>();
        services.AddScoped<ISpeechAssessmentProvider, FallbackAIProvider>();

        return services;
    }
}
