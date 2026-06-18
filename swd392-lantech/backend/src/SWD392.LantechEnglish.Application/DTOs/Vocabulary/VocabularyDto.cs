namespace SWD392.LantechEnglish.Application.DTOs.Vocabulary;

public class VocabularyDto
{
    public Guid Id { get; set; }
    public string Word { get; set; } = null!;
    public string? Ipa { get; set; }
    public string? AudioUrl { get; set; }
    public string CefrLevel { get; set; } = null!;
    public string? PartOfSpeech { get; set; }
    public string? ExampleSentence { get; set; }
    public string ContentSource { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public List<VocabularyTranslationDto> Translations { get; set; } = new();
    public List<string> Tags { get; set; } = new();
}
