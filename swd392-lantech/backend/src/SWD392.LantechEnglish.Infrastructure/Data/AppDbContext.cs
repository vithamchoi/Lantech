using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Domain.Entities;

namespace SWD392.LantechEnglish.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserSkillProfile> UserSkillProfiles => Set<UserSkillProfile>();
    public DbSet<Language> Languages => Set<Language>();
    public DbSet<Assessment> Assessments => Set<Assessment>();
    public DbSet<AssessmentSection> AssessmentSections => Set<AssessmentSection>();
    public DbSet<AssessmentQuestion> AssessmentQuestions => Set<AssessmentQuestion>();
    public DbSet<AssessmentAnswer> AssessmentAnswers => Set<AssessmentAnswer>();
    public DbSet<LearningPath> LearningPaths => Set<LearningPath>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<LessonProgress> LessonProgress => Set<LessonProgress>();
    public DbSet<ExerciseAttempt> ExerciseAttempts => Set<ExerciseAttempt>();
    public DbSet<Vocabulary> Vocabularies => Set<Vocabulary>();
    public DbSet<VocabularyTranslation> VocabularyTranslations => Set<VocabularyTranslation>();
    public DbSet<Flashcard> Flashcards => Set<Flashcard>();
    public DbSet<FlashcardReview> FlashcardReviews => Set<FlashcardReview>();
    public DbSet<PronunciationAttempt> PronunciationAttempts => Set<PronunciationAttempt>();
    public DbSet<PronunciationPhrase> PronunciationPhrases => Set<PronunciationPhrase>();
    public DbSet<Badge> Badges => Set<Badge>();
    public DbSet<UserBadge> UserBadges => Set<UserBadge>();
    public DbSet<XpTransaction> XpTransactions => Set<XpTransaction>();
    public DbSet<StudySession> StudySessions => Set<StudySession>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Tag> Tags => Set<Tag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Apply all configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}