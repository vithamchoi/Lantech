using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Languages;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Infrastructure.Data;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class LanguageService : ILanguageService
{
    private readonly AppDbContext _context;

    public LanguageService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<LanguageDto>> GetAllLanguagesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Languages
            .Select(l => MapToDto(l))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<LanguageDto>> GetSourceLanguagesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Languages
            .Where(l => l.IsSourceSupported)
            .Select(l => MapToDto(l))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<LanguageDto>> GetTargetLanguagesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Languages
            .Where(l => l.IsTargetSupported)
            .Select(l => MapToDto(l))
            .ToListAsync(cancellationToken);
    }

    private static LanguageDto MapToDto(Domain.Entities.Language l) => new()
    {
        Id = l.Id,
        Code = l.Code,
        Name = l.Name,
        NativeName = l.NativeName,
        IsSourceSupported = l.IsSourceSupported,
        IsTargetSupported = l.IsTargetSupported
    };
}
