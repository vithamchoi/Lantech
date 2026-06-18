namespace SWD392.LantechEnglish.Application.DTOs.Gamification;

public class UserBadgeDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid BadgeId { get; set; }
    public BadgeDto Badge { get; set; } = null!;
    public DateTime EarnedAt { get; set; }
}
