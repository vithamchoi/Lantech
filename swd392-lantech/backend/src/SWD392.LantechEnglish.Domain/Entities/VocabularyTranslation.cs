namespace SWD392.LantechEnglish.Domain.Entities;

public class VocabularyTranslation
{
    public Guid Id { get; set; }
    public Guid VocabularyId { get; set; }
    public string LanguageCode { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public string? ExampleTranslation { get; set; }
}