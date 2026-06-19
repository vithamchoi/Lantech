using System.ComponentModel.DataAnnotations;

namespace SWD392.LantechEnglish.Application.DTOs.Admin;

public class CreateLessonRequest
{
    [Required]
    public string CefrLevel { get; set; } = null!;
    [Required]
    public string Title { get; set; } = null!;
    [Required]
    public string Description { get; set; } = null!;
    [Required]
    public string Skill { get; set; } = null!;
    public string? Topic { get; set; }
    public string ContentSource { get; set; } = "Curated";
    public int OrderIndex { get; set; }
    public int EstimatedMinutes { get; set; } = 15;
    public int XpReward { get; set; } = 20;
    public bool IsPublished { get; set; } = true;
}

public class CreateExerciseRequest
{
    [Required]
    public Guid LessonId { get; set; }
    [Required]
    public string Type { get; set; } = null!;
    [Required]
    public string Prompt { get; set; } = null!;
    public string? Instruction { get; set; }
    public string? SourceLanguageCode { get; set; }
    public string? TargetText { get; set; }
    public List<string>? Options { get; set; }
    [Required]
    public string CorrectAnswer { get; set; } = null!;
    public string? Explanation { get; set; }
    public int Difficulty { get; set; } = 1;
    public int XpReward { get; set; } = 5;
    public int OrderIndex { get; set; }
}

public class AdminVocabularyTranslationRequest
{
    [Required]
    public string LanguageCode { get; set; } = null!;
    [Required]
    public string Meaning { get; set; } = null!;
    public string? Explanation { get; set; }
    public string? ExampleTranslation { get; set; }
}

public class CreateVocabularyRequest
{
    [Required]
    public string Word { get; set; } = null!;
    public string? Ipa { get; set; }
    public string? AudioUrl { get; set; }
    [Required]
    public string CefrLevel { get; set; } = null!;
    public string? PartOfSpeech { get; set; }
    public string? ExampleSentence { get; set; }
    public string ContentSource { get; set; } = "Curated";
    public List<AdminVocabularyTranslationRequest> Translations { get; set; } = new();
}

public class CreateBadgeRequest
{
    [Required]
    public string Code { get; set; } = null!;
    [Required]
    public string Name { get; set; } = null!;
    [Required]
    public string Description { get; set; } = null!;
    public string? IconUrl { get; set; }
    [Required]
    public string ConditionType { get; set; } = null!;
    [Required]
    public int ConditionValue { get; set; }
}

public class UpdateUserRequest
{
    [Required]
    public string Username { get; set; } = null!;
    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;
    public int Xp { get; set; }
}

