using SWD392.LantechEnglish.Application.DTOs.Languages;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface ILanguageService
{
    Task<IEnumerable<LanguageDto>> GetAllLanguagesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<LanguageDto>> GetSourceLanguagesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<LanguageDto>> GetTargetLanguagesAsync(CancellationToken cancellationToken = default);
}
