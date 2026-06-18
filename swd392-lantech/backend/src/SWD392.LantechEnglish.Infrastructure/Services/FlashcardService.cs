using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Flashcards;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Domain.Enums;
using SWD392.LantechEnglish.Infrastructure.Data;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class FlashcardService : IFlashcardService
{
    private readonly AppDbContext _context;

    public FlashcardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<FlashcardDto>> GetFlashcardsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        var list = await _context.Flashcards
            .Where(f => f.UserId == userId)
            .ToListAsync(cancellationToken);

        return await MapToDtoListAsync(list, user.SourceLanguageCode, cancellationToken);
    }

    public async Task<IEnumerable<FlashcardDto>> GetDueFlashcardsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        var list = await _context.Flashcards
            .Where(f => f.UserId == userId && f.DueDate <= DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        return await MapToDtoListAsync(list, user.SourceLanguageCode, cancellationToken);
    }

    public async Task<FlashcardDto?> GetFlashcardByIdAsync(Guid flashcardId, Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        var f = await _context.Flashcards
            .FirstOrDefaultAsync(fl => fl.Id == flashcardId && fl.UserId == userId, cancellationToken);

        if (f == null) return null;

        var dtoList = await MapToDtoListAsync(new List<Flashcard> { f }, user.SourceLanguageCode, cancellationToken);
        return dtoList.FirstOrDefault();
    }

    public async Task<FlashcardDto> CreateFlashcardFromVocabularyAsync(Guid userId, Guid vocabularyId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        var vocab = await _context.Vocabularies.FindAsync(new object[] { vocabularyId }, cancellationToken);
        if (vocab == null) throw new KeyNotFoundException("Vocabulary word not found");

        // Check if already exists
        var existing = await _context.Flashcards
            .FirstOrDefaultAsync(f => f.UserId == userId && f.VocabularyId == vocabularyId, cancellationToken);

        if (existing != null)
        {
            var dtoList = await MapToDtoListAsync(new List<Flashcard> { existing }, user.SourceLanguageCode, cancellationToken);
            return dtoList.First();
        }

        var card = new Flashcard
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            VocabularyId = vocabularyId,
            SourceLanguageCode = user.SourceLanguageCode,
            EaseFactor = 2.5,
            Interval = 0,
            Repetition = 0,
            DueDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _context.Flashcards.Add(card);
        await _context.SaveChangesAsync(cancellationToken);

        var createdDtoList = await MapToDtoListAsync(new List<Flashcard> { card }, user.SourceLanguageCode, cancellationToken);
        return createdDtoList.First();
    }

    public async Task RemoveFlashcardAsync(Guid userId, Guid flashcardId, CancellationToken cancellationToken = default)
    {
        // Try finding by vocabularyId first as the frontend sends vocabularyId as the ID for toggling
        var card = await _context.Flashcards
            .FirstOrDefaultAsync(f => f.UserId == userId && (f.Id == flashcardId || f.VocabularyId == flashcardId), cancellationToken);

        if (card == null) throw new KeyNotFoundException("Flashcard not found in deck");

        _context.Flashcards.Remove(card);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<FlashcardReviewDto> ReviewFlashcardAsync(Guid flashcardId, Guid userId, ReviewFlashcardRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        var card = await _context.Flashcards
            .FirstOrDefaultAsync(f => f.Id == flashcardId && f.UserId == userId, cancellationToken);

        if (card == null) throw new KeyNotFoundException("Flashcard not found");

        int oldInterval = card.Interval;
        double oldEf = card.EaseFactor;

        // --- SM-2 Algorithm Calculation ---
        int quality = request.Quality;
        double ef = oldEf;
        int rep = card.Repetition;
        int interval = oldInterval;

        if (quality >= 3)
        {
            if (rep == 0)
            {
                interval = 1;
            }
            else if (rep == 1)
            {
                interval = 6;
            }
            else
            {
                interval = (int)Math.Round(interval * ef);
            }
            rep += 1;
        }
        else
        {
            rep = 0;
            interval = 1;
        }

        // Adjust Ease Factor (EF)
        ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (ef < 1.3) ef = 1.3;

        // Update card parameters
        card.EaseFactor = ef;
        card.Interval = interval;
        card.Repetition = rep;
        card.LastReviewedAt = DateTime.UtcNow;
        card.DueDate = DateTime.UtcNow.AddDays(interval);

        // Save Review log
        var log = new FlashcardReview
        {
            Id = Guid.NewGuid(),
            FlashcardId = flashcardId,
            UserId = userId,
            Quality = quality,
            OldInterval = oldInterval,
            NewInterval = interval,
            OldEaseFactor = oldEf,
            NewEaseFactor = ef,
            ReviewedAt = DateTime.UtcNow
        };

        _context.FlashcardReviews.Add(log);

        // Award small XP reward for studying
        int xpEarned = quality >= 3 ? 2 : 1;
        user.Xp += xpEarned;
        _context.XpTransactions.Add(new XpTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Amount = xpEarned,
            Reason = $"Reviewed vocabulary flashcard (quality {quality})",
            CreatedAt = DateTime.UtcNow
        });

        // Award badge: FIRST_FLASHCARD_REVIEW
        var badge = await _context.Badges.FirstOrDefaultAsync(b => b.Code == "FIRST_FLASHCARD_REVIEW", cancellationToken);
        if (badge != null)
        {
            var alreadyHas = await _context.UserBadges.AnyAsync(ub => ub.UserId == userId && ub.BadgeId == badge.Id, cancellationToken);
            if (!alreadyHas)
            {
                _context.UserBadges.Add(new UserBadge
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    BadgeId = badge.Id,
                    EarnedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new FlashcardReviewDto
        {
            Id = log.Id,
            FlashcardId = log.FlashcardId,
            Quality = log.Quality,
            OldInterval = log.OldInterval,
            NewInterval = log.NewInterval,
            OldEaseFactor = log.OldEaseFactor,
            NewEaseFactor = log.NewEaseFactor,
            DueDate = card.DueDate,
            ReviewedAt = log.ReviewedAt
        };
    }

    private async Task<List<FlashcardDto>> MapToDtoListAsync(List<Flashcard> cards, string langCode, CancellationToken cancellationToken)
    {
        if (cards.Count == 0) return new List<FlashcardDto>();

        var vocabIds = cards.Select(c => c.VocabularyId).ToList();
        
        var vocabularies = await _context.Vocabularies
            .Where(v => vocabIds.Contains(v.Id))
            .ToListAsync(cancellationToken);

        var translations = await _context.VocabularyTranslations
            .Where(t => vocabIds.Contains(t.VocabularyId) && t.LanguageCode == langCode)
            .ToListAsync(cancellationToken);

        var list = new List<FlashcardDto>();
        foreach (var c in cards)
        {
            var v = vocabularies.FirstOrDefault(vo => vo.Id == c.VocabularyId);
            if (v == null) continue;

            var t = translations.FirstOrDefault(tr => tr.VocabularyId == c.VocabularyId);

            list.Add(new FlashcardDto
            {
                Id = c.Id,
                UserId = c.UserId,
                VocabularyId = c.VocabularyId,
                SourceLanguageCode = c.SourceLanguageCode,
                EaseFactor = c.EaseFactor,
                Interval = c.Interval,
                Repetition = c.Repetition,
                DueDate = c.DueDate,
                LastReviewedAt = c.LastReviewedAt,
                Word = v.Word,
                Ipa = v.Ipa,
                PartOfSpeech = v.PartOfSpeech,
                ExampleSentence = v.ExampleSentence,
                Meaning = t?.Meaning ?? "Meaning not translated yet",
                Explanation = t?.Explanation,
                ExampleTranslation = t?.ExampleTranslation
            });
        }
        return list;
    }
}
