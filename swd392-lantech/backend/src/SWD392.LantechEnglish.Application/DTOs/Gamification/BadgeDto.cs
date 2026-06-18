namespace SWD392.LantechEnglish.Application.DTOs.Gamification;

public class BadgeDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? IconUrl { get; set; }
    public int XpBonus { get; set; }
}
