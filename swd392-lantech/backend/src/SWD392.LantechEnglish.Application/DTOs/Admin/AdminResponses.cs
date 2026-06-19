using System;
using System.Collections.Generic;

namespace SWD392.LantechEnglish.Application.DTOs.Admin;

public class AdminStatsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalLessons { get; set; }
    public int TotalQuestions { get; set; }
    public int TotalBadges { get; set; }
}

public class AdminUserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Joined { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string Status { get; set; } = null!;
    public int Xp { get; set; }
}

public class AdminLessonDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Level { get; set; } = null!;
    public int Exercises { get; set; }
    public int Students { get; set; }
    public int Order { get; set; }
    public string Description { get; set; } = null!;
    public string Skill { get; set; } = null!;
    public string? Topic { get; set; }
    public int EstimatedMinutes { get; set; }
    public int XpReward { get; set; }
    public bool IsPublished { get; set; }
}

public class AdminQuestionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = null!;
    public string Skill { get; set; } = null!;
    public string Level { get; set; } = null!;
    public string Difficulty { get; set; } = null!;
    public Guid LessonId { get; set; }
    public string Type { get; set; } = null!;
    public string? Instruction { get; set; }
    public string CorrectAnswer { get; set; } = null!;
    public List<string>? Options { get; set; }
    public string? Explanation { get; set; }
    public int XpReward { get; set; }
    public int OrderIndex { get; set; }
}

public class AdminVocabularyDto
{
    public Guid Id { get; set; }
    public string Word { get; set; } = null!;
    public string Phoneme { get; set; } = null!;
    public string Level { get; set; } = null!;
    public string Definition { get; set; } = null!;
    public string Added { get; set; } = null!;
}

public class AdminBadgeDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? IconUrl { get; set; }
    public string ConditionType { get; set; } = null!;
    public int ConditionValue { get; set; }
    public int RequiredXP { get; set; }
    public int Holders { get; set; }
}
