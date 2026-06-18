namespace SWD392.LantechEnglish.Application.DTOs.Languages;

public class LanguageDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string NativeName { get; set; } = null!;
    public bool IsSourceSupported { get; set; }
    public bool IsTargetSupported { get; set; }
}
