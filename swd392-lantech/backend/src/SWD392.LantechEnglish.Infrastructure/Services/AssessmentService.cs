using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Assessments;
using SWD392.LantechEnglish.Application.DTOs.LearningPaths;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Domain.Enums;
using SWD392.LantechEnglish.Infrastructure.Data;
using System.Text.Json;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class AssessmentService : IAssessmentService
{
    private readonly AppDbContext _context;
    private readonly IAIProvider _aiProvider;
    private readonly IGamificationService _gamificationService;

    public AssessmentService(AppDbContext context, IAIProvider aiProvider, IGamificationService gamificationService)
    {
        _context = context;
        _aiProvider = aiProvider;
        _gamificationService = gamificationService;
    }

    public Task<AssessmentAvailableDto> GetAvailableAssessmentAsync(CancellationToken cancellationToken = default)
    {
        var dto = new AssessmentAvailableDto
        {
            SupportedSkills = new List<string> { "Listening", "Speaking", "Reading", "Writing" },
            EstimatedTimeMinutes = 40,
            QuestionsPerSkill = 6,
            ScoringMethod = "Continuous scale mapped to CEFR standard A1-C1 levels.",
            CanUseAiGeneratedQuestions = true,
            CanUseSeededQuestionBank = true
        };
        return Task.FromResult(dto);
    }

    public async Task<AssessmentDetailDto> StartAssessmentAsync(Guid userId, StartAssessmentRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        // Remove existing active assessment and answers to start fresh with new static questions
        var activeAssessment = await _context.Assessments
            .Where(a => a.UserId == userId && a.Status == AssessmentStatus.InProgress)
            .FirstOrDefaultAsync(cancellationToken);

        if (activeAssessment != null)
        {
            var activeAnswers = await _context.AssessmentAnswers
                .Where(a => a.AssessmentId == activeAssessment.Id)
                .ToListAsync(cancellationToken);
            if (activeAnswers.Any())
            {
                _context.AssessmentAnswers.RemoveRange(activeAnswers);
            }
            _context.Assessments.Remove(activeAssessment);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Create new assessment
        var assessment = new Assessment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            SourceLanguageCode = request.SourceLanguageCode,
            TargetLanguageCode = "en",
            Status = AssessmentStatus.InProgress,
            StartedAt = DateTime.UtcNow
        };

        _context.Assessments.Add(assessment);

        var selectedQuestions = new List<AssessmentQuestion>();
        var skills = new[] { SkillType.Listening, SkillType.Reading, SkillType.Writing, SkillType.Speaking };
        
        // Generate questions in parallel via AI
        var tasks = skills.Select(async skill =>
        {
            var skillQuestions = new List<AssessmentQuestion>();
            if (skill == SkillType.Listening)
            {
                var staticListeningQuestions = new List<AssessmentQuestion>
                {
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Listening,
                        Level = CefrLevel.B1,
                        IsAiGenerated = false,
                        Instruction = "Conversation 1",
                        QuestionText = "What is true about Beth?",
                        OptionsJson = JsonSerializer.Serialize(new[] { "A. She is a new teacher.", "B. Today is her first day at school.", "C. She is from a small town.", "D. She is Tony's sister." }),
                        CorrectAnswerJson = JsonSerializer.Serialize("B. Today is her first day at school."),
                        AudioUrl = "/audio/listening.mp3"
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Listening,
                        Level = CefrLevel.B1,
                        IsAiGenerated = false,
                        Instruction = "Conversation 1",
                        QuestionText = "Where is Beth from?",
                        OptionsJson = JsonSerializer.Serialize(new[] { "A. Mexico", "B. Costa Rica", "C. New York", "D. A small town" }),
                        CorrectAnswerJson = JsonSerializer.Serialize("C. New York"),
                        AudioUrl = "/audio/listening.mp3"
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Listening,
                        Level = CefrLevel.B1,
                        IsAiGenerated = false,
                        Instruction = "Conversation 1",
                        QuestionText = "Where was Tony born and raised?",
                        OptionsJson = JsonSerializer.Serialize(new[] { "A. New York", "B. In the small town", "C. Mexico", "D. Costa Rica" }),
                        CorrectAnswerJson = JsonSerializer.Serialize("B. In the small town"),
                        AudioUrl = "/audio/listening.mp3"
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Listening,
                        Level = CefrLevel.B1,
                        IsAiGenerated = false,
                        Instruction = "Conversation 2",
                        QuestionText = "How does Beth feel about her new school?",
                        OptionsJson = JsonSerializer.Serialize(new[] { "A. It is great.", "B. It is too small.", "C. It is boring.", "D. It is not very good." }),
                        CorrectAnswerJson = JsonSerializer.Serialize("A. It is great."),
                        AudioUrl = "/audio/listening.mp3"
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Listening,
                        Level = CefrLevel.B1,
                        IsAiGenerated = false,
                        Instruction = "Conversation 2",
                        QuestionText = "Who is Beth's English teacher?",
                        OptionsJson = JsonSerializer.Serialize(new[] { "A. Mrs. Garcia", "B. Mr. Antonio", "C. Mr. Wong", "D. Mrs. Beth" }),
                        CorrectAnswerJson = JsonSerializer.Serialize("C. Mr. Wong"),
                        AudioUrl = "/audio/listening.mp3"
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Listening,
                        Level = CefrLevel.B1,
                        IsAiGenerated = false,
                        Instruction = "Conversation 3",
                        QuestionText = "What is Beth's favorite class?",
                        OptionsJson = JsonSerializer.Serialize(new[] { "A. English", "B. Spanish", "C. Computer science", "D. History" }),
                        CorrectAnswerJson = JsonSerializer.Serialize("B. Spanish"),
                        AudioUrl = "/audio/listening.mp3"
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Listening,
                        Level = CefrLevel.B1,
                        IsAiGenerated = false,
                        Instruction = "Conversation 3",
                        QuestionText = "What language is Tony's first language?",
                        OptionsJson = JsonSerializer.Serialize(new[] { "A. English", "B. Spanish", "C. French", "D. Vietnamese" }),
                        CorrectAnswerJson = JsonSerializer.Serialize("B. Spanish"),
                        AudioUrl = "/audio/listening.mp3"
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Listening,
                        Level = CefrLevel.B1,
                        IsAiGenerated = false,
                        Instruction = "Conversation 3",
                        QuestionText = "Where is Tony's dad from?",
                        OptionsJson = JsonSerializer.Serialize(new[] { "A. New York", "B. Costa Rica", "C. Mexico", "D. Spain" }),
                        CorrectAnswerJson = JsonSerializer.Serialize("C. Mexico"),
                        AudioUrl = "/audio/listening.mp3"
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Listening,
                        Level = CefrLevel.B1,
                        IsAiGenerated = false,
                        Instruction = "Conversation 4",
                        QuestionText = "Where is Beth's Spanish class tomorrow?",
                        OptionsJson = JsonSerializer.Serialize(new[] { "A. Online at home", "B. In the classroom", "C. In the computer lab", "D. In the hallway" }),
                        CorrectAnswerJson = JsonSerializer.Serialize("C. In the computer lab"),
                        AudioUrl = "/audio/listening.mp3"
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Listening,
                        Level = CefrLevel.B1,
                        IsAiGenerated = false,
                        Instruction = "Conversation 4",
                        QuestionText = "Why does Beth not have internet at home yet?",
                        OptionsJson = JsonSerializer.Serialize(new[] { "A. She is still new in town.", "B. It is too expensive.", "C. She prefers online classes at school.", "D. The internet is broken." }),
                        CorrectAnswerJson = JsonSerializer.Serialize("A. She is still new in town."),
                        AudioUrl = "/audio/listening.mp3"
                    }
                };

                return staticListeningQuestions;
            }

            if (skill == SkillType.Reading)
            {
                var staticReadingQuestions = new List<AssessmentQuestion>
                {
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Reading,
                        Level = CefrLevel.B2,
                        IsAiGenerated = false,
                        Instruction = "READING PASSAGE",
                        PassageText = @"READING PASSAGE
The Evolution of Remote Work: A Modern Shift

In recent years, the global workforce has experienced a significant transformation, primarily driven by the rapid rise of remote work. Once considered a rare perk reserved for tech startups and freelancers, working from home has now become a mainstream employment model across various industries. This shift has not only redefined the traditional office environment but has also profoundly impacted the daily lives of millions of employees worldwide.

One of the most notable advantages of remote work is the flexibility it offers. Employees no longer face the daily stress of long commutes, allowing them to reclaim valuable hours each week. This extra time is frequently redirected toward personal well-being, family activities, or hobbies, resulting in a more balanced lifestyle. Furthermore, many remote workers report increased productivity. Without the frequent interruptions typical of a bustling office, such as impromptu meetings or loud conversations, individuals can create a customized environment that fosters deeper focus and concentration.

However, this transition is not without its challenges. The lines between professional responsibilities and personal life can easily become blurred. When an individual's living room also functions as their workspace, disconnecting at the end of the day becomes surprisingly difficult. This constant connection to work often leads to longer hours and, consequently, higher rates of burnout. Additionally, the lack of face-to-face interaction can foster feelings of isolation and detachment from colleagues. It can weaken team cohesion, making it harder for companies to maintain a strong collaborative culture.

To address these concerns, many organizations are now adopting a hybrid model. This approach combines the benefits of both worlds by requiring employees to spend a few days in the physical office while allowing them to work remotely for the remainder of the week. Hybrid setups aim to preserve the social bonds and spontaneous collaboration of office life while maintaining the autonomy that employees have come to value.

Ultimately, remote work is no longer just a temporary response to global events; it is a permanent evolution of how we view employment. As technology continues to advance, companies that adapt to these changing employee expectations will likely attract and retain top talent. Conversely, those that rigidly cling to outdated structures may find themselves struggling to compete in the modern job market.",
                        QuestionText = "Question 1: What is the main idea of the reading passage?",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "A. Why tech startups are better at managing remote workers than traditional companies.",
                            "B. The benefits and challenges of the shift toward remote and hybrid work models.",
                            "C. The historical background of how the traditional 9-to-5 office environment was created.",
                            "D. How to avoid burning out when working from home for long periods."
                        }),
                        CorrectAnswerJson = JsonSerializer.Serialize("B. The benefits and challenges of the shift toward remote and hybrid work models.")
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Reading,
                        Level = CefrLevel.B2,
                        IsAiGenerated = false,
                        Instruction = "READING PASSAGE",
                        PassageText = @"READING PASSAGE
The Evolution of Remote Work: A Modern Shift

In recent years, the global workforce has experienced a significant transformation, primarily driven by the rapid rise of remote work. Once considered a rare perk reserved for tech startups and freelancers, working from home has now become a mainstream employment model across various industries. This shift has not only redefined the traditional office environment but has also profoundly impacted the daily lives of millions of employees worldwide.

One of the most notable advantages of remote work is the flexibility it offers. Employees no longer face the daily stress of long commutes, allowing them to reclaim valuable hours each week. This extra time is frequently redirected toward personal well-being, family activities, or hobbies, resulting in a more balanced lifestyle. Furthermore, many remote workers report increased productivity. Without the frequent interruptions typical of a bustling office, such as impromptu meetings or loud conversations, individuals can create a customized environment that fosters deeper focus and concentration.

However, this transition is not without its challenges. The lines between professional responsibilities and personal life can easily become blurred. When an individual's living room also functions as their workspace, disconnecting at the end of the day becomes surprisingly difficult. This constant connection to work often leads to longer hours and, consequently, higher rates of burnout. Additionally, the lack of face-to-face interaction can foster feelings of isolation and detachment from colleagues. It can weaken team cohesion, making it harder for companies to maintain a strong collaborative culture.

To address these concerns, many organizations are now adopting a hybrid model. This approach combines the benefits of both worlds by requiring employees to spend a few days in the physical office while allowing them to work remotely for the remainder of the week. Hybrid setups aim to preserve the social bonds and spontaneous collaboration of office life while maintaining the autonomy that employees have come to value.

Ultimately, remote work is no longer just a temporary response to global events; it is a permanent evolution of how we view employment. As technology continues to advance, companies that adapt to these changing employee expectations will likely attract and retain top talent. Conversely, those that rigidly cling to outdated structures may find themselves struggling to compete in the modern job market.",
                        QuestionText = "Question 2: According to paragraph 1, how was remote work viewed in the past?",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "A. It was an essential requirement for all major global industries.",
                            "B. It was widely disliked by most modern employees.",
                            "C. It was an uncommon benefit limited to specific types of workers.",
                            "D. It was considered a highly unproductive way to manage a business."
                        }),
                        CorrectAnswerJson = JsonSerializer.Serialize("C. It was an uncommon benefit limited to specific types of workers.")
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Reading,
                        Level = CefrLevel.B2,
                        IsAiGenerated = false,
                        Instruction = "READING PASSAGE",
                        PassageText = @"READING PASSAGE
The Evolution of Remote Work: A Modern Shift

In recent years, the global workforce has experienced a significant transformation, primarily driven by the rapid rise of remote work. Once considered a rare perk reserved for tech startups and freelancers, working from home has now become a mainstream employment model across various industries. This shift has not only redefined the traditional office environment but has also profoundly impacted the daily lives of millions of employees worldwide.

One of the most notable advantages of remote work is the flexibility it offers. Employees no longer face the daily stress of long commutes, allowing them to reclaim valuable hours each week. This extra time is frequently redirected toward personal well-being, family activities, or hobbies, resulting in a more balanced lifestyle. Furthermore, many remote workers report increased productivity. Without the frequent interruptions typical of a bustling office, such as impromptu meetings or loud conversations, individuals can create a customized environment that fosters deeper focus and concentration.

However, this transition is not without its challenges. The lines between professional responsibilities and personal life can easily become blurred. When an individual's living room also functions as their workspace, disconnecting at the end of the day becomes surprisingly difficult. This constant connection to work often leads to longer hours and, consequently, higher rates of burnout. Additionally, the lack of face-to-face interaction can foster feelings of isolation and detachment from colleagues. It can weaken team cohesion, making it harder for companies to maintain a strong collaborative culture.

To address these concerns, many organizations are now adopting a hybrid model. This approach combines the benefits of both worlds by requiring employees to spend a few days in the physical office while allowing them to work remotely for the remainder of the week. Hybrid setups aim to preserve the social bonds and spontaneous collaboration of office life while maintaining the autonomy that employees have come to value.

Ultimately, remote work is no longer just a temporary response to global events; it is a permanent evolution of how we view employment. As technology continues to advance, companies that adapt to these changing employee expectations will likely attract and retain top talent. Conversely, those that rigidly cling to outdated structures may find themselves struggling to compete in the modern job market.",
                        QuestionText = "Question 3: What is mentioned in paragraph 2 as a reason for higher productivity among remote workers?",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "A. They have access to better technology at home than in the office.",
                            "B. They work longer hours without taking any lunch breaks.",
                            "C. They experience fewer daily distractions compared to a busy office.",
                            "D. They are strictly monitored by their managers through software."
                        }),
                        CorrectAnswerJson = JsonSerializer.Serialize("C. They experience fewer daily distractions compared to a busy office.")
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Reading,
                        Level = CefrLevel.B2,
                        IsAiGenerated = false,
                        Instruction = "READING PASSAGE",
                        PassageText = @"READING PASSAGE
The Evolution of Remote Work: A Modern Shift

In recent years, the global workforce has experienced a significant transformation, primarily driven by the rapid rise of remote work. Once considered a rare perk reserved for tech startups and freelancers, working from home has now become a mainstream employment model across various industries. This shift has not only redefined the traditional office environment but has also profoundly impacted the daily lives of millions of employees worldwide.

One of the most notable advantages of remote work is the flexibility it offers. Employees no longer face the daily stress of long commutes, allowing them to reclaim valuable hours each week. This extra time is frequently redirected toward personal well-being, family activities, or hobbies, resulting in a more balanced lifestyle. Furthermore, many remote workers report increased productivity. Without the frequent interruptions typical of a bustling office, such as impromptu meetings or loud conversations, individuals can create a customized environment that fosters deeper focus and concentration.

However, this transition is not without its challenges. The lines between professional responsibilities and personal life can easily become blurred. When an individual's living room also functions as their workspace, disconnecting at the end of the day becomes surprisingly difficult. This constant connection to work often leads to longer hours and, consequently, higher rates of burnout. Additionally, the lack of face-to-face interaction can foster feelings of isolation and detachment from colleagues. It can weaken team cohesion, making it harder for companies to maintain a strong collaborative culture.

To address these concerns, many organizations are now adopting a hybrid model. This approach combines the benefits of both worlds by requiring employees to spend a few days in the physical office while allowing them to work remotely for the remainder of the week. Hybrid setups aim to preserve the social bonds and spontaneous collaboration of office life while maintaining the autonomy that employees have come to value.

Ultimately, remote work is no longer just a temporary response to global events; it is a permanent evolution of how we view employment. As technology continues to advance, companies that adapt to these changing employee expectations will likely attract and retain top talent. Conversely, those that rigidly cling to outdated structures may find themselves struggling to compete in the modern job market.",
                        QuestionText = "Question 4: The word \"reclaim\" in paragraph 2 is closest in meaning to:",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "A. waste",
                            "B. gain back",
                            "C. request",
                            "D. exchange"
                        }),
                        CorrectAnswerJson = JsonSerializer.Serialize("B. gain back")
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Reading,
                        Level = CefrLevel.B2,
                        IsAiGenerated = false,
                        Instruction = "READING PASSAGE",
                        PassageText = @"READING PASSAGE
The Evolution of Remote Work: A Modern Shift

In recent years, the global workforce has experienced a significant transformation, primarily driven by the rapid rise of remote work. Once considered a rare perk reserved for tech startups and freelancers, working from home has now become a mainstream employment model across various industries. This shift has not only redefined the traditional office environment but has also profoundly impacted the daily lives of millions of employees worldwide.

One of the most notable advantages of remote work is the flexibility it offers. Employees no longer face the daily stress of long commutes, allowing them to reclaim valuable hours each week. This extra time is frequently redirected toward personal well-being, family activities, or hobbies, resulting in a more balanced lifestyle. Furthermore, many remote workers report increased productivity. Without the frequent interruptions typical of a bustling office, such as impromptu meetings or loud conversations, individuals can create a customized environment that fosters deeper focus and concentration.

However, this transition is not without its challenges. The lines between professional responsibilities and personal life can easily become blurred. When an individual's living room also functions as their workspace, disconnecting at the end of the day becomes surprisingly difficult. This constant connection to work often leads to longer hours and, consequently, higher rates of burnout. Additionally, the lack of face-to-face interaction can foster feelings of isolation and detachment from colleagues. It can weaken team cohesion, making it harder for companies to maintain a strong collaborative culture.

To address these concerns, many organizations are now adopting a hybrid model. This approach combines the benefits of both worlds by requiring employees to spend a few days in the physical office while allowing them to work remotely for the remainder of the week. Hybrid setups aim to preserve the social bonds and spontaneous collaboration of office life while maintaining the autonomy that employees have come to value.

Ultimately, remote work is no longer just a temporary response to global events; it is a permanent evolution of how we view employment. As technology continues to advance, companies that adapt to these changing employee expectations will likely attract and retain top talent. Conversely, those that rigidly cling to outdated structures may find themselves struggling to compete in the modern job market.",
                        QuestionText = "Question 5: According to paragraph 3, why do some remote workers suffer from burnout?",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "A. They are forced to commute during peak traffic hours.",
                            "B. They find it hard to stop working because their home is also their office.",
                            "C. Their salaries are lower than those of traditional office workers.",
                            "D. They do not know how to use modern collaboration tools properly."
                        }),
                        CorrectAnswerJson = JsonSerializer.Serialize("B. They find it hard to stop working because their home is also their office.")
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Reading,
                        Level = CefrLevel.B2,
                        IsAiGenerated = false,
                        Instruction = "READING PASSAGE",
                        PassageText = @"READING PASSAGE
The Evolution of Remote Work: A Modern Shift

In recent years, the global workforce has experienced a significant transformation, primarily driven by the rapid rise of remote work. Once considered a rare perk reserved for tech startups and freelancers, working from home has now become a mainstream employment model across various industries. This shift has not only redefined the traditional office environment but has also profoundly impacted the daily lives of millions of employees worldwide.

One of the most notable advantages of remote work is the flexibility it offers. Employees no longer face the daily stress of long commutes, allowing them to reclaim valuable hours each week. This extra time is frequently redirected toward personal well-being, family activities, or hobbies, resulting in a more balanced lifestyle. Furthermore, many remote workers report increased productivity. Without the frequent interruptions typical of a bustling office, such as impromptu meetings or loud conversations, individuals can create a customized environment that fosters deeper focus and concentration.

However, this transition is not without its challenges. The lines between professional responsibilities and personal life can easily become blurred. When an individual's living room also functions as their workspace, disconnecting at the end of the day becomes surprisingly difficult. This constant connection to work often leads to longer hours and, consequently, higher rates of burnout. Additionally, the lack of face-to-face interaction can foster feelings of isolation and detachment from colleagues. It can weaken team cohesion, making it harder for companies to maintain a strong collaborative culture.

To address these concerns, many organizations are now adopting a hybrid model. This approach combines the benefits of both worlds by requiring employees to spend a few days in the physical office while allowing them to work remotely for the remainder of the week. Hybrid setups aim to preserve the social bonds and spontaneous collaboration of office life while maintaining the autonomy that employees have come to value.

Ultimately, remote work is no longer just a temporary response to global events; it is a permanent evolution of how we view employment. As technology continues to advance, companies that adapt to these changing employee expectations will likely attract and retain top talent. Conversely, those that rigidly cling to outdated structures may find themselves struggling to compete in the modern job market.",
                        QuestionText = "Question 6: What does the word \"It\" in paragraph 3 refer to?",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "A. The lack of face-to-face interaction",
                            "B. An individual's living room",
                            "C. A strong collaborative culture",
                            "D. Professional responsibility"
                        }),
                        CorrectAnswerJson = JsonSerializer.Serialize("A. The lack of face-to-face interaction")
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Reading,
                        Level = CefrLevel.B2,
                        IsAiGenerated = false,
                        Instruction = "READING PASSAGE",
                        PassageText = @"READING PASSAGE
The Evolution of Remote Work: A Modern Shift

In recent years, the global workforce has experienced a significant transformation, primarily driven by the rapid rise of remote work. Once considered a rare perk reserved for tech startups and freelancers, working from home has now become a mainstream employment model across various industries. This shift has not only redefined the traditional office environment but has also profoundly impacted the daily lives of millions of employees worldwide.

One of the most notable advantages of remote work is the flexibility it offers. Employees no longer face the daily stress of long commutes, allowing them to reclaim valuable hours each week. This extra time is frequently redirected toward personal well-being, family activities, or hobbies, resulting in a more balanced lifestyle. Furthermore, many remote workers report increased productivity. Without the frequent interruptions typical of a bustling office, such as impromptu meetings or loud conversations, individuals can create a customized environment that fosters deeper focus and concentration.

However, this transition is not without its challenges. The lines between professional responsibilities and personal life can easily become blurred. When an individual's living room also functions as their workspace, disconnecting at the end of the day becomes surprisingly difficult. This constant connection to work often leads to longer hours and, consequently, higher rates of burnout. Additionally, the lack of face-to-face interaction can foster feelings of isolation and detachment from colleagues. It can weaken team cohesion, making it harder for companies to maintain a strong collaborative culture.

To address these concerns, many organizations are now adopting a hybrid model. This approach combines the benefits of both worlds by requiring employees to spend a few days in the physical office while allowing them to work remotely for the remainder of the week. Hybrid setups aim to preserve the social bonds and spontaneous collaboration of office life while maintaining the autonomy that employees have come to value.

Ultimately, remote work is no longer just a temporary response to global events; it is a permanent evolution of how we view employment. As technology continues to advance, companies that adapt to these changing employee expectations will likely attract and retain top talent. Conversely, those that rigidly cling to outdated structures may find themselves struggling to compete in the modern job market.",
                        QuestionText = "Question 7: According to the passage, how does a hybrid model solve the problems of remote work?",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "A. By cutting down the salary of employees who choose to stay at home.",
                            "B. By forcing all employees to return to the physical office full-time.",
                            "C. By offering completely free internet and computer equipment at home.",
                            "D. By mixing office days for social connection with remote days for independence."
                        }),
                        CorrectAnswerJson = JsonSerializer.Serialize("D. By mixing office days for social connection with remote days for independence.")
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Reading,
                        Level = CefrLevel.B2,
                        IsAiGenerated = false,
                        Instruction = "READING PASSAGE",
                        PassageText = @"READING PASSAGE
The Evolution of Remote Work: A Modern Shift

In recent years, the global workforce has experienced a significant transformation, primarily driven by the rapid rise of remote work. Once considered a rare perk reserved for tech startups and freelancers, working from home has now become a mainstream employment model across various industries. This shift has not only redefined the traditional office environment but has also profoundly impacted the daily lives of millions of employees worldwide.

One of the most notable advantages of remote work is the flexibility it offers. Employees no longer face the daily stress of long commutes, allowing them to reclaim valuable hours each week. This extra time is frequently redirected toward personal well-being, family activities, or hobbies, resulting in a more balanced lifestyle. Furthermore, many remote workers report increased productivity. Without the frequent interruptions typical of a bustling office, such as impromptu meetings or loud conversations, individuals can create a customized environment that fosters deeper focus and concentration.

However, this transition is not without its challenges. The lines between professional responsibilities and personal life can easily become blurred. When an individual's living room also functions as their workspace, disconnecting at the end of the day becomes surprisingly difficult. This constant connection to work often leads to longer hours and, consequently, higher rates of burnout. Additionally, the lack of face-to-face interaction can foster feelings of isolation and detachment from colleagues. It can weaken team cohesion, making it harder for companies to maintain a strong collaborative culture.

To address these concerns, many organizations are now adopting a hybrid model. This approach combines the benefits of both worlds by requiring employees to spend a few days in the physical office while allowing them to work remotely for the remainder of the week. Hybrid setups aim to preserve the social bonds and spontaneous collaboration of office life while maintaining the autonomy that employees have come to value.

Ultimately, remote work is no longer just a temporary response to global events; it is a permanent evolution of how we view employment. As technology continues to advance, companies that adapt to these changing employee expectations will likely attract and retain top talent. Conversely, those that rigidly cling to outdated structures may find themselves struggling to compete in the modern job market.",
                        QuestionText = "Question 8: The word \"autonomy\" in paragraph 4 is closest in meaning to:",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "A. discipline",
                            "B. independence",
                            "C. teamwork",
                            "D. technology"
                        }),
                        CorrectAnswerJson = JsonSerializer.Serialize("B. independence")
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Reading,
                        Level = CefrLevel.B2,
                        IsAiGenerated = false,
                        Instruction = "READING PASSAGE",
                        PassageText = @"READING PASSAGE
The Evolution of Remote Work: A Modern Shift

In recent years, the global workforce has experienced a significant transformation, primarily driven by the rapid rise of remote work. Once considered a rare perk reserved for tech startups and freelancers, working from home has now become a mainstream employment model across various industries. This shift has not only redefined the traditional office environment but has also profoundly impacted the daily lives of millions of employees worldwide.

One of the most notable advantages of remote work is the flexibility it offers. Employees no longer face the daily stress of long commutes, allowing them to reclaim valuable hours each week. This extra time is frequently redirected toward personal well-being, family activities, or hobbies, resulting in a more balanced lifestyle. Furthermore, many remote workers report increased productivity. Without the frequent interruptions typical of a bustling office, such as impromptu meetings or loud conversations, individuals can create a customized environment that fosters deeper focus and concentration.

However, this transition is not without its challenges. The lines between professional responsibilities and personal life can easily become blurred. When an individual's living room also functions as their workspace, disconnecting at the end of the day becomes surprisingly difficult. This constant connection to work often leads to longer hours and, consequently, higher rates of burnout. Additionally, the lack of face-to-face interaction can foster feelings of isolation and detachment from colleagues. It can weaken team cohesion, making it harder for companies to maintain a strong collaborative culture.

To address these concerns, many organizations are now adopting a hybrid model. This approach combines the benefits of both worlds by requiring employees to spend a few days in the physical office while allowing them to work remotely for the remainder of the week. Hybrid setups aim to preserve the social bonds and spontaneous collaboration of office life while maintaining the autonomy that employees have come to value.

Ultimately, remote work is no longer just a temporary response to global events; it is a permanent evolution of how we view employment. As technology continues to advance, companies that adapt to these changing employee expectations will likely attract and retain top talent. Conversely, those that rigidly cling to outdated structures may find themselves struggling to compete in the modern job market.",
                        QuestionText = "Question 9: What does the author predict about companies that refuse to adapt to flexible work models?",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "A. They will save a lot of money on office rent.",
                            "B. They will fail to attract and keep highly skilled employees.",
                            "C. They will automatically become more competitive in the market.",
                            "D. They will be forced to shut down by global regulations."
                        }),
                        CorrectAnswerJson = JsonSerializer.Serialize("B. They will fail to attract and keep highly skilled employees.")
                    },
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Reading,
                        Level = CefrLevel.B2,
                        IsAiGenerated = false,
                        Instruction = "READING PASSAGE",
                        PassageText = @"READING PASSAGE
The Evolution of Remote Work: A Modern Shift

In recent years, the global workforce has experienced a significant transformation, primarily driven by the rapid rise of remote work. Once considered a rare perk reserved for tech startups and freelancers, working from home has now become a mainstream employment model across various industries. This shift has not only redefined the traditional office environment but has also profoundly impacted the daily lives of millions of employees worldwide.

One of the most notable advantages of remote work is the flexibility it offers. Employees no longer face the daily stress of long commutes, allowing them to reclaim valuable hours each week. This extra time is frequently redirected toward personal well-being, family activities, or hobbies, resulting in a more balanced lifestyle. Furthermore, many remote workers report increased productivity. Without the frequent interruptions typical of a bustling office, such as impromptu meetings or loud conversations, individuals can create a customized environment that fosters deeper focus and concentration.

However, this transition is not without its challenges. The lines between professional responsibilities and personal life can easily become blurred. When an individual's living room also functions as their workspace, disconnecting at the end of the day becomes surprisingly difficult. This constant connection to work often leads to longer hours and, consequently, higher rates of burnout. Additionally, the lack of face-to-face interaction can foster feelings of isolation and detachment from colleagues. It can weaken team cohesion, making it harder for companies to maintain a strong collaborative culture.

To address these concerns, many organizations are now adopting a hybrid model. This approach combines the benefits of both worlds by requiring employees to spend a few days in the physical office while allowing them to work remotely for the remainder of the week. Hybrid setups aim to preserve the social bonds and spontaneous collaboration of office life while maintaining the autonomy that employees have come to value.

Ultimately, remote work is no longer just a temporary response to global events; it is a permanent evolution of how we view employment. As technology continues to advance, companies that adapt to these changing employee expectations will likely attract and retain top talent. Conversely, those that rigidly cling to outdated structures may find themselves struggling to compete in the modern job market.",
                        QuestionText = "Question 10: Which of the following statements would the author most likely agree with?",
                        OptionsJson = JsonSerializer.Serialize(new[] {
                            "A. Remote work was just a temporary trend that will completely disappear soon.",
                            "B. Traditional offices are the only places where true productivity can happen.",
                            "C. The future of employment relies heavily on flexibility and modern adaptation.",
                            "D. Working from home has no negative impacts on teamwork or mental health."
                        }),
                        CorrectAnswerJson = JsonSerializer.Serialize("C. The future of employment relies heavily on flexibility and modern adaptation.")
                    }
                };

                return staticReadingQuestions;
            }

            if (skill == SkillType.Writing)
            {
                var staticWritingQuestions = new List<AssessmentQuestion>
                {
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Writing,
                        Level = CefrLevel.B1,
                        IsAiGenerated = false,
                        Instruction = "Topic: Daily Activities and Plans\nWord count: Around 150 – 200 words (Khoảng 150 - 200 từ)",
                        QuestionText = "You have received an email from your English-speaking friend, Chris, who wants to know about your daily life. Read Chris's email below.\n\nSubject: Hello from Chris!\nHi,\nHow have you been? I'd love to hear about your daily routine. What do you usually do on weekdays and weekends? Also, what are your plans for the upcoming months?\nLooking forward to hearing from you!\nBest,\nChris",
                        WritingPrompt = "You have received an email from your English-speaking friend, Chris, who wants to know about your daily life. Read Chris's email below.\n\nSubject: Hello from Chris!\nHi,\nHow have you been? I'd love to hear about your daily routine. What do you usually do on weekdays and weekends? Also, what are your plans for the upcoming months?\nLooking forward to hearing from you!\nBest,\nChris"
                    }
                };
                return staticWritingQuestions;
            }

            if (skill == SkillType.Speaking)
            {
                var staticSpeakingQuestions = new List<AssessmentQuestion>
                {
                    new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = SkillType.Speaking,
                        Level = CefrLevel.B1,
                        IsAiGenerated = false,
                        Instruction = "Topic: Personal Introduction and Future Aspirations\nTime limit: Exactly 1 minute (60 seconds)",
                        QuestionText = "Introduce yourself to the examiner. Briefly talk about who you are, what you are currently focused on, and what your main aspirations or goals are for the future.",
                        SpeakingPrompt = "Introduce yourself to the examiner. Briefly talk about who you are, what you are currently focused on, and what your main aspirations or goals are for the future."
                    }
                };
                return staticSpeakingQuestions;
            }

            try
            {
                var json = await _aiProvider.GenerateAssessmentQuestionsAsync(skill, CefrLevel.B1, request.SourceLanguageCode, 2, cancellationToken);
                var aiQuestions = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(json);
                if (aiQuestions != null)
                {
                    foreach (var aiQ in aiQuestions)
                    {
                        var q = new AssessmentQuestion
                        {
                            Id = Guid.NewGuid(),
                            Skill = skill,
                            Level = CefrLevel.B1,
                            IsAiGenerated = true,
                            QuestionText = aiQ.TryGetValue("questionText", out var qt) && qt.ValueKind == JsonValueKind.String ? qt.GetString() : "",
                            Instruction = aiQ.TryGetValue("instruction", out var inst) && inst.ValueKind == JsonValueKind.String ? inst.GetString() : "",
                            Explanation = aiQ.TryGetValue("explanation", out var exp) && exp.ValueKind == JsonValueKind.String ? exp.GetString() : ""
                        };
                        
                        if (aiQ.TryGetValue("options", out var opt) && opt.ValueKind == JsonValueKind.Array)
                            q.OptionsJson = JsonSerializer.Serialize(opt);
                        
                        if (aiQ.TryGetValue("correctAnswer", out var ca))
                            q.CorrectAnswerJson = JsonSerializer.Serialize(ca.ValueKind == JsonValueKind.String ? ca.GetString() : ca.GetRawText());

                        if (skill == SkillType.Reading && aiQ.TryGetValue("passageText", out var pt) && pt.ValueKind == JsonValueKind.String)
                            q.PassageText = pt.GetString();
                            
                        if (skill == SkillType.Listening && aiQ.TryGetValue("audioTranscript", out var at) && at.ValueKind == JsonValueKind.String)
                        {
                            q.AudioTranscript = at.GetString();
                            try 
                            {
                                var audioBytes = await _aiProvider.GenerateAudioAsync(q.AudioTranscript ?? "", "alloy", cancellationToken);
                                q.AudioUrl = $"data:audio/mp3;base64,{Convert.ToBase64String(audioBytes)}";
                            }
                            catch
                            {
                                // fallback if audio fails
                            }
                        }
                            
                        if (skill == SkillType.Writing && aiQ.TryGetValue("writingPrompt", out var wp) && wp.ValueKind == JsonValueKind.String)
                            q.WritingPrompt = wp.GetString();
                            
                        if (skill == SkillType.Speaking && aiQ.TryGetValue("speakingPrompt", out var sp) && sp.ValueKind == JsonValueKind.String)
                            q.SpeakingPrompt = sp.GetString();

                        skillQuestions.Add(q);
                    }
                }
            }
            catch
            {
                // Fallback to mock on fail
                for (int i = 0; i < 2; i++)
                {
                    var mockQ = new AssessmentQuestion
                    {
                        Id = Guid.NewGuid(),
                        Skill = skill,
                        Level = CefrLevel.B1,
                        IsAiGenerated = true,
                        QuestionText = $"Diagnostic {skill} prompt {i + 1} (Fallback)",
                        Instruction = "Read and follow the instruction.",
                    };
                    if (skill == SkillType.Reading || skill == SkillType.Listening)
                    {
                        mockQ.OptionsJson = JsonSerializer.Serialize(new[] { "Option A", "Option B", "Option C", "Option D" });
                        mockQ.CorrectAnswerJson = JsonSerializer.Serialize("Option A");
                    }
                    skillQuestions.Add(mockQ);
                }
            }
            return skillQuestions;
        });

        var results = await Task.WhenAll(tasks);
        foreach (var res in results)
        {
            selectedQuestions.AddRange(res);
        }

        // Add all questions to DbContext safely on the main thread to avoid thread safety issues
        _context.AssessmentQuestions.AddRange(selectedQuestions);

        // Insert blank answers to log selected questions
        foreach (var q in selectedQuestions)
        {
            _context.AssessmentAnswers.Add(new AssessmentAnswer
            {
                Id = Guid.NewGuid(),
                AssessmentId = assessment.Id,
                AssessmentQuestionId = q.Id,
                UserId = userId,
                Skill = q.Skill,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        return await GetAssessmentDetailAsync(assessment.Id, cancellationToken);
    }

    public async Task<AssessmentDetailDto> GetAssessmentDetailAsync(Guid assessmentId, CancellationToken cancellationToken = default)
    {
        var assessment = await _context.Assessments.FindAsync(new object[] { assessmentId }, cancellationToken);
        if (assessment == null) throw new KeyNotFoundException("Assessment not found");

        var blankAnswers = await _context.AssessmentAnswers
            .Where(a => a.AssessmentId == assessmentId)
            .OrderBy(a => a.CreatedAt)
            .ToListAsync(cancellationToken);

        var questionIds = blankAnswers.Select(a => a.AssessmentQuestionId).ToList();

        var questions = await _context.AssessmentQuestions
            .Where(q => questionIds.Contains(q.Id))
            .ToListAsync(cancellationToken);

        // Sort in memory to preserve original seeding order
        var orderedQuestions = questionIds
            .Select(id => questions.FirstOrDefault(q => q.Id == id))
            .Where(q => q != null)
            .ToList();

        var questionDtos = orderedQuestions.Select(q => MapToQuestionDto(q)).ToList();

        return new AssessmentDetailDto
        {
            Id = assessment.Id,
            UserId = assessment.UserId,
            SourceLanguageCode = assessment.SourceLanguageCode,
            TargetLanguageCode = assessment.TargetLanguageCode,
            Status = assessment.Status.ToString(),
            OverallScore = assessment.OverallScore,
            ListeningScore = assessment.ListeningScore,
            SpeakingScore = assessment.SpeakingScore,
            ReadingScore = assessment.ReadingScore,
            WritingScore = assessment.WritingScore,
            ResultLevel = assessment.ResultLevel?.ToString(),
            StartedAt = assessment.StartedAt,
            CompletedAt = assessment.CompletedAt,
            Questions = questionDtos
        };
    }

    public async Task<Dictionary<string, List<AssessmentQuestionDto>>> GetAssessmentQuestionsBySkillAsync(Guid assessmentId, CancellationToken cancellationToken = default)
    {
        var detail = await GetAssessmentDetailAsync(assessmentId, cancellationToken);
        return detail.Questions
            .GroupBy(q => q.Skill)
            .ToDictionary(g => g.Key, g => g.ToList());
    }

    public async Task<SubmitResultDto> SubmitListeningAnswersAsync(Guid assessmentId, Guid userId, SubmitAnswersRequest request, CancellationToken cancellationToken = default)
    {
        return await GradeObjectiveSectionAsync(assessmentId, userId, SkillType.Listening, request, cancellationToken);
    }

    public async Task<SubmitResultDto> SubmitReadingAnswersAsync(Guid assessmentId, Guid userId, SubmitAnswersRequest request, CancellationToken cancellationToken = default)
    {
        return await GradeObjectiveSectionAsync(assessmentId, userId, SkillType.Reading, request, cancellationToken);
    }

    public async Task<SubmitResultDto> SubmitWritingAnswersAsync(Guid assessmentId, Guid userId, SubmitAnswersRequest request, CancellationToken cancellationToken = default)
    {
        var assessment = await _context.Assessments.FindAsync(new object[] { assessmentId }, cancellationToken);
        if (assessment == null) throw new KeyNotFoundException("Assessment not found");

        double totalScore = 0;
        int count = 0;
        var feedbacks = new List<string>();

        foreach (var answerItem in request.Answers)
        {
            var question = await _context.AssessmentQuestions.FindAsync(new object[] { answerItem.QuestionId }, cancellationToken);
            if (question == null || question.Skill != SkillType.Writing) continue;

            var dbAnswer = await _context.AssessmentAnswers
                .FirstOrDefaultAsync(a => a.AssessmentId == assessmentId && a.AssessmentQuestionId == question.Id, cancellationToken);

            if (dbAnswer == null) continue;

            // Grade using AI
            var prompt = question.WritingPrompt ?? question.QuestionText;
            var ansText = answerItem.AnswerText ?? string.Empty;
            var (score, feedback) = await _aiProvider.GradeWritingAsync(prompt, ansText, assessment.SourceLanguageCode, cancellationToken);

            dbAnswer.AnswerText = ansText;
            dbAnswer.Score = score;
            dbAnswer.Feedback = feedback;
            dbAnswer.CreatedAt = DateTime.UtcNow;

            totalScore += score;
            count++;
            feedbacks.Add(feedback);
        }

        double sectionScore = count == 0 ? 0.0 : totalScore / count;
        assessment.WritingScore = sectionScore;

        // Upsert section
        await UpsertSectionAsync(assessmentId, SkillType.Writing, sectionScore, string.Join("; ", feedbacks), cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new SubmitResultDto
        {
            Score = sectionScore,
            Feedback = count == 0 ? "No questions submitted." : "Your writing section has been graded by AI."
        };
    }

    public async Task<SubmitResultDto> SubmitSpeakingAnswersAsync(Guid assessmentId, Guid userId, SubmitAnswersRequest request, CancellationToken cancellationToken = default)
    {
        var assessment = await _context.Assessments.FindAsync(new object[] { assessmentId }, cancellationToken);
        if (assessment == null) throw new KeyNotFoundException("Assessment not found");

        double totalScore = 0;
        int count = 0;
        var feedbacks = new List<string>();

        foreach (var answerItem in request.Answers)
        {
            var question = await _context.AssessmentQuestions.FindAsync(new object[] { answerItem.QuestionId }, cancellationToken);
            if (question == null || question.Skill != SkillType.Speaking) continue;

            var dbAnswer = await _context.AssessmentAnswers
                .FirstOrDefaultAsync(a => a.AssessmentId == assessmentId && a.AssessmentQuestionId == question.Id, cancellationToken);

            if (dbAnswer == null) continue;

            // Grade using AI/Speech Provider
            var prompt = question.SpeakingPrompt ?? question.QuestionText;
            var target = answerItem.TargetText ?? question.SpeakingPrompt ?? string.Empty;
            var transcript = answerItem.TranscriptText ?? string.Empty;

            var (score, feedback) = await _aiProvider.GradeSpeakingAsync(prompt, transcript, target, assessment.SourceLanguageCode, cancellationToken);

            dbAnswer.AnswerText = target;
            dbAnswer.TranscriptText = transcript;
            dbAnswer.Score = score;
            dbAnswer.Feedback = feedback;
            dbAnswer.CreatedAt = DateTime.UtcNow;

            totalScore += score;
            count++;
            feedbacks.Add(feedback);
        }

        double sectionScore = count == 0 ? 0.0 : totalScore / count;
        assessment.SpeakingScore = sectionScore;

        // Upsert section
        await UpsertSectionAsync(assessmentId, SkillType.Speaking, sectionScore, string.Join("; ", feedbacks), cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new SubmitResultDto
        {
            Score = sectionScore,
            Feedback = count == 0 ? "No questions submitted." : "Your speaking section has been graded by AI."
        };
    }

    public async Task<AssessmentCompleteResultDto> CompleteAssessmentAsync(Guid assessmentId, Guid userId, CancellationToken cancellationToken = default)
    {
        var assessment = await _context.Assessments.FindAsync(new object[] { assessmentId }, cancellationToken);
        if (assessment == null) throw new KeyNotFoundException("Assessment not found");

        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);
        if (user == null) throw new KeyNotFoundException("User not found");

        double listening = assessment.ListeningScore ?? 0;
        double reading = assessment.ReadingScore ?? 0;
        double writing = assessment.WritingScore ?? 0;
        double speaking = assessment.SpeakingScore ?? 0;

        double overallScore = (listening + reading + writing + speaking) / 4.0;
        assessment.OverallScore = overallScore;

        // Determine levels
        CefrLevel GetCefrLevel(double score) => score switch
        {
            < 20 => CefrLevel.A1,
            < 40 => CefrLevel.A2,
            < 60 => CefrLevel.B1,
            < 80 => CefrLevel.B2,
            _ => CefrLevel.C1
        };

        var resultLevel = GetCefrLevel(overallScore);
        assessment.ResultLevel = resultLevel;
        assessment.Status = AssessmentStatus.Completed;
        assessment.CompletedAt = DateTime.UtcNow;

        var breakdown = new Dictionary<string, double>
        {
            ["Listening"] = listening,
            ["Speaking"] = speaking,
            ["Reading"] = reading,
            ["Writing"] = writing
        };
        assessment.SkillBreakdownJson = JsonSerializer.Serialize(breakdown);

        var weakSkills = new List<string>();
        if (speaking < 70) weakSkills.Add("Speaking");
        if (writing < 70) weakSkills.Add("Writing");
        if (listening < 70) weakSkills.Add("Listening");
        if (reading < 70) weakSkills.Add("Reading");
        assessment.WeakSkillsJson = JsonSerializer.Serialize(weakSkills);

        // Update user
        user.CurrentCefrLevel = resultLevel;
        user.LevelSource = LevelSource.Assessment;
        user.UpdatedAt = DateTime.UtcNow;

        // Award Badge dynamically
        await _gamificationService.CheckAndAwardBadgesAsync(userId, cancellationToken);

        // Save UserSkillProfile
        var profile = new UserSkillProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            OverallLevel = resultLevel,
            ListeningLevel = GetCefrLevel(listening),
            SpeakingLevel = GetCefrLevel(speaking),
            ReadingLevel = GetCefrLevel(reading),
            WritingLevel = GetCefrLevel(writing),
            ListeningScore = listening,
            SpeakingScore = speaking,
            ReadingScore = reading,
            WritingScore = writing,
            Source = LevelSource.Assessment,
            Notes = "Completed standard 4-skill diagnostic test.",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.UserSkillProfiles.Add(profile);

        // Award XP
        user.Xp += 150;
        _context.XpTransactions.Add(new XpTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Amount = 150,
            Reason = "Completed diagnostic assessment",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);

        // Generate personalized learning path
        var learningPath = await CreateLearningPathInternalAsync(user, resultLevel, LevelSource.Assessment, weakSkills, cancellationToken);

        return new AssessmentCompleteResultDto
        {
            OverallScore = overallScore,
            CefrLevel = resultLevel.ToString(),
            SkillBreakdown = breakdown,
            WeakSkills = weakSkills,
            LearningPathId = learningPath.Id
        };
    }

    public async Task<IEnumerable<AssessmentDetailDto>> GetAssessmentHistoryAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var history = await _context.Assessments
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.StartedAt)
            .ToListAsync(cancellationToken);

        var list = new List<AssessmentDetailDto>();
        foreach (var a in history)
        {
            list.Add(new AssessmentDetailDto
            {
                Id = a.Id,
                UserId = a.UserId,
                SourceLanguageCode = a.SourceLanguageCode,
                TargetLanguageCode = a.TargetLanguageCode,
                Status = a.Status.ToString(),
                OverallScore = a.OverallScore,
                ListeningScore = a.ListeningScore,
                SpeakingScore = a.SpeakingScore,
                ReadingScore = a.ReadingScore,
                WritingScore = a.WritingScore,
                ResultLevel = a.ResultLevel?.ToString(),
                StartedAt = a.StartedAt,
                CompletedAt = a.CompletedAt
            });
        }
        return list;
    }

    public async Task<AssessmentCompleteResultDto?> GetLatestAssessmentResultAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var latest = await _context.Assessments
            .Where(a => a.UserId == userId && a.Status == AssessmentStatus.Completed)
            .OrderByDescending(a => a.CompletedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (latest == null) return null;

        var breakdown = string.IsNullOrEmpty(latest.SkillBreakdownJson)
            ? new Dictionary<string, double>()
            : JsonSerializer.Deserialize<Dictionary<string, double>>(latest.SkillBreakdownJson) ?? new Dictionary<string, double>();

        var weakSkills = string.IsNullOrEmpty(latest.WeakSkillsJson)
            ? new List<string>()
            : JsonSerializer.Deserialize<List<string>>(latest.WeakSkillsJson) ?? new List<string>();

        var activePath = await _context.LearningPaths
            .Where(p => p.UserId == userId && p.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        return new AssessmentCompleteResultDto
        {
            OverallScore = latest.OverallScore ?? 0,
            CefrLevel = latest.ResultLevel?.ToString() ?? "A1",
            SkillBreakdown = breakdown,
            WeakSkills = weakSkills,
            LearningPathId = activePath?.Id ?? Guid.Empty
        };
    }

    private async Task<SubmitResultDto> GradeObjectiveSectionAsync(Guid assessmentId, Guid userId, SkillType skill, SubmitAnswersRequest request, CancellationToken cancellationToken)
    {
        int correctCount = 0;
        int totalCount = 0;
        var feedbacks = new List<string>();

        foreach (var answerItem in request.Answers)
        {
            var question = await _context.AssessmentQuestions.FindAsync(new object[] { answerItem.QuestionId }, cancellationToken);
            if (question == null || question.Skill != skill) continue;

            var dbAnswer = await _context.AssessmentAnswers
                .FirstOrDefaultAsync(a => a.AssessmentId == assessmentId && a.AssessmentQuestionId == question.Id, cancellationToken);

            if (dbAnswer == null) continue;

            // Correct answer validation
            string cleanedCorrect = CleanCorrectAnswer(question.CorrectAnswerJson);
            string cleanedUser = (answerItem.Answer ?? string.Empty).Trim().ToLower();

            bool isCorrect = cleanedUser == cleanedCorrect;
            if (isCorrect) correctCount++;
            totalCount++;

            dbAnswer.AnswerText = answerItem.Answer;
            dbAnswer.Score = isCorrect ? 100.0 : 0.0;
            dbAnswer.Feedback = isCorrect ? "Correct!" : $"Incorrect. Correct answer was {cleanedCorrect.ToUpper()}.";
            dbAnswer.CreatedAt = DateTime.UtcNow;

            feedbacks.Add(dbAnswer.Feedback);
        }

        double sectionScore = totalCount == 0 ? 0.0 : ((double)correctCount / totalCount) * 100.0;

        var assessment = await _context.Assessments.FindAsync(new object[] { assessmentId }, cancellationToken);
        if (assessment != null)
        {
            if (skill == SkillType.Listening) assessment.ListeningScore = sectionScore;
            else if (skill == SkillType.Reading) assessment.ReadingScore = sectionScore;

            await UpsertSectionAsync(assessmentId, skill, sectionScore, string.Join("; ", feedbacks), cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return new SubmitResultDto
        {
            Score = sectionScore,
            Feedback = $"Correct: {correctCount}/{totalCount}. Score: {Math.Round(sectionScore, 1)}%"
        };
    }

    private static string CleanCorrectAnswer(string? json)
    {
        if (string.IsNullOrEmpty(json)) return string.Empty;
        try
        {
            // Try to deserialize if it's a JSON array/string
            var parsed = JsonSerializer.Deserialize<string>(json);
            return (parsed ?? string.Empty).Trim().ToLower();
        }
        catch
        {
            return json.Trim().ToLower();
        }
    }

    private async Task UpsertSectionAsync(Guid assessmentId, SkillType skill, double score, string feedback, CancellationToken cancellationToken)
    {
        var section = await _context.AssessmentSections
            .FirstOrDefaultAsync(s => s.AssessmentId == assessmentId && s.Skill == skill, cancellationToken);

        if (section == null)
        {
            _context.AssessmentSections.Add(new AssessmentSection
            {
                Id = Guid.NewGuid(),
                AssessmentId = assessmentId,
                Skill = skill,
                Score = score,
                MaxScore = 100,
                Feedback = feedback,
                CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            section.Score = score;
            section.Feedback = feedback;
            section.CreatedAt = DateTime.UtcNow;
        }
    }

    private async Task<LearningPath> CreateLearningPathInternalAsync(User user, CefrLevel level, LevelSource source, List<string> weakSkills, CancellationToken cancellationToken)
    {
        // Deactivate old active paths
        var activePaths = await _context.LearningPaths
            .Where(p => p.UserId == user.Id && p.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var oldPath in activePaths)
        {
            oldPath.IsActive = false;
        }

        // Fetch curated lessons matching CEFR Level
        var curatedLessons = await _context.Lessons
            .Where(l => l.CefrLevel == level && l.IsPublished)
            .OrderBy(l => l.OrderIndex)
            .Select(l => l.Title)
            .ToListAsync(cancellationToken);

        if (curatedLessons.Count == 0)
        {
            curatedLessons.Add("Greetings and Introductions");
            curatedLessons.Add("Present Simple Tense");
        }

        string description = $"Roadmap generated automatically from your diagnostic test performance.";
        try
        {
            var aiText = await _aiProvider.GenerateLearningPathAsync(level, user.SourceLanguageCode, weakSkills, cancellationToken);
            var aiData = JsonSerializer.Deserialize<Dictionary<string, object>>(aiText);
            if (aiData != null && aiData.TryGetValue("description", out var descVal))
            {
                description = descVal.ToString() ?? description;
            }
        }
        catch
        {
            // Fallback gracefully
        }

        var path = new LearningPath
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TargetLanguageCode = "en",
            SourceLanguageCode = user.SourceLanguageCode,
            CefrLevel = level,
            Title = $"Roadmap based on Assessment ({level})",
            Description = description,
            RecommendedLessonsJson = JsonSerializer.Serialize(curatedLessons),
            WeakSkillsJson = JsonSerializer.Serialize(weakSkills),
            GeneratedFrom = source,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.LearningPaths.Add(path);
        return path;
    }

    private static AssessmentQuestionDto MapToQuestionDto(AssessmentQuestion q) => new()
    {
        Id = q.Id,
        Skill = q.Skill.ToString(),
        Level = q.Level.ToString(),
        QuestionText = q.QuestionText,
        Instruction = q.Instruction,
        PassageText = q.PassageText,
        AudioUrl = q.AudioUrl,
        AudioTranscript = q.AudioTranscript,
        SpeakingPrompt = q.SpeakingPrompt,
        WritingPrompt = q.WritingPrompt,
        Options = string.IsNullOrEmpty(q.OptionsJson) 
            ? new List<string>() 
            : JsonSerializer.Deserialize<List<string>>(q.OptionsJson) ?? new List<string>(),
        CorrectAnswer = CleanCorrectAnswer(q.CorrectAnswerJson),
        Explanation = q.Explanation,
        IsAiGenerated = q.IsAiGenerated
    };
}
