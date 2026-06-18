using SWD392.LantechEnglish.Domain.Enums;

namespace SWD392.LantechEnglish.Domain.Entities;

public class Vocabulary
{
    public Guid Id { get; set; }
    public string Word { get; set; } = string.Empty;
    public string? Ipa { get; set; }
    public string? AudioUrl { get; set; }
    public CefrLevel CefrLevel { get; set; }
    public string? PartOfSpeech { get; set; }
    public string? ExampleSentence { get; set; }
    public ContentSource ContentSource { get; set; }
    public DateTime CreatedAt { get; set; }
    public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();
}