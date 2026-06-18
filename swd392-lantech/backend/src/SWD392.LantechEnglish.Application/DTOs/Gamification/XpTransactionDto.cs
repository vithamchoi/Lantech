namespace SWD392.LantechEnglish.Application.DTOs.Gamification;

public class XpTransactionDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public int Amount { get; set; }
    public string Description { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
