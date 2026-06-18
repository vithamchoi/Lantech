using SWD392.LantechEnglish.Application.DTOs.Auth;
using SWD392.LantechEnglish.Application.DTOs.Users;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface IUserService
{
    Task<UserDto> UpdateProfileAsync(Guid userId, UpdateUserRequest request, CancellationToken cancellationToken = default);
    Task<UserDto> UpdateSourceLanguageAsync(Guid userId, string sourceLanguageCode, CancellationToken cancellationToken = default);
    Task<UserDto> UpdateTargetLevelAsync(Guid userId, string currentCefrLevel, CancellationToken cancellationToken = default);
    Task<StudySummaryDto> GetStudySummaryAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default);
}
