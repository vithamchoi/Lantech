namespace SWD392.LantechEnglish.Domain.Entities;

public class Language
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string NativeName { get; set; } = string.Empty;
    public bool IsSourceSupported { get; set; }
    public bool IsTargetSupported { get; set; }
    public DateTime CreatedAt { get; set; }
}