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

        byte[] audioBytes;
        try
        {
            audioBytes = Convert.FromBase64String(request.AudioBase64);
        }
        catch (FormatException)
        {
            throw new ArgumentException("Audio is not in valid Base64 format.");
        }

        var result = await _speechProvider.AssessPronunciationAsync(request.TargetText, audioBytes, cancellationToken);

        var attempt = new PronunciationAttempt
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ExerciseId = request.ExerciseId,
            TargetText = request.TargetText,
            TranscriptText = result.TranscriptText ?? string.Empty,
            Score = result.Score,
            Accuracy = result.Accuracy,
            Fluency = result.Fluency,
            Completeness = result.Completeness,
            Feedback = result.Feedback,
            WordLevelFeedbackJson = result.WordLevelFeedbackJson,
            Provider = PronunciationProvider.AzureSpeech,
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

        return MapToDto(attempt, user.SourceLanguageCode);
    }

    public async Task<IEnumerable<PronunciationAttemptDto>> GetAttemptsHistoryAsync(Guid userId, int limit, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        var langCode = user?.SourceLanguageCode ?? "vi";

        var list = await _context.PronunciationAttempts
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return list.Select(a => MapToDto(a, langCode));
    }

    private static PronunciationAttemptDto MapToDto(PronunciationAttempt a, string langCode)
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
            Suggestions = GeneratePronunciationTips(a.WordLevelFeedbackJson ?? string.Empty, langCode),
            Provider = a.Provider.ToString(),
            CreatedAt = a.CreatedAt
        };
    }

    private static List<string> GeneratePronunciationTips(string wordLevelFeedbackJson, string langCode)
    {
        var tips = new List<string>();
        if (string.IsNullOrEmpty(wordLevelFeedbackJson)) return tips;

        langCode = (langCode ?? "vi").ToLower();

        try
        {
            using var doc = JsonDocument.Parse(wordLevelFeedbackJson);
            var words = doc.RootElement.EnumerateArray().ToList();

            var mispronounced = words
                .Where(w => w.TryGetProperty("errorType", out var err) && err.GetString() == "Mispronunciation")
                .ToList();

            var omitted = words
                .Where(w => w.TryGetProperty("errorType", out var err) && err.GetString() == "Omission")
                .ToList();

            if (omitted.Any())
            {
                var omittedWords = string.Join(", ", omitted.Take(3).Select(w => $"\"{w.GetProperty("word").GetString()}\""));
                if (langCode == "ja")
                {
                    tips.Add($"すべての単語を発音するようにしてください。以下の単語がスキップされたようです：{omittedWords}。");
                }
                else if (langCode == "ko")
                {
                    tips.Add($"모든 단어를 발음했는지 확인하세요. 다음 단어들은 생략된 것으로 보입니다: {omittedWords}.");
                }
                else // default to vi
                {
                    tips.Add($"Hãy đảm bảo phát âm tất cả các từ. Các từ sau đây có vẻ đã bị bỏ qua: {omittedWords}.");
                }
            }

            foreach (var w in mispronounced.Take(3))
            {
                var wordText = w.GetProperty("word").GetString() ?? "";
                var score = w.GetProperty("accuracyScore").GetDouble();
                
                if (langCode == "ja")
                {
                    tips.Add($"単語「{wordText}」を練習しましょう（正確度: {Math.Round(score)}%）。モデル音声を聴き、音節ごとに繰り返してみてください。");
                }
                else if (langCode == "ko")
                {
                    tips.Add($"\"{wordText}\" 단어를 연습해보세요 (정확도: {Math.Round(score)}%). 원어민 음성을 듣고 한 음절씩 따라 해보세요.");
                }
                else // default to vi
                {
                    tips.Add($"Luyện tập từ \"{wordText}\" (độ chính xác: {Math.Round(score)}%). Hãy nghe âm thanh mẫu và lặp lại từng âm tiết.");
                }

                if (w.TryGetProperty("phonemes", out var phonemesEl) && phonemesEl.ValueKind == JsonValueKind.Array)
                {
                    foreach (var ph in phonemesEl.EnumerateArray())
                    {
                        var phName = ph.GetProperty("phoneme").GetString() ?? "";
                        var phScore = ph.GetProperty("accuracyScore").GetDouble();

                        if (phScore < 60)
                        {
                            if (phName == "ð" || phName == "DH")
                            {
                                if (langCode == "ja")
                                    tips.Add($"「{wordText}」では、有声の 'th' 音（/ð/）を意識しましょう。舌の先を上下の歯の間に軽く挟み、声帯を振動させます。");
                                else if (langCode == "ko")
                                    tips.Add($"\"{wordText}\"의 경우, 유성음 'th' 소리(/ð/)를 연습해보세요. 혀끝을 윗니와 아랫니 사이에 살짝 넣고 성대를 진동시키며 소리를 냅니다.");
                                else
                                    tips.Add($"Đối với từ \"{wordText}\", hãy luyện âm 'th' hữu thanh (/ð/). Đặt nhẹ đầu lưỡi giữa hai hàm răng và rung dây thanh quản.");
                                break;
                            }
                            else if (phName == "θ" || phName == "TH")
                            {
                                if (langCode == "ja")
                                    tips.Add($"「{wordText}」では、無声の 'th' 音（/θ/）を意識しましょう。舌の先を前歯の間に挟んだ状態で、息を吹き出します。");
                                else if (langCode == "ko")
                                    tips.Add($"\"{wordText}\"의 경우, 무성음 'th' 소리(/θ/)를 연습해보세요. 혀끝을 앞니 사이에 두고 바람을 불어냅니다.");
                                else
                                    tips.Add($"Đối với từ \"{wordText}\", hãy luyện âm 'th' vô thanh (/θ/). Đẩy hơi ra ngoài trong khi đặt đầu lưỡi giữa hai hàm răng.");
                                break;
                            }
                            else if (phName == "ʃ" || phName == "SH")
                            {
                                if (langCode == "ja")
                                    tips.Add($"「{wordText}」では、'sh' 音（/ʃ/）を意識しましょう。唇を丸め、口の真ん中から息を押し出します。");
                                else if (langCode == "ko")
                                    tips.Add($"\"{wordText}\"의 경우, 'sh' 소리(/ʃ/)를 연습해보세요. 입술을 둥글게 모으고 입 중앙으로 공기를 밀어냅니다.");
                                else
                                    tips.Add($"Đối với từ \"{wordText}\", hãy luyện âm 'sh' (/ʃ/). Chu tròn môi và đẩy luồng hơi qua giữa miệng.");
                                break;
                            }
                            else if (phName == "ʒ" || phName == "ZH")
                            {
                                if (langCode == "ja")
                                    tips.Add($"「{wordText}」では、'measure' に含まれる 'zh' 音（/ʒ/）を意識しましょう。柔らかい 'sh' の音を出しながら、声帯を振動させます。");
                                else if (langCode == "ko")
                                    tips.Add($"\"{wordText}\"의 경우, 'measure'의 'zh' 소리(/ʒ/)를 연습해보세요. 부드러운 'sh' 소리를 내면서 성대를 진동시킵니다.");
                                else
                                    tips.Add($"Đối với từ \"{wordText}\", hãy luyện âm 'zh' (/ʒ/) (như trong từ 'measure'). Hãy rung dây thanh quản khi phát âm âm 'sh' nhẹ.");
                                break;
                            }
                            else if (phName == "r" || phName == "R")
                            {
                                if (langCode == "ja")
                                    tips.Add($"「{wordText}」では、'r' 音の発音時に舌を少し後ろに引いてみましょう。舌の先を丸めますが、口の天井には触れないようにします。");
                                else if (langCode == "ko")
                                    tips.Add($"\"{wordText}\"의 경우, 'r' 소리를 낼 때 혀를 약간 뒤로 당겨보세요. 혀끝을 둥글게 말되 입천장에 닿지 않게 합니다.");
                                else
                                    tips.Add($"Đối với từ \"{wordText}\", hãy hơi kéo lưỡi về phía sau để phát âm 'r'. Giữ đầu lưỡi cong lên nhưng không chạm vào vòm miệng.");
                                break;
                            }
                        }
                    }
                }
            }
        }
        catch
        {
            // Ignore parse errors
        }

        if (!tips.Any())
        {
            if (langCode == "ja")
                tips.Add("この調子で練習を続けましょう！文をゆっくり読み、単語同士を滑らかにつなげることを意識してみてください。");
            else if (langCode == "ko")
                tips.Add("계속해서 연습해보세요! 문장을 천천히 읽으면서 단어들을 자연스럽게 연결하는 데 집중해보세요.");
            else
                tips.Add("Hãy tiếp tục luyện tập! Thử đọc câu chậm lại, tập trung nối các từ một cách trôi chảy.");
        }

        return tips.Distinct().ToList();
    }

    public async Task<IEnumerable<PronunciationPhraseDto>> GetPhrasesAsync(CancellationToken cancellationToken = default)
    {
        var phrases = await _context.PronunciationPhrases
            .OrderBy(p => p.Category)
            .ToListAsync(cancellationToken);

        return phrases.Select(p => new PronunciationPhraseDto
        {
            Id = p.Id,
            Text = p.Text,
            Phonetic = p.Phonetic,
            Category = p.Category,
            Tags = string.IsNullOrEmpty(p.Tags) 
                ? Array.Empty<string>() 
                : p.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
        });
    }

    public async Task<PronunciationPhraseDto> CreatePhraseAsync(PronunciationPhraseDto dto, CancellationToken cancellationToken = default)
    {
        var phrase = new PronunciationPhrase
        {
            Id = Guid.NewGuid(),
            Text = dto.Text,
            Phonetic = dto.Phonetic,
            Category = dto.Category,
            Tags = dto.Tags != null ? string.Join(",", dto.Tags) : string.Empty
        };

        _context.PronunciationPhrases.Add(phrase);
        await _context.SaveChangesAsync(cancellationToken);

        dto.Id = phrase.Id;
        return dto;
    }

    public async Task<PronunciationPhraseDto> UpdatePhraseAsync(Guid id, PronunciationPhraseDto dto, CancellationToken cancellationToken = default)
    {
        var phrase = await _context.PronunciationPhrases.FindAsync(new object[] { id }, cancellationToken);
        if (phrase == null) throw new KeyNotFoundException("Pronunciation phrase not found");

        phrase.Text = dto.Text;
        phrase.Phonetic = dto.Phonetic;
        phrase.Category = dto.Category;
        phrase.Tags = dto.Tags != null ? string.Join(",", dto.Tags) : string.Empty;

        await _context.SaveChangesAsync(cancellationToken);

        dto.Id = phrase.Id;
        return dto;
    }

    public async Task<bool> DeletePhraseAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var phrase = await _context.PronunciationPhrases.FindAsync(new object[] { id }, cancellationToken);
        if (phrase == null) return false;

        _context.PronunciationPhrases.Remove(phrase);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
