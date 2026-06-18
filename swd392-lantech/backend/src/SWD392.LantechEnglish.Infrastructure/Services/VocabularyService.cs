using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Vocabulary;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Domain.Enums;
using SWD392.LantechEnglish.Infrastructure.Data;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class VocabularyService : IVocabularyService
{
    private readonly AppDbContext _context;

    public VocabularyService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<VocabularyDto>> GetVocabularyListAsync(string? level, string? search, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Vocabularies
            .Include(v => v.Tags)
            .AsQueryable();

        if (!string.IsNullOrEmpty(level) && Enum.TryParse<CefrLevel>(level, true, out var cefr))
        {
            query = query.Where(v => v.CefrLevel == cefr);
        }

        if (!string.IsNullOrEmpty(search))
        {
            var cleanSearch = search.Trim().ToLower();
            query = query.Where(v => v.Word.ToLower().Contains(cleanSearch) || 
                                     (v.PartOfSpeech != null && v.PartOfSpeech.ToLower().Contains(cleanSearch)));
        }

        var list = await query
            .OrderBy(v => v.Word)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var vocabularyIds = list.Select(v => v.Id).ToList();
        var translations = await _context.VocabularyTranslations
            .Where(t => vocabularyIds.Contains(t.VocabularyId))
            .ToListAsync(cancellationToken);

        return list.Select(v => MapToDto(v, translations.Where(t => t.VocabularyId == v.Id)));
    }

    public async Task<VocabularyDto?> GetVocabularyByIdAsync(Guid vocabularyId, CancellationToken cancellationToken = default)
    {
        var v = await _context.Vocabularies
            .Include(v => v.Tags)
            .FirstOrDefaultAsync(vo => vo.Id == vocabularyId, cancellationToken);
        if (v == null) return null;

        var translations = await _context.VocabularyTranslations
            .Where(t => t.VocabularyId == vocabularyId)
            .ToListAsync(cancellationToken);

        return MapToDto(v, translations);
    }

    public async Task<IEnumerable<VocabularyTranslationDto>> GetTranslationsAsync(Guid vocabularyId, CancellationToken cancellationToken = default)
    {
        var list = await _context.VocabularyTranslations
            .Where(t => t.VocabularyId == vocabularyId)
            .ToListAsync(cancellationToken);

        return list.Select(t => MapTranslationToDto(t));
    }

    public async Task<IEnumerable<VocabularyDto>> SearchVocabularyAsync(string query, CancellationToken cancellationToken = default)
    {
        return await GetVocabularyListAsync(null, query, 1, 30, cancellationToken);
    }

    public async Task<IEnumerable<VocabularyDto>> GetVocabularyByLevelAsync(CefrLevel level, CancellationToken cancellationToken = default)
    {
        return await GetVocabularyListAsync(level.ToString(), null, 1, 100, cancellationToken);
    }

    public async Task<IEnumerable<VocabularyDto>> GetRelatedVocabulariesAsync(Guid vocabularyId, CancellationToken cancellationToken = default)
    {
        var vocab = await _context.Vocabularies
            .Include(v => v.Tags)
            .FirstOrDefaultAsync(v => v.Id == vocabularyId, cancellationToken);
        if (vocab == null) return Enumerable.Empty<VocabularyDto>();

        var tagIds = vocab.Tags.Select(t => t.Id).ToList();
        List<Vocabulary> list;

        if (!tagIds.Any())
        {
            list = await _context.Vocabularies
                .Include(v => v.Tags)
                .Where(v => v.Id != vocabularyId && v.PartOfSpeech == vocab.PartOfSpeech)
                .Take(5)
                .ToListAsync(cancellationToken);
        }
        else
        {
            list = await _context.Vocabularies
                .Include(v => v.Tags)
                .Where(v => v.Id != vocabularyId && v.Tags.Any(t => tagIds.Contains(t.Id)))
                .Take(5)
                .ToListAsync(cancellationToken);
        }

        var vocabularyIds = list.Select(v => v.Id).ToList();
        var translations = await _context.VocabularyTranslations
            .Where(t => vocabularyIds.Contains(t.VocabularyId))
            .ToListAsync(cancellationToken);

        return list.Select(v => MapToDto(v, translations.Where(t => t.VocabularyId == v.Id)));
    }

    private static VocabularyDto MapToDto(Vocabulary v, IEnumerable<VocabularyTranslation> trans) => new()
    {
        Id = v.Id,
        Word = v.Word,
        Ipa = v.Ipa,
        AudioUrl = v.AudioUrl,
        CefrLevel = v.CefrLevel.ToString(),
        PartOfSpeech = v.PartOfSpeech,
        ExampleSentence = v.ExampleSentence,
        ContentSource = v.ContentSource.ToString(),
        CreatedAt = v.CreatedAt,
        Translations = trans.Select(t => MapTranslationToDto(t)).ToList(),
        Tags = v.Tags.Select(t => t.Name).ToList()
    };

    private static VocabularyTranslationDto MapTranslationToDto(VocabularyTranslation t) => new()
    {
        Id = t.Id,
        VocabularyId = t.VocabularyId,
        LanguageCode = t.LanguageCode,
        Meaning = t.Meaning,
        Explanation = t.Explanation,
        ExampleTranslation = t.ExampleTranslation
    };
}
