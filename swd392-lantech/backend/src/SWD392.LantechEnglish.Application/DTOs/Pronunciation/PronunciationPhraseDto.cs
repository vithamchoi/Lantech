using System;

namespace SWD392.LantechEnglish.Application.DTOs.Pronunciation;

public class PronunciationPhraseDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Phonetic { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string[] Tags { get; set; } = Array.Empty<string>();
}
