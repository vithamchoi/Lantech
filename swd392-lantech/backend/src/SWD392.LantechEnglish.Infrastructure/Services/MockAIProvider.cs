using SWD392.LantechEnglish.Application.DTOs.AI;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Enums;
using System.Text.Json;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class MockAIProvider : IAIProvider
{
    public Task<string> GenerateExplanationAsync(string targetText, string sourceLanguageCode, string question, CancellationToken cancellationToken = default)
    {
        var response = sourceLanguageCode.ToLower() switch
        {
            "vi" => $"[Mock AI] Giải thích cho câu hỏi: '{question}' về câu '{targetText}':\n\nĐây là cấu trúc thông dụng trong tiếng Anh. Ở đây, ta dùng thì Hiện tại hoàn thành tiếp diễn để nhấn mạnh tính liên tục của hành động kéo dài từ quá khứ đến hiện tại.",
            "ja" => $"[Mock AI] 質問: '{question}' (対象: '{targetText}'):\n\nこれは英語の一般的な表現です。現在完了進行形は、過去から現在まで継続している動作の継続性を 강조するために使用されます。",
            "ko" => $"[Mock AI] 질문: '{question}' (대상: '{targetText}'):\n\n이것은 영어의 일반적인 구조입니다. 현재 완료 진행형은 과거부터 현재까지 지속되는 행동의 연속성을 강조합니다.",
            "zh" => $"[Mock AI] 问题: '{question}' (针对: '{targetText}'):\n\n这是英语中的常用结构。这里使用现在完成进行时来强调动作从过去持续到现在的连续性。",
            _ => $"[Mock AI] Explanation for: '{question}' on '{targetText}':\n\nThis is a common English structure using the Present Perfect Continuous tense to emphasize the ongoing nature of the action starting from the past up to the present."
        };
        return Task.FromResult(response);
    }

    public Task<string> GenerateExercisesAsync(CefrLevel cefrLevel, SkillType skill, string sourceLanguageCode, string topic, int count, CancellationToken cancellationToken = default)
    {
        var exercises = new List<object>();
        for (int i = 1; i <= count; i++)
        {
            exercises.Add(new
            {
                prompt = $"Mock Question {i} on topic '{topic}' ({cefrLevel})",
                instruction = sourceLanguageCode == "vi" ? "Chọn câu trả lời đúng nhất" : "Choose the correct answer",
                options = new[] { "Option A", "Option B", "Option C", "Option D" },
                correctAnswer = "Option A",
                explanation = sourceLanguageCode == "vi" ? "Giải thích: Option A là đáp án chính xác." : "Explanation: Option A is correct.",
                difficulty = 1,
                xpReward = 10
            });
        }
        var json = JsonSerializer.Serialize(exercises);
        return Task.FromResult(json);
    }

    public Task<string> GenerateAssessmentQuestionsAsync(SkillType skill, CefrLevel cefrLevel, string sourceLanguageCode, int count, CancellationToken cancellationToken = default)
    {
        var questions = new List<object>();
        for (int i = 1; i <= count; i++)
        {
            questions.Add(new
            {
                skill = skill.ToString(),
                level = cefrLevel.ToString(),
                questionText = $"Mock Assessment Question {i} for {skill} ({cefrLevel})",
                instruction = sourceLanguageCode == "vi" ? "Đọc và trả lời câu hỏi" : "Read and answer the question",
                passageText = skill == SkillType.Reading ? "This is a short mock passage for reading comprehension." : null,
                audioTranscript = skill == SkillType.Listening ? "This is a mock audio transcript." : null,
                options = skill is SkillType.Reading or SkillType.Listening ? new[] { "A", "B", "C", "D" } : null,
                correctAnswer = skill is SkillType.Reading or SkillType.Listening ? "A" : null,
                explanation = "Mock explanation."
            });
        }
        var json = JsonSerializer.Serialize(questions);
        return Task.FromResult(json);
    }

    public Task<string> AnalyzeWeaknessesAsync(string historySummaryJson, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        var result = new
        {
            weakSkills = new[] { "Speaking", "Grammar" },
            commonMistakes = new[] { "Confusion between present simple and present perfect", "Slight hesitation during speaking prompts" },
            recommendedLessons = new[] { "Present Perfect Tense", "Daily Conversations Practice" },
            suggestedFlashcards = new[] { "breakfast", "family" }
        };
        return Task.FromResult(JsonSerializer.Serialize(result));
    }

    public Task<string> ChatTutorAsync(string message, string sourceLanguageCode, List<ChatMessageDto>? history = null, CancellationToken cancellationToken = default)
    {
        var reply = sourceLanguageCode.ToLower() switch
        {
            "vi" => $"[Mock AI Tutor] Chào bạn! Cảm ơn câu hỏi của bạn: '{message}'. Trong tiếng Anh, sự khác biệt nằm ở chỗ: 'Do' thường dùng cho các hoạt động hoặc công việc, trong khi 'Make' dùng cho việc chế tạo, tạo ra một sản phẩm mới.",
            "ja" => $"[Mock AI Tutor] こんにちは！ご質問ありがとうございます: '{message}'。英語では、'Do'は一般的に行動や仕事を指し、'Make'は新しいものを創造または製造することを指します。",
            "ko" => $"[Mock AI Tutor] 안녕하세요! 질문해 주셔서 감사합니다: '{message}'. 영어에서 'Do'는 일반적으로 활동이나 일을 나타내고, 'Make'는 새로운 것을 만들거나 제작할 때 사용합니다.",
            "zh" => $"[Mock AI Tutor] 你好！感谢你的提问: '{message}'。在英语中，'Do'通常用于表示活动或工作，而'Make'则用于表示制造、创造出新的物品。",
            _ => $"[Mock AI Tutor] Hello! Thank you for your question: '{message}'. In English, 'Do' is generally used for activities or tasks, whereas 'Make' is used for creating or producing something physical."
        };
        return Task.FromResult(reply);
    }

    public async IAsyncEnumerable<string> ChatTutorStreamAsync(string message, string sourceLanguageCode, List<ChatMessageDto>? history = null, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var reply = sourceLanguageCode.ToLower() switch
        {
            "vi" => $"[Mock AI Tutor] Chào bạn! Cảm ơn câu hỏi của bạn: '{message}'. Trong tiếng Anh, sự khác biệt nằm ở chỗ: 'Do' thường dùng cho các hoạt động hoặc công việc, trong khi 'Make' dùng cho việc chế tạo, tạo ra một sản phẩm mới.",
            "ja" => $"[Mock AI Tutor] こんにちは！ご質問ありがとうございます: '{message}'。英語では、'Do'は一般的に行動や仕事を指し、'Make'は新しいものを創造または製造することを指します。",
            "ko" => $"[Mock AI Tutor] 안녕하세요! 질문해 주셔서 감사합니다: '{message}'. 영어에서 'Do'는 일반적으로 활동이나 일을 나타내고, 'Make'는 새로운 것을 만들거나 제작할 때 사용합니다.",
            "zh" => $"[Mock AI Tutor] 你好！感谢你的提问: '{message}'。在英语中，'Do'通常用于表示活动或工作，而'Make'则用于表示制造、创造出新的物品。",
            _ => $"[Mock AI Tutor] Hello! Thank you for your question: '{message}'. In English, 'Do' is generally used for activities or tasks, whereas 'Make' is used for creating or producing something physical."
        };

        var words = reply.Split(' ');
        foreach (var word in words)
        {
            cancellationToken.ThrowIfCancellationRequested();
            yield return word + " ";
            await Task.Delay(50, cancellationToken);
        }
    }

    public Task<string> GenerateLearningPathAsync(CefrLevel cefrLevel, string sourceLanguageCode, List<string> weakSkills, CancellationToken cancellationToken = default)
    {
        var result = new
        {
            title = $"Personalized Learning Path ({cefrLevel})",
            description = sourceLanguageCode == "vi" 
                ? "Lộ trình học tập cá nhân hóa tập trung cải thiện kỹ năng yếu và củng cố ngữ pháp nền tảng." 
                : $"Personalized learning path focused on building vocabulary and strengthening skills.",
            recommendedLessons = new[] { "Greetings and Introductions", "Present Simple Tense" },
            weakSkillsJson = JsonSerializer.Serialize(weakSkills)
        };
        return Task.FromResult(JsonSerializer.Serialize(result));
    }

    public Task<string> GenerateVocabularyExamplesAsync(string word, string sourceLanguageCode, CefrLevel cefrLevel, CancellationToken cancellationToken = default)
    {
        var result = new
        {
            word = word,
            examples = new[]
            {
                new { english = $"We eat {word} in the morning.", translation = sourceLanguageCode == "vi" ? $"Chúng tôi ăn {word} vào buổi sáng." : $"We eat {word} in the morning." }
            }
        };
        return Task.FromResult(JsonSerializer.Serialize(result));
    }

    public Task<(double Score, string Feedback)> GradeWritingAsync(string prompt, string answerText, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        double score = 75.0;
        string feedback = sourceLanguageCode.ToLower() switch
        {
            "vi" => "[Mock AI] Bài viết khá tốt. Hãy chú ý chia động từ chính xác hơn và mở rộng từ vựng liên quan đến chủ đề.",
            _ => "[Mock AI] Good writing attempt. Pay attention to subject-verb agreement and try to use more descriptive vocabulary."
        };
        return Task.FromResult((score, feedback));
    }

    public Task<(double Score, string Feedback)> GradeSpeakingAsync(string prompt, string transcriptText, string targetText, string sourceLanguageCode, CancellationToken cancellationToken = default)
    {
        double score = 80.0;
        string feedback = sourceLanguageCode.ToLower() switch
        {
            "vi" => "[Mock AI] Phát âm và nhịp điệu tương đối tự nhiên. Cần luyện tập thêm các nguyên âm đôi.",
            _ => "[Mock AI] Clear pronunciation and good pacing. Focus slightly more on vowel clarity."
        };
        return Task.FromResult((score, feedback));
    }

    public async Task<byte[]> GenerateAudioAsync(string text, string voice = "alloy", CancellationToken cancellationToken = default)
    {
        try
        {
            using var client = new HttpClient();
            var encodedText = Uri.EscapeDataString(text);
            var url = $"https://translate.google.com/translate_tts?ie=UTF-8&q={encodedText}&tl=en&client=tw-ob";
            var response = await client.GetAsync(url, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsByteArrayAsync(cancellationToken);
            }
        }
        catch { }
        return Array.Empty<byte>();
    }

    public Task<string> GeneratePhoneticIpaAsync(string text, CancellationToken cancellationToken = default)
    {
        return Task.FromResult($"/{text.ToLower()}/");
    }
}
