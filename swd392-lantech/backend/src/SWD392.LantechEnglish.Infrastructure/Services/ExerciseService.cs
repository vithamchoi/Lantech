using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Exercises;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Domain.Enums;
using SWD392.LantechEnglish.Infrastructure.Data;
using System.Text.Json;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class ExerciseService : IExerciseService
{
    private readonly AppDbContext _context;
    private readonly IGamificationService _gamificationService;

    public ExerciseService(AppDbContext context, IGamificationService gamificationService)
    {
        _context = context;
        _gamificationService = gamificationService;
    }

    public async Task<ExerciseDto?> GetExerciseByIdAsync(Guid exerciseId, CancellationToken cancellationToken = default)
    {
        var ex = await _context.Exercises.FindAsync(new object[] { exerciseId }, cancellationToken);
        return ex == null ? null : MapToDto(ex);
    }

    public async Task<IEnumerable<ExerciseDto>> GetExercisesByLessonIdAsync(Guid lessonId, CancellationToken cancellationToken = default)
    {
        var list = await _context.Exercises
            .Where(e => e.LessonId == lessonId)
            .OrderBy(e => e.OrderIndex)
            .ToListAsync(cancellationToken);

        return list.Select(e => MapToDto(e));
    }

    public async Task<ExerciseAttemptDto> SubmitExerciseAttemptAsync(Guid exerciseId, Guid userId, SubmitExerciseRequest request, CancellationToken cancellationToken = default)
    {
        var exercise = await _context.Exercises.FindAsync(new object[] { exerciseId }, cancellationToken);
        if (exercise == null) throw new KeyNotFoundException("Exercise not found");

        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        string cleanCorrect = CleanAnswer(exercise.CorrectAnswerJson);
        string cleanUser = request.Answer.Trim().ToLower();

        bool isCorrect = cleanUser == cleanCorrect;
        double score = isCorrect ? 100.0 : 0.0;
        
        string feedback = isCorrect 
            ? "Correct! Great job." 
            : $"Incorrect. The correct answer was: '{cleanCorrect.ToUpper()}'." + 
              (string.IsNullOrEmpty(exercise.Explanation) ? "" : $" Explanation: {exercise.Explanation}");

        var attempt = new ExerciseAttempt
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ExerciseId = exerciseId,
            AnswerJson = JsonSerializer.Serialize(request.Answer),
            IsCorrect = isCorrect,
            Score = score,
            Feedback = feedback,
            CreatedAt = DateTime.UtcNow
        };

        _context.ExerciseAttempts.Add(attempt);

        if (isCorrect)
        {
            // Award XP
            int reward = exercise.XpReward > 0 ? exercise.XpReward : 5;
            user.Xp += reward;
            _context.XpTransactions.Add(new XpTransaction
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Amount = reward,
                Reason = $"Correct exercise practice: {exercise.Prompt}",
                CreatedAt = DateTime.UtcNow
            });

            // Check and award badges dynamically
            await _gamificationService.CheckAndAwardBadgesAsync(userId, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new ExerciseAttemptDto
        {
            Id = attempt.Id,
            UserId = attempt.UserId,
            ExerciseId = attempt.ExerciseId,
            Answer = request.Answer,
            IsCorrect = attempt.IsCorrect,
            Score = attempt.Score,
            Feedback = attempt.Feedback,
            CreatedAt = attempt.CreatedAt
        };
    }

    private static string CleanAnswer(string? json)
    {
        if (string.IsNullOrEmpty(json)) return string.Empty;
        try
        {
            var parsed = JsonSerializer.Deserialize<string>(json);
            return (parsed ?? string.Empty).Trim().ToLower();
        }
        catch
        {
            return json.Trim().ToLower();
        }
    }

    private static ExerciseDto MapToDto(Exercise e) => new()
    {
        Id = e.Id,
        LessonId = e.LessonId,
        Type = e.Type.ToString(),
        Prompt = e.Prompt,
        Instruction = e.Instruction,
        SourceLanguageCode = e.SourceLanguageCode,
        TargetText = e.TargetText,
        Options = string.IsNullOrEmpty(e.OptionsJson) 
            ? new List<string>() 
            : JsonSerializer.Deserialize<List<string>>(e.OptionsJson) ?? new List<string>(),
        CorrectAnswer = CleanAnswer(e.CorrectAnswerJson),
        Explanation = e.Explanation,
        Difficulty = e.Difficulty,
        XpReward = e.XpReward,
        OrderIndex = e.OrderIndex,
        IsAiGenerated = e.IsAiGenerated
    };
}
