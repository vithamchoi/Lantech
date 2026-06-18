using SWD392.LantechEnglish.Application.DTOs.Dashboard;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardDataAsync(Guid userId, CancellationToken cancellationToken = default);
}
