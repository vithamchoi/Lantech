using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Infrastructure.Data;
using SWD392.LantechEnglish.Infrastructure.Services;
using SWD392.LantechEnglish.Infrastructure.Services.AIProviders;
using SWD392.LantechEnglish.Infrastructure.Extensions;

namespace SWD392.LantechEnglish.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Add DbContext
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // Add Infrastructure Services
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<ICacheService, RedisCacheService>();
        
        // Add HttpClient
        services.AddHttpClient();

        // AI Services registration (Factory with Fallback)
        services.AddAiServices(configuration);

        // Add Application Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ILanguageService, LanguageService>();
        services.AddScoped<IOnboardingService, OnboardingService>();
        services.AddScoped<IAssessmentService, AssessmentService>();
        services.AddScoped<ILearningPathService, LearningPathService>();
        services.AddScoped<ILessonService, LessonService>();
        services.AddScoped<IExerciseService, ExerciseService>();
        services.AddScoped<IVocabularyService, VocabularyService>();
        services.AddScoped<IFlashcardService, FlashcardService>();
        services.AddScoped<IPronunciationService, PronunciationService>();
        services.AddScoped<IAIService, AIService>();
        services.AddScoped<IGamificationService, GamificationService>();
        services.AddScoped<ILeaderboardService, LeaderboardService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IHealthService, HealthService>();

        return services;
    }
}
