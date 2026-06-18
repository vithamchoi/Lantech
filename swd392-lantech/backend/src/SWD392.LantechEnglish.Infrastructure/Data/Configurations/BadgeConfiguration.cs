using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SWD392.LantechEnglish.Domain.Entities;

namespace SWD392.LantechEnglish.Infrastructure.Data.Configurations;

public class BadgeConfiguration : IEntityTypeConfiguration<Badge>
{
    public void Configure(EntityTypeBuilder<Badge> builder)
    {
        builder.ToTable("Badges");
        
        builder.HasKey(b => b.Id);
        
        builder.Property(b => b.Code)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(b => b.Description)
            .IsRequired()
            .HasMaxLength(1000);
        
        builder.Property(b => b.IconUrl)
            .HasMaxLength(500);
        
        builder.Property(b => b.ConditionType)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.HasIndex(b => b.Code)
            .IsUnique();
    }
}