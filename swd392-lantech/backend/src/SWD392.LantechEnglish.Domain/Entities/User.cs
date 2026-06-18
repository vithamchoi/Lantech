using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; }
    public string SourceLanguageCode { get; set; } = string.Empty;
    public string TargetLanguageCode { get; set; } = "en";
    public CefrLevel? CurrentCefrLevel { get; set; }
    public LevelSource? LevelSource { get; set; }
    public int Xp { get; set; }
    public int StreakCount { get; set; }
    public DateTime? LastStudyDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}