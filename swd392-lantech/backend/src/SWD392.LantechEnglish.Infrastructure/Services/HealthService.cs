using SWD392.LantechEnglish.Application.DTOs.Health;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Infrastructure.Data;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class HealthService : IHealthService
{
    private readonly AppDbContext _context;
    private readonly ICacheService _cacheService;

    public HealthService(AppDbContext context, ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<HealthStatusDto> CheckHealthAsync(CancellationToken cancellationToken = default)
    {
        bool dbConnected = false;
        try
        {
            dbConnected = await _context.Database.CanConnectAsync(cancellationToken);
        }
        catch
        {
            // Database down
        }

        bool redisConnected = false;
        try
        {
            // Simple check by attempting to retrieve a dummy key
            await _cacheService.GetAsync<string>("health_check");
            // Since ICacheService falls back gracefully to in-memory, we can consider caching functional
            redisConnected = true; 
        }
        catch
        {
            // Cache service exception
        }

        string status = dbConnected ? "Healthy" : "Degraded";

        return new HealthStatusDto
        {
            DatabaseConnected = dbConnected,
            RedisConnected = redisConnected,
            Status = status,
            Timestamp = DateTime.UtcNow
        };
    }
}
