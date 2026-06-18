using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SWD392.LantechEnglish.Domain.Entities;

namespace SWD392.LantechEnglish.Infrastructure.Data.Configurations;

public class LanguageConfiguration : IEntityTypeConfiguration<Language>
{
    public void Configure(EntityTypeBuilder<Language> builder)
    {
        builder.ToTable("Languages");
        
        builder.HasKey(l => l.Id);
        
        builder.Property(l => l.Code)
            .IsRequired()
            .HasMaxLength(10);
        
        builder.Property(l => l.Name)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(l => l.NativeName)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(l => l.CreatedAt)
            .IsRequired();
        
        builder.HasIndex(l => l.Code)
            .IsUnique();
    }
}