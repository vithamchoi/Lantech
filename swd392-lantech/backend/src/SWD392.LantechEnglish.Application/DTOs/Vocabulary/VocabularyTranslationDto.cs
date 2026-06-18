namespace SWD392.LantechEnglish.Application.DTOs.Vocabulary;

public class VocabularyTranslationDto
{
    public Guid Id { get; set; }
    public Guid VocabularyId { get; set; }
    public string LanguageCode { get; set; } = null!;
    public string Meaning { get; set; } = null!;
    public string? Explanation { get; set; }
    public string? ExampleTranslation { get; set; }
}
