using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Pronunciation;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Domain.Enums;
using SWD392.LantechEnglish.Infrastructure.Data;
using System.Text.Json;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class PronunciationService : IPronunciationService
{
    private readonly AppDbContext _context;
    private readonly ISpeechAssessmentProvider _speechProvider;

    public PronunciationService(AppDbContext context, ISpeechAssessmentProvider speechProvider)
    {
        _context = context;
        _speechProvider = speechProvider;
    }

    public async Task<PronunciationAttemptDto> SubmitAttemptAsync(Guid userId, PronunciationAttemptRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        var result = await _speechProvider.AssessPronunciationAsync(request.TargetText, request.TranscriptText, cancellationToken);

        var attempt = new PronunciationAttempt
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ExerciseId = request.ExerciseId,
            TargetText = request.TargetText,
            TranscriptText = request.TranscriptText,
            Score = result.Score,
            Accuracy = result.Accuracy,
            Fluency = result.Fluency,
            Completeness = result.Completeness,
            Feedback = result.Feedback,
            WordLevelFeedbackJson = result.WordLevelFeedbackJson,
            Provider = PronunciationProvider.Mock,
            CreatedAt = DateTime.UtcNow
        };

        _context.PronunciationAttempts.Add(attempt);

        // Award XP if user scored reasonably well
        if (result.Score >= 60)
        {
            int reward = result.Score >= 85 ? 10 : 5;
            user.Xp += reward;
            _context.XpTransactions.Add(new XpTransaction
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Amount = reward,
                Reason = $"Speech pronunciation practice score: {result.Score}%",
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(attempt);
    }

    public async Task<IEnumerable<PronunciationAttemptDto>> GetAttemptsHistoryAsync(Guid userId, int limit, CancellationToken cancellationToken = default)
    {
        var list = await _context.PronunciationAttempts
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return list.Select(a => MapToDto(a));
    }

    private static PronunciationAttemptDto MapToDto(PronunciationAttempt a)
    {
        object? wordLevel = null;
        if (!string.IsNullOrEmpty(a.WordLevelFeedbackJson))
        {
            try
            {
                wordLevel = JsonSerializer.Deserialize<object>(a.WordLevelFeedbackJson);
            }
            catch
            {
                // Fallback
            }
        }

        return new PronunciationAttemptDto
        {
            Id = a.Id,
            UserId = a.UserId,
            ExerciseId = a.ExerciseId,
            TargetText = a.TargetText,
            TranscriptText = a.TranscriptText,
            AudioUrl = a.AudioUrl,
            Score = a.Score,
            Accuracy = a.Accuracy,
            Fluency = a.Fluency,
            Completeness = a.Completeness,
            Feedback = a.Feedback,
            WordLevelFeedback = wordLevel,
            Provider = a.Provider.ToString(),
            CreatedAt = a.CreatedAt
        };
    }
}
