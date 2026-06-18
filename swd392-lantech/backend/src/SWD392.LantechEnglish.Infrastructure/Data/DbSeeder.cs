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

        // Check if already seeded
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

        // Seed Lessons
        var lesson1 = new Lesson
        {
            Id = Guid.NewGuid(),
            CefrLevel = CefrLevel.A1,
            TargetLanguageCode = "en",
            SourceLanguageCode = "vi",
            Title = "Greetings and Introductions",
            Description = "Learn basic greetings and how to introduce yourself",
            Skill = SkillType.Vocabulary,
            Topic = "Daily Life",
            ContentSource = ContentSource.Curated,
            OrderIndex = 1,
            EstimatedMinutes = 15,
            XpReward = 50,
            IsPublished = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var lesson2 = new Lesson
        {
            Id = Guid.NewGuid(),
            CefrLevel = CefrLevel.A1,
            TargetLanguageCode = "en",
            SourceLanguageCode = "vi",
            Title = "Family Members",
            Description = "Learn vocabulary about family relationships",
            Skill = SkillType.Vocabulary,
            Topic = "Family",
            ContentSource = ContentSource.Curated,
            OrderIndex = 2,
            EstimatedMinutes = 20,
            XpReward = 50,
            IsPublished = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var lesson3 = new Lesson
        {
            Id = Guid.NewGuid(),
            CefrLevel = CefrLevel.A1,
            TargetLanguageCode = "en",
            SourceLanguageCode = "vi",
            Title = "Present Simple Tense",
            Description = "Learn how to use present simple tense for daily routines",
            Skill = SkillType.Grammar,
            Topic = "Grammar",
            ContentSource = ContentSource.Curated,
            OrderIndex = 3,
            EstimatedMinutes = 25,
            XpReward = 75,
            IsPublished = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Lessons.AddRange(lesson1, lesson2, lesson3);

        // Seed Exercises for Lesson 1
        var exercises = new List<Exercise>
        {
            new()
            {
                Id = Guid.NewGuid(),
                LessonId = lesson1.Id,
                Type = ExerciseType.MultipleChoice,
                Prompt = "What do you say when you meet someone?",
                Instruction = "Choose the correct greeting",
                OptionsJson = "[\"Hello\", \"Goodbye\", \"Thank you\", \"Sorry\"]",
                CorrectAnswerJson = "\"Hello\"",
                Explanation = "'Hello' is used when meeting someone",
                Difficulty = 1,
                XpReward = 10,
                OrderIndex = 1,
                IsAiGenerated = false,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                LessonId = lesson1.Id,
                Type = ExerciseType.FillBlank,
                Prompt = "_____, how are you?",
                Instruction = "Fill in the blank with the correct word",
                CorrectAnswerJson = "\"Hello\"",
                Explanation = "'Hello, how are you?' is a common greeting",
                Difficulty = 1,
                XpReward = 10,
                OrderIndex = 2,
                IsAiGenerated = false,
                CreatedAt = DateTime.UtcNow
            }
        };
        context.Exercises.AddRange(exercises);

        await context.SaveChangesAsync();
    }
}