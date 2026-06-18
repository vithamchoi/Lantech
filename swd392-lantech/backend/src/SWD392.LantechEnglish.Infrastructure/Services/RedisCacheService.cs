using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using SWD392.LantechEnglish.Application.Interfaces;
using System.Collections.Concurrent;
using System.Text.Json;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class RedisCacheService : ICacheService
{
    private readonly IDatabase? _redisDb;
    private readonly ILogger<RedisCacheService> _logger;
    private readonly ConcurrentDictionary<string, (string Json, DateTime ExpiresAt)> _inMemoryDb = new();

    public RedisCacheService(IConfiguration configuration, ILogger<RedisCacheService> logger)
    {
        _logger = logger;
        try
        {
            var connectionString = configuration.GetConnectionString("Redis") ?? "localhost:6379";
            var connection = ConnectionMultiplexer.Connect(connectionString);
            _redisDb = connection.GetDatabase();
            _logger.LogInformation("Successfully connected to Redis cache.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to connect to Redis. Falling back to In-Memory Cache.");
            _redisDb = null;
        }
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        if (_redisDb != null)
        {
            try
            {
                var val = await _redisDb.StringGetAsync(key);
                if (val.HasValue)
                {
                    return JsonSerializer.Deserialize<T>(val!);
                }
                return default;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis GET failed. Reading from in-memory fallback.");
            }
        }

        // In-memory fallback
        if (_inMemoryDb.TryGetValue(key, out var record))
        {
            if (record.ExpiresAt > DateTime.UtcNow)
            {
                return JsonSerializer.Deserialize<T>(record.Json);
            }
            _inMemoryDb.TryRemove(key, out _);
        }

        return default;
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        var json = JsonSerializer.Serialize(value);
        var exp = expiration ?? TimeSpan.FromHours(24);

        if (_redisDb != null)
        {
            try
            {
                await _redisDb.StringSetAsync(key, json, exp);
                return;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis SET failed. Saving to in-memory fallback.");
            }
        }

        // In-memory fallback
        _inMemoryDb[key] = (json, DateTime.UtcNow.Add(exp));
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        if (_redisDb != null)
        {
            try
            {
                await _redisDb.KeyDeleteAsync(key);
                return;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis DELETE failed. Removing from in-memory fallback.");
            }
        }

        _inMemoryDb.TryRemove(key, out _);
    }
}
