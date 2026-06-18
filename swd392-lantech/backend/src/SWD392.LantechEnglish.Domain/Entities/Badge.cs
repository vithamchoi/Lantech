namespace SWD392.LantechEnglish.Domain.Entities;

public class Badge
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
    public string ConditionType { get; set; } = string.Empty;
    public int ConditionValue { get; set; }
}