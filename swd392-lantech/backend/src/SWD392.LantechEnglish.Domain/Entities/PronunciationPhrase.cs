using System;

namespace SWD392.LantechEnglish.Domain.Entities;

public class PronunciationPhrase
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Phonetic { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty; // Comma-separated values
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
