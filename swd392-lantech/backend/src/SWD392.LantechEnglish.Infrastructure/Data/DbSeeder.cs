using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Domain.Enums;
using SWD392.LantechEnglish.Application.Interfaces;

namespace SWD392.LantechEnglish.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        var context = serviceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = serviceProvider.GetRequiredService<IPasswordHasher>();

        // Seed Pronunciation Phrases regardless of users
        var pronunciationPhrases = new List<PronunciationPhrase>
        {
            new() { Id = Guid.NewGuid(), Text = "The weather is beautiful today.", Phonetic = "/ðə ˈwɛðər ɪz ˈbjuːtɪfəl təˈdeɪ/", Category = "Weather", Tags = "daily,weather,th-sound" },
            new() { Id = Guid.NewGuid(), Text = "It is freezing cold and snowing heavily outside.", Phonetic = "/ɪt ɪz ˈfriːzɪŋ koʊld ænd ˈsnoʊɪŋ ˈhɛvɪli ˌaʊtˈsaɪd/", Category = "Weather", Tags = "weather,lifestyle,s-sound" },
            new() { Id = Guid.NewGuid(), Text = "We should bring an umbrella in case it rains later.", Phonetic = "/wiː ʃʊd brɪŋ ən ʌmˈbrɛlə ɪn keɪs ɪt reɪnz ˈleɪtər/", Category = "Weather", Tags = "weather,daily,sh-sound" },

            new() { Id = Guid.NewGuid(), Text = "She sells seashells by the seashore.", Phonetic = "/ʃiː sɛlz ˈsiːʃɛlz baɪ ðə ˈsiːʃɔːr/", Category = "Tongue Twister", Tags = "s-sound,sh-sound,fun" },
            new() { Id = Guid.NewGuid(), Text = "The thought was thoroughly thought through.", Phonetic = "/ðə θɔːt wɒz ˈθɜːrəli θɔːt θruː/", Category = "Tongue Twister", Tags = "th-sound,r-sound,consonants" },
            new() { Id = Guid.NewGuid(), Text = "How much wood would a woodchuck chuck if a woodchuck could chuck wood?", Phonetic = "/haʊ mʌtʃ wʊd wʊd ə ˈwʊdˌtʃʌk tʃʌk ɪf ə ˈwʊdˌtʃʌk kʊd tʃʌk wʊd/", Category = "Tongue Twister", Tags = "fun,consonants,long-words" },

            new() { Id = Guid.NewGuid(), Text = "I usually enjoy a cup of coffee in the morning.", Phonetic = "/aɪ ˈjuːʒuəli ɪnˈdʒɔɪ ə kʌp əv ˈkɒfi ɪn ðə ˈmɔːnɪŋ/", Category = "Daily Life", Tags = "daily,lifestyle" },
            new() { Id = Guid.NewGuid(), Text = "Remember to turn off the lights before leaving the house.", Phonetic = "/rɪˈmɛmbər tuː tɜːn ɒf ðə laɪts bɪˈfɔːr ˈliːvɪŋ ðə haʊs/", Category = "Daily Life", Tags = "daily,lifestyle,r-sound" },
            new() { Id = Guid.NewGuid(), Text = "Cooking healthy meals at home is a great way to stay fit.", Phonetic = "/ˈkʊkɪŋ ˈhɛlθi miːlz æt hoʊm ɪz ə ɡreɪt weɪ tuː steɪ fɪt/", Category = "Daily Life", Tags = "daily,lifestyle,th-sound" },

            new() { Id = Guid.NewGuid(), Text = "Could you please explain that once more?", Phonetic = "/kʊd juː pliːz ɪkˈspleɪn ðæt wʌns mɔːr/", Category = "Polite Requests", Tags = "polite,questions" },
            new() { Id = Guid.NewGuid(), Text = "Would you mind holding the door for me, please?", Phonetic = "/wʊd juː maɪnd ˈhoʊldɪŋ ðə dɔːr fɔːr miː pliːz/", Category = "Polite Requests", Tags = "polite,questions,r-sound" },
            new() { Id = Guid.NewGuid(), Text = "I would appreciate it if you could send me the details.", Phonetic = "/aɪ wʊd əˈpriːʃieɪt ɪt ɪf juː kʊd sɛnd miː ðə ˈdiːteɪlz/", Category = "Polite Requests", Tags = "polite,formal,sh-sound" },

            new() { Id = Guid.NewGuid(), Text = "Entrepreneurship requires extraordinary determination.", Phonetic = "/ˌɒntrəprəˈnɜːʃɪp rɪˈkwaɪərz ɪkˌstrɔːdɪˈnɛri dɪˌtɜːmɪˈneɪʃən/", Category = "Business", Tags = "advanced,business,long-words" },
            new() { Id = Guid.NewGuid(), Text = "We need to schedule a follow-up meeting next week.", Phonetic = "/wiː niːd tu ˈskɛdʒuːl ə ˈfɒloʊˌʌp ˈmiːtɪŋ nɛkst wiːk/", Category = "Business", Tags = "business,workplace" },
            new() { Id = Guid.NewGuid(), Text = "Our quarterly performance exceeded initial expectations.", Phonetic = "/ˈaʊər ˈkwɔːrtərli pərˈfɔːrməns ɪkˈsiːdɪd ɪˈnɪʃəl ˌɛkspɛkˈteɪʃənz/", Category = "Business", Tags = "advanced,business,formal" },

            new() { Id = Guid.NewGuid(), Text = "Can you recommend a good local restaurant nearby?", Phonetic = "/kæn juː ˌrɛkəˈmɛnd ə ɡʊd ˈloʊkəl ˈrɛstəˌrɑnt ˈnɪrˌbaɪ/", Category = "Travel", Tags = "travel,food" },
            new() { Id = Guid.NewGuid(), Text = "I would like to check in for my flight to London.", Phonetic = "/aɪ wʊd laɪk tu tʃɛk ɪn fɔːr maɪ flaɪt tu ˈlʌndən/", Category = "Travel", Tags = "travel,airport" },
            new() { Id = Guid.NewGuid(), Text = "Could you tell me how to get to the train station?", Phonetic = "/kʊd juː tɛl miː haʊ tu ɡɛt tu ðə treɪn ˈsteɪʃən/", Category = "Travel", Tags = "travel,directions" },

            new() { Id = Guid.NewGuid(), Text = "It is critical to analyze the data before making decisions.", Phonetic = "/ɪt ɪz ˈkrɪtɪkəl tu ˈænəlaɪz ðə ˈdeɪtə bɪˈfɔːr ˈmeɪkɪŋ dɪˈsɪʒənz/", Category = "Academic", Tags = "academic,formal" },
            new() { Id = Guid.NewGuid(), Text = "The scientific hypothesis must be verified through experiments.", Phonetic = "/ðə ˌsaɪənˈtɪfɪk haɪˈpɒθɪsɪs mʌst biː ˈvɛrɪfaɪd θruː ɪkˈspɛrɪmənts/", Category = "Academic", Tags = "academic,formal,th-sound" },
            new() { Id = Guid.NewGuid(), Text = "Academic writing requires clear structure and logical arguments.", Phonetic = "/ˌækəˈdɛmɪk ˈraɪtɪŋ rɪˈkwaɪərz klɪər ˈstrʌktʃər ænd ˈlɒdʒɪkəl ˈɑːɡjumənts/", Category = "Academic", Tags = "academic,formal,r-sound" },

            new() { Id = Guid.NewGuid(), Text = "What are your key strengths and areas of improvement?", Phonetic = "/wɒt ɑːr jɔːr kiː strɛŋθs ænd ˈeəriəz ɒv ɪmˈpruːvmənt/", Category = "Job Interview", Tags = "career,interview" },
            new() { Id = Guid.NewGuid(), Text = "I have three years of experience in software development.", Phonetic = "/aɪ hæv θriː jɪəz ɒv ɪkˈspɪərɪəns ɪn ˈsɒftweər dɪˈvɛləpmənt/", Category = "Job Interview", Tags = "career,interview,th-sound" },
            new() { Id = Guid.NewGuid(), Text = "I am looking for opportunities to grow my professional skills.", Phonetic = "/aɪ æm ˈlʊkɪŋ fɔːr ˌɒpərˈtjuːnɪtiz tu ɡroʊ maɪ prəˈfɛʃənl skɪlz/", Category = "Job Interview", Tags = "career,interview,sh-sound" }
        };

        foreach (var phrase in pronunciationPhrases)
        {
            var exists = await context.PronunciationPhrases.AnyAsync(p => p.Text == phrase.Text);
            if (!exists)
            {
                context.PronunciationPhrases.Add(phrase);
            }
        }
        await context.SaveChangesAsync();

        // Seed Tags and link to Vocabulary (independent of Users seeded check)
        await EnsureVocabularyTagsLinkedAsync(context);

        // Seed new 3 chapters (lessons/units)
        await SeedNewChaptersAsync(context);

        // Check if already seeded (for other entities)
        if (await context.Users.AnyAsync())
        {
            return;
        }

        // Seed Languages
        var languages = new List<Language>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Code = "en",
                Name = "English",
                NativeName = "English",
                IsSourceSupported = false,
                IsTargetSupported = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "vi",
                Name = "Vietnamese",
                NativeName = "Tiếng Việt",
                IsSourceSupported = true,
                IsTargetSupported = false,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "ja",
                Name = "Japanese",
                NativeName = "日本語",
                IsSourceSupported = true,
                IsTargetSupported = false,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "ko",
                Name = "Korean",
                NativeName = "한국어",
                IsSourceSupported = true,
                IsTargetSupported = false,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "zh",
                Name = "Chinese",
                NativeName = "中文",
                IsSourceSupported = true,
                IsTargetSupported = false,
                CreatedAt = DateTime.UtcNow
            }
        };
        context.Languages.AddRange(languages);

        // Seed Users
        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@lantech.local",
            PasswordHash = passwordHasher.HashPassword("Admin@123456"),
            FullName = "System Administrator",
            Role = UserRole.Admin,
            Status = UserStatus.Active,
            SourceLanguageCode = "vi",
            TargetLanguageCode = "en",
            Xp = 0,
            StreakCount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var normalUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@lantech.local",
            PasswordHash = passwordHasher.HashPassword("User@123456"),
            FullName = "Demo User",
            Role = UserRole.User,
            Status = UserStatus.Active,
            SourceLanguageCode = "vi",
            TargetLanguageCode = "en",
            CurrentCefrLevel = CefrLevel.B1,
            LevelSource = LevelSource.SelfReported,
            Xp = 0,
            StreakCount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Users.AddRange(adminUser, normalUser);

        // Seed Badges
        var badges = new List<Badge>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Code = "FIRST_LESSON",
                Name = "First Steps",
                Description = "Complete your first lesson",
                ConditionType = "LessonCompleted",
                ConditionValue = 1
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "7_DAY_STREAK",
                Name = "Week Warrior",
                Description = "Maintain a 7-day learning streak",
                ConditionType = "Streak",
                ConditionValue = 7
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "1000_XP",
                Name = "XP Master",
                Description = "Earn 1000 XP",
                ConditionType = "XP",
                ConditionValue = 1000
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "FIRST_FLASHCARD_REVIEW",
                Name = "Memory Master",
                Description = "Review your first flashcard",
                ConditionType = "FlashcardReviewed",
                ConditionValue = 1
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "PERFECT_LESSON",
                Name = "Perfect Score",
                Description = "Complete a lesson with 100% score",
                ConditionType = "PerfectLesson",
                ConditionValue = 1
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "FIRST_ASSESSMENT",
                Name = "Assessment Taker",
                Description = "Complete your first assessment",
                ConditionType = "AssessmentCompleted",
                ConditionValue = 1
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "SELF_LEVEL_SELECTED",
                Name = "Self Starter",
                Description = "Self-select your English level",
                ConditionType = "SelfLevelSelected",
                ConditionValue = 1
            }
        };
        context.Badges.AddRange(badges);

        // Seed Assessment Questions - Listening
        var listeningQuestions = new List<AssessmentQuestion>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Skill = SkillType.Listening,
                Level = CefrLevel.A1,
                QuestionText = "What is the person's name?",
                Instruction = "Listen and choose the correct answer",
                AudioTranscript = "Hello, my name is John.",
                OptionsJson = "[\"John\", \"Tom\", \"Mary\", \"Sarah\"]",
                CorrectAnswerJson = "\"John\"",
                Explanation = "The speaker says 'my name is John'",
                SourceLanguageCode = "vi",
                IsAiGenerated = false,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Skill = SkillType.Listening,
                Level = CefrLevel.A1,
                QuestionText = "What time is mentioned?",
                Instruction = "Listen and select the time you hear",
                AudioTranscript = "The meeting starts at 3 o'clock.",
                OptionsJson = "[\"2 o'clock\", \"3 o'clock\", \"4 o'clock\", \"5 o'clock\"]",
                CorrectAnswerJson = "\"3 o'clock\"",
                Explanation = "The speaker mentions '3 o'clock'",
                SourceLanguageCode = "vi",
                IsAiGenerated = false,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Skill = SkillType.Listening,
                Level = CefrLevel.A2,
                QuestionText = "Where does the conversation take place?",
                Instruction = "Listen and identify the location",
                AudioTranscript = "Excuse me, where can I find the bread? It's in aisle 3, next to the milk.",
                OptionsJson = "[\"Restaurant\", \"Supermarket\", \"Library\", \"Hospital\"]",
                CorrectAnswerJson = "\"Supermarket\"",
                Explanation = "They are talking about aisles and food products",
                SourceLanguageCode = "vi",
                IsAiGenerated = false,
                CreatedAt = DateTime.UtcNow
            }
        };
        context.AssessmentQuestions.AddRange(listeningQuestions);

        // Seed Assessment Questions - Reading
        var readingQuestions = new List<AssessmentQuestion>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Skill = SkillType.Reading,
                Level = CefrLevel.A1,
                QuestionText = "What is this text about?",
                Instruction = "Read the text and answer",
                PassageText = "This is my family. I have a mother, a father, and two brothers. We live in a small house.",
                OptionsJson = "[\"A family\", \"A school\", \"A park\", \"A store\"]",
                CorrectAnswerJson = "\"A family\"",
                Explanation = "The text describes the writer's family",
                SourceLanguageCode = "vi",
                IsAiGenerated = false,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Skill = SkillType.Reading,
                Level = CefrLevel.A1,
                QuestionText = "How many brothers does the writer have?",
                Instruction = "Read and find the answer",
                PassageText = "This is my family. I have a mother, a father, and two brothers. We live in a small house.",
                OptionsJson = "[\"One\", \"Two\", \"Three\", \"Four\"]",
                CorrectAnswerJson = "\"Two\"",
                Explanation = "The text says 'two brothers'",
                SourceLanguageCode = "vi",
                IsAiGenerated = false,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Skill = SkillType.Reading,
                Level = CefrLevel.A2,
                QuestionText = "What is the main topic of this email?",
                Instruction = "Read the email and choose the main idea",
                PassageText = "Hi Sarah, Thank you for your invitation to the party next week. Unfortunately, I can't come because I have an exam on Monday. Maybe we can meet another time? Best wishes, Tom",
                OptionsJson = "[\"Accepting an invitation\", \"Declining an invitation\", \"Organizing a party\", \"Studying for an exam\"]",
                CorrectAnswerJson = "\"Declining an invitation\"",
                Explanation = "Tom is politely saying he cannot attend the party",
                SourceLanguageCode = "vi",
                IsAiGenerated = false,
                CreatedAt = DateTime.UtcNow
            }
        };
        context.AssessmentQuestions.AddRange(readingQuestions);

        // Seed Assessment Questions - Writing
        var writingQuestions = new List<AssessmentQuestion>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Skill = SkillType.Writing,
                Level = CefrLevel.A1,
                QuestionText = "Write about yourself",
                WritingPrompt = "Write 3-5 sentences about yourself. Include your name, where you live, and what you like to do.",
                SourceLanguageCode = "vi",
                IsAiGenerated = false,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Skill = SkillType.Writing,
                Level = CefrLevel.A2,
                QuestionText = "Write an email to a friend",
                WritingPrompt = "Write a short email (50-70 words) to invite your friend to watch a movie this weekend. Include: when, where, and what movie.",
                SourceLanguageCode = "vi",
                IsAiGenerated = false,
                CreatedAt = DateTime.UtcNow
            }
        };
        context.AssessmentQuestions.AddRange(writingQuestions);

        // Seed Assessment Questions - Speaking
        var speakingQuestions = new List<AssessmentQuestion>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Skill = SkillType.Speaking,
                Level = CefrLevel.A1,
                QuestionText = "Introduce yourself",
                SpeakingPrompt = "Please introduce yourself. Say your name, where you are from, and one thing you like.",
                SourceLanguageCode = "vi",
                IsAiGenerated = false,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Skill = SkillType.Speaking,
                Level = CefrLevel.A2,
                QuestionText = "Describe your daily routine",
                SpeakingPrompt = "Describe what you do every day from morning to evening.",
                SourceLanguageCode = "vi",
                IsAiGenerated = false,
                CreatedAt = DateTime.UtcNow
            }
        };
        context.AssessmentQuestions.AddRange(speakingQuestions);

        // Seed Vocabulary
        var vocabularies = new List<Vocabulary>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Word = "hello",
                Ipa = "/həˈloʊ/",
                CefrLevel = CefrLevel.A1,
                PartOfSpeech = "interjection",
                ExampleSentence = "Hello, how are you?",
                ContentSource = ContentSource.Curated,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Word = "goodbye",
                Ipa = "/ɡʊdˈbaɪ/",
                CefrLevel = CefrLevel.A1,
                PartOfSpeech = "interjection",
                ExampleSentence = "Goodbye, see you tomorrow!",
                ContentSource = ContentSource.Curated,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Word = "thank you",
                Ipa = "/θæŋk juː/",
                CefrLevel = CefrLevel.A1,
                PartOfSpeech = "phrase",
                ExampleSentence = "Thank you for your help.",
                ContentSource = ContentSource.Curated,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Word = "family",
                Ipa = "/ˈfæməli/",
                CefrLevel = CefrLevel.A1,
                PartOfSpeech = "noun",
                ExampleSentence = "I love my family.",
                ContentSource = ContentSource.Curated,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Word = "breakfast",
                Ipa = "/ˈbrekfəst/",
                CefrLevel = CefrLevel.A1,
                PartOfSpeech = "noun",
                ExampleSentence = "I eat breakfast at 7 AM.",
                ContentSource = ContentSource.Curated,
                CreatedAt = DateTime.UtcNow
            }
        };
        context.Vocabularies.AddRange(vocabularies);

        // Seed Vocabulary Translations
        var translations = new List<VocabularyTranslation>();
        foreach (var vocab in vocabularies)
        {
            var meaning = vocab.Word switch
            {
                "hello" => "xin chào",
                "goodbye" => "tạm biệt",
                "thank you" => "cảm ơn",
                "family" => "gia đình",
                "breakfast" => "bữa sáng",
                _ => ""
            };

            translations.Add(new VocabularyTranslation
            {
                Id = Guid.NewGuid(),
                VocabularyId = vocab.Id,
                LanguageCode = "vi",
                Meaning = meaning,
                Explanation = $"'{vocab.Word}' trong tiếng Việt là '{meaning}'",
                ExampleTranslation = vocab.ExampleSentence != null ? $"Ví dụ: {vocab.ExampleSentence}" : null
            });
        }
        context.VocabularyTranslations.AddRange(translations);

        // Remove old lessons and their exercises
        var oldLessons = await context.Lessons
            .Where(l => l.Title == "Greetings and Introductions" || l.Title == "Family Members" || l.Title == "Present Simple Tense")
            .ToListAsync();
        if (oldLessons.Any())
        {
            var oldLessonIds = oldLessons.Select(ol => ol.Id).ToList();
            var oldExercises = await context.Exercises.Where(e => oldLessonIds.Contains(e.LessonId)).ToListAsync();
            context.Exercises.RemoveRange(oldExercises);
            context.Lessons.RemoveRange(oldLessons);
            await context.SaveChangesAsync();
        }

        // Seed Notifications if none exist
        if (!await context.Notifications.AnyAsync())
        {
            var users = await context.Users.ToListAsync();
            foreach (var user in users)
            {
                context.Notifications.AddRange(new List<Notification>
                {
                    new()
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        Title = "Đã mở khóa thành tích mới! 🏆",
                        Body = "Bạn nhận được huy hiệu \"Chiến binh Tuần\" cho chuỗi học tập 7 ngày.",
                        Icon = "Trophy",
                        IconColor = "#f59e0b",
                        IconBg = "#fef9c3",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow.AddMinutes(-2)
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        Title = "Sắp hoàn thành mục tiêu ngày! ⚡",
                        Body = "Chỉ còn 60 XP nữa để hoàn thành mục tiêu 500 XP hôm nay.",
                        Icon = "Zap",
                        IconColor = "var(--brand)",
                        IconBg = "var(--brand-light)",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow.AddHours(-1)
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        Title = "Có bài học mới 📖",
                        Body = "Bài học \"Cuộc phiêu lưu quá khứ\" đã mở khóa — hãy duy trì chuỗi học tập nhé!",
                        Icon = "BookOpen",
                        IconColor = "#3b82f6",
                        IconBg = "#dbeafe",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow.AddHours(-3)
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        Title = "Mẹo luyện phát âm 🎙️",
                        Body = "Hãy luyện phát âm âm 'th' hôm nay — đây là phần phát âm yếu nhất của bạn.",
                        Icon = "Mic",
                        IconColor = "#8b5cf6",
                        IconBg = "#ede9fe",
                        IsRead = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    },
                    new()
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        Title = "Cập nhật Bảng xếp hạng 🏆",
                        Body = "Bạn đã vươn lên vị trí thứ 3 tuần này. Alex đã vượt qua Sarah!",
                        Icon = "Trophy",
                        IconColor = "#ec4899",
                        IconBg = "#fce7f3",
                        IsRead = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    }
                });
            }
            await context.SaveChangesAsync();
        }
    }

    private static async Task EnsureVocabularyTagsLinkedAsync(AppDbContext context)
    {
        // Seed tags if they don't exist
        var tagNature = await context.Tags.FirstOrDefaultAsync(t => t.Name == "Nature & Environment");
        var tagFamily = await context.Tags.FirstOrDefaultAsync(t => t.Name == "Family & Relationships");
        var tagAnimals = await context.Tags.FirstOrDefaultAsync(t => t.Name == "Animals & Wildlife");
        var tagFood = await context.Tags.FirstOrDefaultAsync(t => t.Name == "Food & Dining");
        var tagCognition = await context.Tags.FirstOrDefaultAsync(t => t.Name == "Cognition & Mind");
        var tagActions = await context.Tags.FirstOrDefaultAsync(t => t.Name == "Actions & Movement");
        var tagSociety = await context.Tags.FirstOrDefaultAsync(t => t.Name == "Society & Business");

        bool tagsChanged = false;
        if (tagNature == null) { tagNature = new Tag { Id = Guid.NewGuid(), Name = "Nature & Environment" }; context.Tags.Add(tagNature); tagsChanged = true; }
        if (tagFamily == null) { tagFamily = new Tag { Id = Guid.NewGuid(), Name = "Family & Relationships" }; context.Tags.Add(tagFamily); tagsChanged = true; }
        if (tagAnimals == null) { tagAnimals = new Tag { Id = Guid.NewGuid(), Name = "Animals & Wildlife" }; context.Tags.Add(tagAnimals); tagsChanged = true; }
        if (tagFood == null) { tagFood = new Tag { Id = Guid.NewGuid(), Name = "Food & Dining" }; context.Tags.Add(tagFood); tagsChanged = true; }
        if (tagCognition == null) { tagCognition = new Tag { Id = Guid.NewGuid(), Name = "Cognition & Mind" }; context.Tags.Add(tagCognition); tagsChanged = true; }
        if (tagActions == null) { tagActions = new Tag { Id = Guid.NewGuid(), Name = "Actions & Movement" }; context.Tags.Add(tagActions); tagsChanged = true; }
        if (tagSociety == null) { tagSociety = new Tag { Id = Guid.NewGuid(), Name = "Society & Business" }; context.Tags.Add(tagSociety); tagsChanged = true; }

        if (tagsChanged)
        {
            await context.SaveChangesAsync();
        }

        var allVocabs = await context.Vocabularies.Include(v => v.Tags).ToListAsync();
        bool vocabsChanged = false;

        var natureWords = new HashSet<string> { "tree", "sun", "ice", "landscape", "rapid", "variable", "hazard", "climate" };
        var familyWords = new HashSet<string> { "hello", "goodbye", "thank you", "family", "mother", "love", "kinship", "invite", "join", "familiar", "jealous" };
        var animalWords = new HashSet<string> { "cat", "dog", "fish", "bird", "wild" };
        var foodWords = new HashSet<string> { "apple", "egg", "breakfast", "dinner", "eat", "satisfy" };
        var cognitionWords = new HashSet<string> { "believe", "decide", "forget", "guess", "notice", "remember", "suggest", "debate", "negotiate", "deduce", "empirical", "imply", "notion", "qualitative", "abstract", "obscure", "cohere", "elaborate" };
        var actionWords = new HashSet<string> { "jump", "play", "travel", "gather", "tackle", "participate", "simulate", "utilize", "abandon", "calculate", "damage", "educate" };
        var societyWords = new HashSet<string> { "campaign", "facility", "maintain", "objective", "radical", "bureaucracy", "legislate", "jurisdiction", "revenue", "margin", "qualify", "abolish", "barrier" };

        foreach (var vocab in allVocabs)
        {
            if (vocab.Tags.Any()) continue;

            var w = vocab.Word.ToLower();
            if (natureWords.Contains(w)) vocab.Tags.Add(tagNature);
            else if (familyWords.Contains(w)) vocab.Tags.Add(tagFamily);
            else if (animalWords.Contains(w)) vocab.Tags.Add(tagAnimals);
            else if (foodWords.Contains(w)) vocab.Tags.Add(tagFood);
            else if (cognitionWords.Contains(w)) vocab.Tags.Add(tagCognition);
            else if (actionWords.Contains(w)) vocab.Tags.Add(tagActions);
            else if (societyWords.Contains(w)) vocab.Tags.Add(tagSociety);
            else
            {
                if (vocab.PartOfSpeech == "noun") vocab.Tags.Add(tagSociety);
                else if (vocab.PartOfSpeech == "verb") vocab.Tags.Add(tagActions);
                else vocab.Tags.Add(tagCognition);
            }
            vocabsChanged = true;
        }

        if (vocabsChanged)
        {
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedNewChaptersAsync(AppDbContext context)
    {
        var chapterDefinitions = new List<(CefrLevel Level, string Title, string Description, string Topic, List<Exercise> Exercises)>
        {
            // === A1 ===
            (
                CefrLevel.A1, "Chương 1: Daily Communications", 
                "Practice basic speaking, reading comprehension, and daily routine essay writing", "Daily Life",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.Speaking, Prompt = "Hãy đọc to câu tiếng Anh sau:", TargetText = "Hello! My name is Nguyen, and I am learning English.", CorrectAnswerJson = "\"Hello! My name is Nguyen, and I am learning English.\"", Instruction = "Đọc to câu tiếng Anh mẫu", Difficulty = 1, XpReward = 20 },
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "Tìm lỗi sai trong câu: 'Yesterday, I go to the store.'", OptionsJson = "[\"Yesterday\", \"I go\", \"to the\", \"store\"]", CorrectAnswerJson = "\"I go\"", Explanation = "Phải dùng quá khứ đơn 'went' thay vì 'go'.", Instruction = "Tìm lỗi sai ngữ pháp", Difficulty = 1, XpReward = 20 },
                    new() { Type = ExerciseType.Writing, Prompt = "Viết đoạn văn ngắn khoảng 100-200 từ kể về thói quen ngày hôm qua của bạn.", Instruction = "Viết đoạn văn tự do", Difficulty = 1, XpReward = 20 }
                }
            ),
            (
                CefrLevel.A1, "Chương 2: Greeting & Family", 
                "Introduce yourself and describe your family members.", "Family",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "What is the meaning of 'mother' in Vietnamese?", OptionsJson = "[\"Bố\", \"Mẹ\", \"Anh trai\", \"Chị gái\"]", CorrectAnswerJson = "\"Mẹ\"", Explanation = "'Mother' nghĩa là mẹ.", Instruction = "Chọn từ đúng nghĩa", Difficulty = 1, XpReward = 20 },
                    new() { Type = ExerciseType.FillBlank, Prompt = "This is my mother. ______ name is Mary. (Her/His/Their)", CorrectAnswerJson = "\"Her\"", Explanation = "Dùng tính từ sở hữu 'Her' cho giống cái.", Instruction = "Điền đại từ thích hợp", Difficulty = 1, XpReward = 20 }
                }
            ),
            (
                CefrLevel.A1, "Chương 3: School & Food", 
                "Talk about school subjects and your favorite food.", "School & Food",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "Which one is a school subject?", OptionsJson = "[\"Apple\", \"Math\", \"Dog\", \"Car\"]", CorrectAnswerJson = "\"Math\"", Explanation = "'Math' là môn toán học.", Instruction = "Chọn từ vựng theo chủ đề", Difficulty = 1, XpReward = 20 },
                    new() { Type = ExerciseType.FillBlank, Prompt = "I usually eat ______ for breakfast. (bread/read/book)", CorrectAnswerJson = "\"bread\"", Explanation = "'Bread' là bánh mì, món ăn sáng phổ biến.", Instruction = "Điền từ thích hợp", Difficulty = 1, XpReward = 20 }
                }
            ),
            (
                CefrLevel.A1, "Chương 4: Numbers & Shopping", 
                "Learn numbers and basic conversation when shopping.", "Shopping",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "How much is 20 plus 30?", OptionsJson = "[\"Fifty\", \"Forty\", \"Sixty\", \"Thirty\"]", CorrectAnswerJson = "\"Fifty\"", Explanation = "20 + 30 = 50 (Fifty).", Instruction = "Chọn đáp án đúng", Difficulty = 1, XpReward = 20 },
                    new() { Type = ExerciseType.FillBlank, Prompt = "How ______ is this shirt? (much/many/price)", CorrectAnswerJson = "\"much\"", Explanation = "'How much' dùng để hỏi giá cả.", Instruction = "Điền từ thích hợp hỏi giá", Difficulty = 1, XpReward = 20 }
                }
            ),
            (
                CefrLevel.A1, "Chương 5: Hobbies & Pets", 
                "Describe your favorite hobbies and pets.", "Hobbies",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.Speaking, Prompt = "Hãy đọc to câu sau:", TargetText = "I have a small dog and I love playing soccer.", CorrectAnswerJson = "\"I have a small dog and I love playing soccer.\"", Instruction = "Đọc to câu tiếng Anh mẫu", Difficulty = 1, XpReward = 20 },
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "Which animal is commonly kept as a pet?", OptionsJson = "[\"Lion\", \"Cat\", \"Shark\", \"Bear\"]", CorrectAnswerJson = "\"Cat\"", Explanation = "'Cat' (mèo) là thú cưng phổ biến.", Instruction = "Chọn đáp án đúng", Difficulty = 1, XpReward = 20 }
                }
            ),

            // === A2 ===
            (
                CefrLevel.A2, "Chương 1: Hobbies and Leisure", 
                "Practice hobbies speaking, context fill-in-the-blanks, and favorite hobby essay writing at A2 level.", "Hobbies",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.Speaking, Prompt = "Hãy đọc to câu tiếng Anh sau:", TargetText = "I enjoy reading books and playing soccer with my friends on weekends.", CorrectAnswerJson = "\"I enjoy reading books and playing soccer with my friends on weekends.\"", Instruction = "Đọc to câu tiếng Anh mẫu", Difficulty = 2, XpReward = 20 },
                    new() { Type = ExerciseType.FillBlank, Prompt = "My favorite hobby is reading. It helps me to (1) ______ my knowledge. (expand/eat/play)", CorrectAnswerJson = "\"expand\"", Explanation = "'expand knowledge' nghĩa là mở rộng kiến thức.", Instruction = "Điền từ thích hợp", Difficulty = 2, XpReward = 20 }
                }
            ),
            (
                CefrLevel.A2, "Chương 2: Daily Routines & Weather", 
                "Discuss daily routines and describe different weather patterns.", "Daily Routines",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "If it is raining hard, it is raining cats and ______.", OptionsJson = "[\"dogs\", \"birds\", \"cows\", \"fish\"]", CorrectAnswerJson = "\"dogs\"", Explanation = "Thành ngữ 'rain cats and dogs' nghĩa là mưa như trút nước.", Instruction = "Chọn thành ngữ đúng", Difficulty = 2, XpReward = 20 },
                    new() { Type = ExerciseType.FillBlank, Prompt = "I always wake up ______ 6 AM. (at/on/in)", CorrectAnswerJson = "\"at\"", Explanation = "Dùng giới từ 'at' trước giờ giấc cụ thể.", Instruction = "Điền giới từ thích hợp", Difficulty = 2, XpReward = 20 }
                }
            ),
            (
                CefrLevel.A2, "Chương 3: Healthy Living & Nutrition", 
                "Learn vocabulary about health, food choices, and staying active.", "Health",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "Which food is considered healthy?", OptionsJson = "[\"Pizza\", \"Apple\", \"Donut\", \"Soda\"]", CorrectAnswerJson = "\"Apple\"", Explanation = "Táo là hoa quả tốt cho sức khỏe.", Instruction = "Chọn thực phẩm lành mạnh", Difficulty = 2, XpReward = 20 },
                    new() { Type = ExerciseType.Speaking, Prompt = "Đọc to câu sau:", TargetText = "Drinking enough water every day is essential for your body.", CorrectAnswerJson = "\"Drinking enough water every day is essential for your body.\"", Instruction = "Đọc to câu tiếng Anh mẫu", Difficulty = 2, XpReward = 20 }
                }
            ),
            (
                CefrLevel.A2, "Chương 4: Jobs & Workplace Basics", 
                "Describe common jobs and standard workplace responsibilities.", "Workplace",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "A person who designs buildings is an ______.", OptionsJson = "[\"Architect\", \"Teacher\", \"Doctor\", \"Chef\"]", CorrectAnswerJson = "\"Architect\"", Explanation = "Architect là kiến trúc sư, người thiết kế các tòa nhà.", Instruction = "Chọn nghề nghiệp phù hợp", Difficulty = 2, XpReward = 20 },
                    new() { Type = ExerciseType.FillBlank, Prompt = "She ______ in a hospital. She is a nurse. (works/plays/dances)", CorrectAnswerJson = "\"works\"", Explanation = "Y tá làm việc ở bệnh viện.", Instruction = "Điền động từ thích hợp", Difficulty = 2, XpReward = 20 }
                }
            ),
            (
                CefrLevel.A2, "Chương 5: Neighborhood & Directions", 
                "Ask for and give directions in a city or neighborhood.", "Directions",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.Speaking, Prompt = "Đọc to câu hỏi đường sau:", TargetText = "Excuse me, how do I get to the post office from here?", CorrectAnswerJson = "\"Excuse me, how do I get to the post office from here?\"", Instruction = "Đọc to câu hỏi đường", Difficulty = 2, XpReward = 20 },
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "What is the opposite of 'turn left'?", OptionsJson = "[\"Turn right\", \"Go straight\", \"Go back\", \"Stop\"]", CorrectAnswerJson = "\"Turn right\"", Explanation = "Đối lập của rẽ trái là rẽ phải.", Instruction = "Chọn từ trái nghĩa", Difficulty = 2, XpReward = 20 }
                }
            ),

            // === B1 ===
            (
                CefrLevel.B1, "Chương 1: Travel and Exploration", 
                "Practice travel speaking, correct verb tense choices, and request letter writing.", "Travel",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.Speaking, Prompt = "Hãy đọc to câu tiếng Anh sau:", TargetText = "Could you please tell me how to get to the nearest train station?", CorrectAnswerJson = "\"Could you please tell me how to get to the nearest train station?\"", Instruction = "Đọc to câu tiếng Anh mẫu", Difficulty = 3, XpReward = 20 },
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "Choose the correct past tense form: 'Last year, when we ______ London, we stayed at a nice hotel.'", OptionsJson = "[\"visited\", \"visiting\", \"visits\", \"had visited\"]", CorrectAnswerJson = "\"visited\"", Explanation = "Dùng thì quá khứ đơn cho hành động đã hoàn tất trong quá khứ.", Instruction = "Chọn dạng đúng của động từ", Difficulty = 3, XpReward = 20 }
                }
            ),
            (
                CefrLevel.B1, "Chương 2: Life Experiences & Storytelling", 
                "Discuss memorable life experiences and learn to construct narratives.", "Narrative",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "Which connector is best to show a sequence of events?", OptionsJson = "[\"First of all\", \"Because\", \"Although\", \"However\"]", CorrectAnswerJson = "\"First of all\"", Explanation = "'First of all' dùng để chỉ thứ tự bắt đầu của chuỗi hành động.", Instruction = "Chọn liên từ chỉ trình tự", Difficulty = 3, XpReward = 20 },
                    new() { Type = ExerciseType.FillBlank, Prompt = "I have ______ (live) here for five years. (lived/living/live)", CorrectAnswerJson = "\"lived\"", Explanation = "Thì hiện tại hoàn thành sử dụng 'have + V3/V-ed'.", Instruction = "Điền dạng đúng của động từ", Difficulty = 3, XpReward = 20 }
                }
            ),
            (
                CefrLevel.B1, "Chương 3: Consumer Society & Money", 
                "Talk about spending habits, saving money, and online shopping.", "Money",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "To buy something on credit means to paying ______.", OptionsJson = "[\"later\", \"immediately\", \"with cash only\", \"nothing\"]", CorrectAnswerJson = "\"later\"", Explanation = "Mua trả góp/tín dụng có nghĩa là thanh toán sau.", Instruction = "Chọn ý nghĩa chính xác", Difficulty = 3, XpReward = 20 },
                    new() { Type = ExerciseType.Speaking, Prompt = "Đọc to câu sau:", TargetText = "Saving money is a good habit that provides security for the future.", CorrectAnswerJson = "\"Saving money is a good habit that provides security for the future.\"", Instruction = "Đọc to câu tiếng Anh mẫu", Difficulty = 3, XpReward = 20 }
                }
            ),
            (
                CefrLevel.B1, "Chương 4: Rules & Social Issues", 
                "Discuss school/company regulations and modern social topics.", "Society",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "You ______ wear a seatbelt when driving. It is the law.", OptionsJson = "[\"must\", \"might\", \"should not\", \"could\"]", CorrectAnswerJson = "\"must\"", Explanation = "'Must' thể hiện sự bắt buộc theo pháp luật.", Instruction = "Chọn động từ khuyết thiếu phù hợp", Difficulty = 3, XpReward = 20 },
                    new() { Type = ExerciseType.Writing, Prompt = "Viết email khoảng 150-200 từ góp ý cải thiện vấn đề rác thải nhựa tại nơi làm việc của bạn.", Instruction = "Viết thư/email kiến nghị", Difficulty = 3, XpReward = 25 }
                }
            ),
            (
                CefrLevel.B1, "Chương 5: Work-Life Balance", 
                "Learn to describe workload and stress-relief methods.", "Workplace",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.Speaking, Prompt = "Đọc to câu sau:", TargetText = "Maintaining a healthy work-life balance is crucial for mental well-being.", CorrectAnswerJson = "\"Maintaining a healthy work-life balance is crucial for mental well-being.\"", Instruction = "Đọc to câu tiếng Anh mẫu", Difficulty = 3, XpReward = 20 },
                    new() { Type = ExerciseType.FillBlank, Prompt = "If you are too stressed, you should ______ some time off. (take/make/give)", CorrectAnswerJson = "\"take\"", Explanation = "'Take time off' nghĩa là xin nghỉ ngơi một thời gian.", Instruction = "Điền động từ đúng cụm từ", Difficulty = 3, XpReward = 20 }
                }
            ),

            // === B2 ===
            (
                CefrLevel.B2, "Chương 1: Remote Work & Modern Shifts", 
                "Discuss the evolution, benefits, and challenges of working remotely.", "Career",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.Speaking, Prompt = "Đọc to câu nhận định sau:", TargetText = "The paradigm shift toward remote work has transformed corporate cultures globally.", CorrectAnswerJson = "\"The paradigm shift toward remote work has transformed corporate cultures globally.\"", Instruction = "Đọc to nhận định tiếng Anh", Difficulty = 4, XpReward = 20 },
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "What does the phrase 'paradigm shift' mean?", OptionsJson = "[\"A fundamental change in approach\", \"A temporary trend\", \"A technological error\", \"A minor adjustment\"]", CorrectAnswerJson = "\"A fundamental change in approach\"", Explanation = "'Paradigm shift' nghĩa là một sự thay đổi mang tính nền tảng/bước ngoặt.", Instruction = "Chọn định nghĩa chính xác", Difficulty = 4, XpReward = 20 }
                }
            ),
            (
                CefrLevel.B2, "Chương 2: Environment & Green Energy", 
                "Analyze environmental problems, climate change, and alternative energy sources.", "Environment",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "Which energy source is fully renewable?", OptionsJson = "[\"Coal\", \"Solar power\", \"Natural Gas\", \"Petroleum\"]", CorrectAnswerJson = "\"Solar power\"", Explanation = "Năng lượng mặt trời là nguồn năng lượng tái tạo hoàn toàn.", Instruction = "Chọn đáp án đúng", Difficulty = 4, XpReward = 20 },
                    new() { Type = ExerciseType.Writing, Prompt = "Write an essay (150-200 words) debating whether nuclear energy is a viable solution to combat global warming.", Instruction = "Viết bài luận nghị luận", Difficulty = 4, XpReward = 25 }
                }
            ),
            (
                CefrLevel.B2, "Chương 3: Technology & AI", 
                "Explore the rise of artificial intelligence, machine learning, and its impact on jobs.", "Technology",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.Speaking, Prompt = "Đọc to câu sau:", TargetText = "Artificial intelligence raises ethical concerns regarding data privacy and automation.", CorrectAnswerJson = "\"Artificial intelligence raises ethical concerns regarding data privacy and automation.\"", Instruction = "Đọc to câu tiếng Anh mẫu", Difficulty = 4, XpReward = 20 },
                    new() { Type = ExerciseType.FillBlank, Prompt = "AI systems rely on massive datasets to ______ predictions. (generate/destroy/ignore)", CorrectAnswerJson = "\"generate\"", Explanation = "Hệ thống AI dựa trên dữ liệu lớn để tạo ra các dự đoán.", Instruction = "Điền động từ thích hợp", Difficulty = 4, XpReward = 20 }
                }
            ),
            (
                CefrLevel.B2, "Chương 4: Media & Advertising", 
                "Deconstruct the strategies behind modern advertisements and media outlets.", "Media",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.MultipleChoice, Prompt = "What is the primary goal of persuasive advertising?", OptionsJson = "[\"To convince consumers to buy a product\", \"To provide technical data sheets\", \"To entertain the target audience\", \"To decrease manufacturing costs\"]", CorrectAnswerJson = "\"To convince consumers to buy a product\"", Explanation = "Mục đích chính của quảng cáo thuyết phục là thuyết phục người tiêu dùng mua hàng.", Instruction = "Chọn mục tiêu chính xác", Difficulty = 4, XpReward = 20 },
                    new() { Type = ExerciseType.Writing, Prompt = "Write a review (150-200 words) of an advertisement campaign that you found highly effective or controversial.", Instruction = "Viết bài review phân tích", Difficulty = 4, XpReward = 25 }
                }
            ),
            (
                CefrLevel.B2, "Chương 5: Culture & Global Citizenship", 
                "Understand cultural diversity, migration, and the concept of global citizenship.", "Culture",
                new List<Exercise>
                {
                    new() { Type = ExerciseType.Speaking, Prompt = "Đọc to câu nhận định sau:", TargetText = "Embracing cultural diversity promotes tolerance and enriches global cooperation.", CorrectAnswerJson = "\"Embracing cultural diversity promotes tolerance and enriches global cooperation.\"", Instruction = "Đọc to nhận định tiếng Anh", Difficulty = 4, XpReward = 20 },
                    new() { Type = ExerciseType.FillBlank, Prompt = "A global citizen feels a sense of ______ to the world community. (belonging/loneliness/isolation)", CorrectAnswerJson = "\"belonging\"", Explanation = "'belonging' nghĩa là sự thuộc về, sự gắn kết.", Instruction = "Điền danh từ phù hợp", Difficulty = 4, XpReward = 20 }
                }
            )
        };

        var existingLessons = await context.Lessons.ToListAsync();
        int baseOrderIndex = 20;

        foreach (var def in chapterDefinitions)
        {
            var alreadyExists = existingLessons.Any(l => l.Title == def.Title && l.CefrLevel == def.Level);
            if (!alreadyExists)
            {
                var lesson = new Lesson
                {
                    Id = Guid.NewGuid(),
                    CefrLevel = def.Level,
                    TargetLanguageCode = "en",
                    SourceLanguageCode = "vi",
                    Title = def.Title,
                    Description = def.Description,
                    Skill = def.Level == CefrLevel.A1 || def.Level == CefrLevel.A2 ? SkillType.Vocabulary : SkillType.Writing,
                    Topic = def.Topic,
                    ContentSource = ContentSource.Curated,
                    OrderIndex = baseOrderIndex++,
                    EstimatedMinutes = 20,
                    XpReward = 60,
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                context.Lessons.Add(lesson);

                int exerciseOrderIndex = 1;
                foreach (var ex in def.Exercises)
                {
                    ex.Id = Guid.NewGuid();
                    ex.LessonId = lesson.Id;
                    ex.OrderIndex = exerciseOrderIndex++;
                    ex.IsAiGenerated = false;
                    ex.CreatedAt = DateTime.UtcNow;
                    
                    context.Exercises.Add(ex);
                }
            }
        }

        await context.SaveChangesAsync();
    }
}