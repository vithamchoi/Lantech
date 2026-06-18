using SWD392.LantechEnglish.Application.DTOs.Health;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface IHealthService
{
    Task<HealthStatusDto> CheckHealthAsync(CancellationToken cancellationToken = default);
}
