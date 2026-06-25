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
    private readonly ISpeechAssessmentProvider _speechProvider;
    private readonly IAIProvider _aiProvider;

    public ExerciseService(
        AppDbContext context, 
        IGamificationService gamificationService,
        ISpeechAssessmentProvider speechProvider,
        IAIProvider aiProvider)
    {
        _context = context;
        _gamificationService = gamificationService;
        _speechProvider = speechProvider;
        _aiProvider = aiProvider;
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

        bool isCorrect = false;
        double score = 0.0;
        string feedback = string.Empty;

        if (exercise.Type == ExerciseType.Speaking)
        {
            byte[] audioBytes;
            try
            {
                audioBytes = Convert.FromBase64String(request.Answer);
            }
            catch (FormatException)
            {
                throw new ArgumentException("Audio is not in valid Base64 format.");
            }

            var targetText = !string.IsNullOrEmpty(exercise.TargetText) ? exercise.TargetText : CleanAnswer(exercise.CorrectAnswerJson);
            var result = await _speechProvider.AssessPronunciationAsync(targetText, audioBytes, cancellationToken);

            isCorrect = result.Score >= 60;
            score = result.Score;

            var feedbackObj = new
            {
                score = result.Score,
                accuracy = result.Accuracy,
                fluency = result.Fluency,
                completeness = result.Completeness,
                feedback = result.Feedback,
                transcriptText = result.TranscriptText,
                wordLevelFeedback = string.IsNullOrEmpty(result.WordLevelFeedbackJson)
                    ? null
                    : JsonSerializer.Deserialize<object>(result.WordLevelFeedbackJson)
            };
            feedback = JsonSerializer.Serialize(feedbackObj);
        }
        else if (exercise.Type == ExerciseType.Writing)
        {
            var (rawScore, aiFeedback) = await _aiProvider.GradeWritingAsync(exercise.Prompt, request.Answer, user.SourceLanguageCode ?? "vi", cancellationToken);
            
            // Map 0-100 to a 10-point scale: convert rawScore (0-100) to 1-10
            score = Math.Round(rawScore / 10.0, 1);
            if (score < 1.0) score = 1.0;
            if (score > 10.0) score = 10.0;

            isCorrect = score >= 5.0;

            var feedbackObj = new
            {
                score = score,
                rawScore = rawScore,
                feedback = aiFeedback
            };
            feedback = JsonSerializer.Serialize(feedbackObj);
        }
        else
        {
            string cleanCorrect = CleanAnswer(exercise.CorrectAnswerJson);
            string cleanUser = request.Answer.Trim().ToLower();

            isCorrect = cleanUser == cleanCorrect;
            score = isCorrect ? 100.0 : 0.0;

            feedback = isCorrect
                ? "Correct! Great job."
                : $"Incorrect. The correct answer was: '{cleanCorrect.ToUpper()}'." +
                  (string.IsNullOrEmpty(exercise.Explanation) ? "" : $" Explanation: {exercise.Explanation}");
        }

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
