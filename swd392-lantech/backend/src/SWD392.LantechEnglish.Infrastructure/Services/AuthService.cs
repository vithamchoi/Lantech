using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Auth;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Domain.Enums;
using SWD392.LantechEnglish.Infrastructure.Data;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;

    public AuthService(AppDbContext context, IPasswordHasher passwordHasher, IJwtService jwtService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        // Check if email already exists
        if (await _context.Users.AnyAsync(u => u.Email == request.Email, cancellationToken))
        {
            throw new InvalidOperationException("Email already exists");
        }

        // Validate source language exists
        var language = await _context.Languages.FirstOrDefaultAsync(l => l.Code == request.SourceLanguageCode && l.IsSourceSupported, cancellationToken);
        if (language == null)
        {
            throw new InvalidOperationException($"Source language '{request.SourceLanguageCode}' is not supported");
        }

        // Create new user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            FullName = request.FullName,
            Role = UserRole.User,
            Status = UserStatus.Active,
            SourceLanguageCode = request.SourceLanguageCode,
            TargetLanguageCode = "en",
            Xp = 0,
            StreakCount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        // Generate tokens
        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();
        await _jwtService.CreateRefreshTokenAsync(user.Id, refreshToken, cancellationToken);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = MapToUserDto(user)
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        
        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (user.Status != UserStatus.Active)
        {
            throw new UnauthorizedAccessException("Account is disabled");
        }

        // Generate tokens
        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();
        await _jwtService.CreateRefreshTokenAsync(user.Id, refreshToken, cancellationToken);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = MapToUserDto(user)
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var tokenHash = _jwtService.HashToken(refreshToken);
        var storedToken = await _jwtService.GetRefreshTokenAsync(tokenHash, cancellationToken);

        if (storedToken == null || storedToken.User == null)
        {
            throw new UnauthorizedAccessException("Invalid refresh token");
        }

        if (storedToken.User.Status != UserStatus.Active)
        {
            throw new UnauthorizedAccessException("Account is disabled");
        }

        // Revoke old token
        await _jwtService.RevokeRefreshTokenAsync(storedToken.Id, cancellationToken);

        // Generate new tokens
        var newAccessToken = _jwtService.GenerateAccessToken(storedToken.User);
        var newRefreshToken = _jwtService.GenerateRefreshToken();
        await _jwtService.CreateRefreshTokenAsync(storedToken.User.Id, newRefreshToken, cancellationToken);

        return new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            User = MapToUserDto(storedToken.User)
        };
    }

    public async Task LogoutAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var tokenHash = _jwtService.HashToken(refreshToken);
        var storedToken = await _jwtService.GetRefreshTokenAsync(tokenHash, cancellationToken);

        if (storedToken != null)
        {
            await _jwtService.RevokeRefreshTokenAsync(storedToken.Id, cancellationToken);
        }
    }

    public async Task<UserDto?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        return user != null ? MapToUserDto(user) : null;
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            AvatarUrl = user.AvatarUrl,
            Role = user.Role.ToString(),
            SourceLanguageCode = user.SourceLanguageCode,
            TargetLanguageCode = user.TargetLanguageCode,
            CurrentCefrLevel = user.CurrentCefrLevel?.ToString(),
            Xp = user.Xp,
            StreakCount = user.StreakCount
        };
    }
    public async Task<AuthResponse> GoogleLoginAsync(string idToken, CancellationToken cancellationToken = default)
    {
        // Validate the Google JWT token
        Google.Apis.Auth.GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(idToken);
        }
        catch (Exception ex)
        {
            throw new UnauthorizedAccessException($"Invalid Google token: {ex.Message}");
        }

        if (payload == null)
            throw new UnauthorizedAccessException("Invalid Google token payload.");

        // Check if user exists by email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email, cancellationToken);
        if (user == null)
        {
            // Register new user
            user = new User
            {
                Id = Guid.NewGuid(),
                FullName = payload.Name ?? "Google User",
                Email = payload.Email,
                AvatarUrl = payload.Picture,
                PasswordHash = _passwordHasher.HashPassword(Guid.NewGuid().ToString()), // Random dummy password
                Role = UserRole.User,
                Status = UserStatus.Active,
                SourceLanguageCode = "vi",
                TargetLanguageCode = "en"
            };
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);
        }
        else
        {
            // Update avatar/name if they changed
            bool updated = false;
            if (string.IsNullOrEmpty(user.AvatarUrl) && !string.IsNullOrEmpty(payload.Picture))
            {
                user.AvatarUrl = payload.Picture;
                updated = true;
            }
            if (updated) await _context.SaveChangesAsync(cancellationToken);
        }

        // Generate tokens
        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        // Save refresh token
        var refreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            TokenHash = _passwordHasher.HashPassword(refreshToken),
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };
        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync(cancellationToken);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = MapToUserDto(user)
        };
    }
}